import { json, redirect } from "@remix-run/server-runtime";
import { push, ref, set } from "firebase/database";

import { getDocs, collection, DocumentData, addDoc, setDoc, doc, getDoc, DocumentReference, deleteDoc } from "firebase/firestore";
import { toolresults_v1beta3 } from "googleapis";
import { db, firestore } from "~/firebase/neutron-config.server";



export async function getFirebaseDocs(collectionName: string, onlyKeys?: boolean): Promise<DocumentData[]> {
    const querySnapshot = await getDocs(collection(firestore, collectionName));
    const result: any[] = []

    if (onlyKeys) {
        querySnapshot.forEach((doc) => {
            result.push(doc.id);
        });
    }
    else {
        querySnapshot.forEach((doc) => {
            result.push({id: doc.id, data: doc.data()});
        });
    }

    return result;
}




export async function addFirestoreDocFromData(data: any, collectionName: string, shouldRedirect?: boolean, redirectTo?: string): Promise<DocumentReference<any>> {

    console.log('FULL CONTRACT BEING ADDED (server-side) \n');
    const docRef = await addDoc(collection(firestore, collectionName), data);
    console.log(`Object added to firestore with id ${docRef}`);
    return docRef
}


export async function setFirestoreDocFromData(data: any, collectionName: string, path: string): Promise<DocumentReference<any>> {

    const docRef = doc(firestore, `${collectionName}/${path}`)
    await setDoc(docRef, data);
    console.log(`Object added to firestore with id ${docRef}`);
    return docRef;
}

export async function deleteFirestoreDoc(collectionName: string, path: string): Promise<DocumentReference<any>> {
    const docRef = doc(firestore, `${collectionName}/${path}`)
    await deleteDoc(docRef);
    console.log(`document deleted`);
    return docRef
}


export async function getSingleDoc(docPath: string): Promise<DocumentData | undefined> {
    const currentDoc = await getDoc(doc(firestore, docPath));
    return currentDoc.data()

}


export async function sendChatMessage(message: string, from: string, to: string): Promise<Boolean> {

    try {
        const result = await set(push(ref(db, 'messages/' + btoa((from + to).split('').sort().join('')))), { text: message, to: to, from: from, timestamp: new Date().toUTCString() })
        return true
    }
    catch (e) {
        throw e
    }


}