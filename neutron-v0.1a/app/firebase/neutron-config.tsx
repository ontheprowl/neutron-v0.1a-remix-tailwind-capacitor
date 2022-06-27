// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from 'firebase/auth'
import {getFirestore} from 'firebase/firestore'
import {getStorage} from 'firebase/storage'
import {getDatabase} from 'firebase/database'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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
  measurementId: "G-K6BY8CN4TL"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const db = getDatabase(app);


// oAuth2Client.getToken(code, (err, token) => {
//   if (err) return console.error('Error retrieving access token', err);
//   oAuth2Client.setCredentials(token);
//   // Store the token to disk for later program executions
//   fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
//       if (err) return console.error(err);
//       console.log('Token stored to', TOKEN_PATH);
//   });
//   callback(oAuth2Client);
// });