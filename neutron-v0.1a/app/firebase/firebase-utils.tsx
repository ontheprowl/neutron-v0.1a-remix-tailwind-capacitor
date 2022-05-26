import type { Auth} from "firebase/auth";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";



export const login = (auth: Auth, email: string, pass: string) => {
  signInWithEmailAndPassword(auth, email, pass);
};
export const logout = (auth: Auth) => {
  signOut(auth);
};
