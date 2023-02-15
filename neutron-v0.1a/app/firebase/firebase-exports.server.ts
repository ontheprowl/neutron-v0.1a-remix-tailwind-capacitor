import * as app from "firebase/app";
import * as auth from 'firebase/auth'
import * as firestore from 'firebase/firestore'
import * as storage from 'firebase/storage'
import * as database from 'firebase/database'



export const serverFirestore = firestore
export const serverStorage = storage
export const serverDatabase = database
export const serverAuth = auth
export const serverApp = app
export const googleProvider = new auth.GoogleAuthProvider();
export const serverDocRef = serverFirestore.DocumentReference
