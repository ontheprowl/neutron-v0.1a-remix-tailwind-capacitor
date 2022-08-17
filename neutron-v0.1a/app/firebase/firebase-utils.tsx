import type { Auth } from "firebase/auth";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getDownloadURL, ref, uploadBytesResumable, UploadTaskSnapshot } from "firebase/storage";
import { storage } from "./neutron-config.server";



export const login = (auth: Auth, email: string, pass: string) => {
  signInWithEmailAndPassword(auth, email, pass);
};
export const logout = (auth: Auth) => {
  signOut(auth);
};


export const generalFilesUploadRoutine = async (buffer: Buffer, session: any, filename: string) => {
  console.log("Entered upload Routine")
  const storageRef = ref(storage, `users/documents/${session.metadata?.id}/${filename}`)
  console.log("ref generated")

  const snapshot: UploadTaskSnapshot = await uploadBytesResumable(storageRef, buffer.buffer);
  console.log(snapshot.metadata)
  console.log('Contract document uploaded to storage....');
  while (snapshot.state != "success") {
    console.log("Still running")
  }
  return getDownloadURL(snapshot.ref)

};