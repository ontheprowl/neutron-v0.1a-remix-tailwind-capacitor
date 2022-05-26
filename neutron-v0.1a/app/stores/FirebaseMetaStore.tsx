import { Store } from "pullstate";
import type { Auth } from "firebase/auth";
import { FirebaseApp } from "firebase/app";
import { auth, app } from "../firebase/neutron-config.server";
interface IFirebaseStore {
  auth: Auth;
  app: FirebaseApp;
}

export const FirebaseMetaStore = new Store<IFirebaseStore>({
  auth: auth,
  app: app,
});
