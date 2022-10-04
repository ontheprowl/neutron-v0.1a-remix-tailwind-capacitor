import { getSingleDoc } from "~/firebase/queries.server";
import { createCookieSessionStorage, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";

import type { User } from "~/models/user.server";
import {
  adminAuth,
  getSessionToken,
  getUserMetadata,
  sessionTTL,
} from "./firebase/neutron-config.server";

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

export async function getUserId(
  request: Request
): Promise<User["id"] | undefined> {
  const session = await getSession(request);
  const userId = session.get(USER_SESSION_KEY);
  return userId;
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
): Promise<string> {
  const userId = await getUserId(request);
  if (!userId) {
    // const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    return "-1";
  }
  return userId;
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
    const path = metadataCookie.path;
    metadata = await getSingleDoc(path);
  }

  if (!token) {
    console.log("No valid token");
    return null;
  }

  try {
    const tokenUser = await adminAuth.verifySessionCookie(token, true);

    return { token: tokenUser, metadata: metadata ? metadata : undefined };
  } catch (error) {
    console.log(error);
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
