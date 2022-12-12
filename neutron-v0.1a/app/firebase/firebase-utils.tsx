import type { Auth } from "firebase/auth";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import type { UploadTaskSnapshot } from "firebase/storage";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "./neutron-config.server";



export const login = (auth: Auth, email: string, pass: string) => {
  signInWithEmailAndPassword(auth, email, pass);
};
export const logout = (auth: Auth) => {
  signOut(auth);
};


export const generalFilesUploadRoutine = async (buffer: Buffer, session: any, filename: string) => {
  const storageRef = ref(storage, `users/documents/${session.metadata?.id}/${filename}`)

  const snapshot: UploadTaskSnapshot = await uploadBytesResumable(storageRef, buffer.buffer);

  while (snapshot.state != "success") {
    continue;
  }
  return getDownloadURL(snapshot.ref)

};