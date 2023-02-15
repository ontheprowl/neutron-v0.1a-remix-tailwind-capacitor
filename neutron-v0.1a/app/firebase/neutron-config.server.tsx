// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import admin from 'firebase-admin';
import { applicationDefault, initializeApp as initializeAdminApp } from "firebase-admin/app";
import { getSingleDoc } from "./queries.server";
import { serverApp, serverAuth, serverDatabase, serverFirestore, serverStorage } from "./firebase-exports.server";


require('dotenv').config();


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCXelxFP9GVMAz_VF54yVPSEk0bS9JDoT0",
  authDomain: "neutron-expo.firebaseapp.com",
  databaseURL: "https://neutron-expo-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "neutron-expo",
  storageBucket: "neutron-expo.appspot.com",
  messagingSenderId: "611788892898",
  appId: "1:611788892898:web:8a3948fd6ca9131cbdccbb",
  measurementId: "G-K6BY8CN4TL",
};

export const sessionTTL = 60 * 60 * 24 * 7;

// Initialize Firebase
if (!admin.apps.length) {
  initializeAdminApp({
    credential: applicationDefault(),
    databaseURL: "https://neutron-expo-default-rtdb.asia-southeast1.firebasedatabase.app"
  });
}

export const adminAuth = admin.auth();
export const adminMessaging = admin.messaging();
export const adminFirestore = admin.firestore();
export const app = serverApp.initializeApp(firebaseConfig);
export const auth = serverAuth.getAuth(app);
export const firestore = serverFirestore.getFirestore(app);
export const storage = serverStorage.getStorage(app);
export const db = serverDatabase.getDatabase(app);


export async function getSessionToken(idToken: string) {
  const decodedToken = await adminAuth.verifyIdToken(idToken);
  if (new Date().getTime() / 1000 - decodedToken.auth_time > 5 * 60) {
    throw new Error("Log-in is outdated.....");
  }
  return adminAuth.createSessionCookie(idToken, { expiresIn: sessionTTL * 1000 })
}



export async function getUserMetadata(path: string) {

  const data = await getSingleDoc(path);
  return data
}
// export const fbProvider = new FacebookAuthProvider();
// export const phoneProvider = new PhoneAuthProvider(auth);
// export const emailProvider = new EmailAuthProvider();


// oAuth2Client.getToken(code, (err, token) => {
//   if (err) return console.error('Error retrieving access token', err);
//   oAuth2Client.setCredentials(token);
//   // Store the token to disk for later program executions
//   fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
//       if (err) return console.error(err);
//       
//   });
//   callback(oAuth2Client);
// });