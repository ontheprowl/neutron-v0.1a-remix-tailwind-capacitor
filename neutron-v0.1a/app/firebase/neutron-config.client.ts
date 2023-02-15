// Import the functions you need from the SDKs you need
import { clientApp, clientDatabase } from "./firebase-exports.client";


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



export const app = clientApp.initializeApp(firebaseConfig);
export const db = clientDatabase.getDatabase(app);
export const clientGet = clientDatabase.get
export const clientQuery = clientDatabase.query
export const client_onValue = clientDatabase.onValue
export const clientRef = clientDatabase.ref

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