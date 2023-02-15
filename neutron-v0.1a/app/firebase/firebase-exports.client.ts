import * as app from "firebase/app";
import * as auth from 'firebase/auth'
import * as firestore from 'firebase/firestore'
import * as storage from 'firebase/storage'
import * as database from 'firebase/database'


export const clientFirestore = firestore
export const clientStorage = storage
export const clientDatabase = database
export const clientAuth = auth
export const clientApp = app
export const googleProvider = new auth.GoogleAuthProvider();
export const clientDocRef = clientFirestore.DocumentReference
