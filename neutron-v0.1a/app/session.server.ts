import { getSingleDoc } from "~/firebase/queries.server";
import { createCookieSessionStorage, redirect } from "@remix-run/node";

import {
  adminAuth,
  getSessionToken,
  sessionTTL,
} from "./firebase/neutron-config.server";
import { hasKey, retrieveObject } from "./redis/queries.server";

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    maxAge: 60,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    secrets: ['grajeev','kunalsawant','hushpupper'],
  },
});

const USER_SESSION_KEY = "token";
const USER_METADATA_KEY = "metadata";

export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}


export async function requireUser(request: Request, autoRedirect?: boolean) {
  const session = await getUserSession(request, autoRedirect);
  if (session) return session;

  if (autoRedirect) throw await logout(request);
  return null;
}

export async function createUserSession({
  request,
  userId,
  metadata,
  remember,
  redirectTo,
}: {
  request: Request;
  userId: string;
  metadata?: { path: string };
  remember: boolean;
  redirectTo: string;
}) {
  const token = await getSessionToken(userId);
  const session = await getSession(request);
  session.set(USER_SESSION_KEY, token);
  if (metadata) {
    session.set(USER_METADATA_KEY, metadata);
  }
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: remember
          ? sessionTTL // 7 days
          : undefined,
      }),
    },
  });
}

export async function getUserSession(request: Request, autoRedirect?: boolean) {
  const cookie = await sessionStorage.getSession(request.headers.get("Cookie"));
  const token = cookie.get("token");

  const metadataCookie = cookie.get("metadata");
  let metadata = undefined;
  if (metadataCookie) {
    const path: string = metadataCookie.path;
    //? Change metadata retrieval logic to first attempt to retrieve the metadata from the cache. Default to firestore only when cache miss occurs.
    // console.log("REDIS KEY is : " + redisKey)
    //? Redis build is not stable. Max no. of clients is reached too quickly. Figure out why.
    
    // if(await hasKey(path)){
    //   console.log("Retrieving from redis...")
    //   metadata = await retrieveObject(path)
    // } else {
    //   metadata = await getSingleDoc(path);
    // }
    metadata = await getSingleDoc(path)

  }

  if (!token) {
    return null;
  }

  try {
    const tokenUser = await adminAuth.verifySessionCookie(token, true);

    return { token: tokenUser, metadata: metadata ? metadata : undefined };
  } catch (error) {
    if (autoRedirect) throw redirect("/login");
  }
}

export async function logout(request: Request) {
  const session = await getSession(request);
  return redirect("/login", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}
