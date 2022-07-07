import bcrypt from "bcryptjs";
import {
  createUserWithEmailAndPassword,
  getAdditionalUserInfo,
  getAuth,
  signInWithEmailAndPassword,
  User,
  UserCredential,
} from "firebase/auth";
import { randomUUID } from "crypto";

import { auth } from "~/firebase/neutron-config.server";
import { getSingleDoc } from "~/firebase/queries.server";
import { json } from "@remix-run/server-runtime";

// function generateDefaultUserStateFromFirebaseUser(user: User): UserState {
//   const state : UserState = {name:user.displayName?user.displayName:'',id:user.uid,profileUrl:user.photoURL,user.userName:''}
// }

export async function signUp(email: string, password: string) {
  const auth = getAuth();
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function logIn(email: string, password: string) {
  const auth = getAuth();
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signIn(email: string, password: string) {
  const auth = getAuth();
  return signInWithEmailAndPassword(
    auth,
    email?.toString(),
    password?.toString()
  );
}

export async function isViewerOwner(session: any, username: string) {
  const uidMapping = await getSingleDoc(`/users/${username}`);
  const requestedUID = uidMapping?.uid;
  console.log("Current User is ");
  console.dir(session?.metadata);
  if (session?.metadata?.id == requestedUID) {
    return true;
  } else {
    return false;
  }
}
