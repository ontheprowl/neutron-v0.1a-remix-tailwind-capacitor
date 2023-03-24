
import { serverDatabase, serverFirestore } from "./firebase-exports.server";


import { db, firestore } from "~/firebase/neutron-config.server";
import type { EventType, NeutronEvent } from "~/models/events";
import { cacheObject, hasKey } from "~/redis/queries.server";



// * Integrate server-side caching here


export async function getFirebaseDocs(collectionName: string, onlyKeys?: boolean, path?: string): Promise<any[]> {
    const querySnapshot = await serverFirestore.getDocs(serverFirestore.collection(firestore, collectionName, path ? path : ''));
    const result: any[] = []

    if (onlyKeys) {
        querySnapshot.forEach((doc) => {
            result.push(doc.id);
        });
    }
    else {
        querySnapshot.forEach((doc) => {
            result.push({ id: doc.id, data: doc.data() });
        });
    }

    return result;
}






export async function addFirestoreDocFromData(data: any, collectionName: string, path?: string): Promise<DocumentReference<any>> {

    const docRef = await serverFirestore.addDoc(serverFirestore.collection(firestore, `${path ? `${collectionName}/${path}` : `${collectionName}`}`), data);
    return docRef
}

export async function addFirestoreDocsAndReturnIDs(data: any[], collectionName: string, path?: string): Promise<string[]> {
    let resultIDS = []
    for (const item of data) {
        const itemUploadRef = await addFirestoreDocFromData(item, collectionName, path);
        resultIDS.push(itemUploadRef.id)
    }
    return resultIDS;
}


export async function setFirestoreDocFromData(data: any, collectionName: string, path: string): Promise<DocumentReference<any>> {
    const pathString = `${collectionName}/${path}`
    // if (await hasKey(pathString)) {
    //     const result = await cacheObject(pathString, data)
    // }
    const docRef = serverFirestore.doc(firestore, pathString)
    await serverFirestore.setDoc(docRef, data);
    return docRef;
}

export async function deleteFirestoreDoc(collectionName: string, path: string): Promise<DocumentReference<any>> {
    const docRef = serverFirestore.doc(firestore, `${collectionName}/${path}`)
    await serverFirestore.deleteDoc(docRef);
    return docRef
}


export async function getSingleDoc(docPath: string): Promise<DocumentData | undefined> {
    const currentDoc = await serverFirestore.getDoc(serverFirestore.doc(firestore, docPath));
    return currentDoc.data()

}


export async function sendChatMessage(message: string, from: string, to: string, key?: string): Promise<Boolean> {

    try {
        const messageKey = key ? from + to + key : from + to;
        const result = await serverDatabase.set(serverDatabase.push(serverDatabase.ref(db, 'messages/' + btoa((messageKey).split('').sort().join('')))), { text: message, to: to, from: from, timestamp: new Date().toUTCString() })
        return true
    }
    catch (e) {
        throw e
    }


}

/**
 * Asynchronous utility function that sends an event to the Neutron Events pipeline 
 * @param eventData The Neutron Event to be sent to the Events pipeline
 * @param viewers An array of UIDs that indicates which users can view this 
 * @param sandbox If true, the event being sent has been generated from a sandbox instance  
 * @returns a promise that returns true
 */
export async function sendEvent(eventData: NeutronEvent, viewers?: string[], sandbox?: boolean): Promise<boolean> {

    try {
        const result = await serverDatabase.set(serverDatabase.push(serverDatabase.ref(db, 'events/' + eventData.type)), { ...eventData, sandbox: sandbox ? sandbox : false, timestamp: new Date().getTime(), viewers: viewers })
        return true
    }
    catch (e) {
        throw e
    }
}

export async function fetchEvents(type: EventType, id?: string, byUser?: boolean): Promise<NeutronEvent[]> {
    let eventsQuery
    if (id) {
        if (byUser) {
            eventsQuery = serverDatabase.query(serverDatabase.ref(db, 'events/' + type), serverDatabase.orderByChild("uid"), serverDatabase.equalTo(id));
        }
        else {
            eventsQuery = serverDatabase.query(serverDatabase.ref(db, 'events/' + type), serverDatabase.orderByChild("id"), serverDatabase.equalTo(id));
        }
    } else {
        eventsQuery = serverDatabase.query(serverDatabase.ref(db, 'events/' + type));
    }
    let fetchedEvents: NeutronEvent[] = []

    try {
        serverDatabase.onValue(eventsQuery, (snapshot) => {
            const events = snapshot.val();
            if (events) {
                for (const [key, value] of Object.entries(events)) {
                    fetchedEvents.push(value)
                }
            }

        }, (error) => {
        })
        // const snapshot = await get(eventsQuery)
        // const events = snapshot.val();
        // if (events) {
        //     for (const [key, value] of Object.entries(events)) {
        //         fetchedEvents.push(value)
        //     }
        // }

        return fetchedEvents;
    } catch (e) {
        return []
    }
}


export async function fetchLatestEvent(type: EventType, uid?: string): Promise<NeutronEvent> {
    let eventsQuery;
    if (uid) {
        eventsQuery = serverDatabase.query(serverDatabase.ref(db, 'events/' + type), serverDatabase.orderByChild("id"), serverDatabase.equalTo(uid));
    }
    else {
        eventsQuery = serverDatabase.query(serverDatabase.ref(db, 'events/' + type));
    }
    let fetchedEvent: NeutronEvent;
    serverDatabase.onChildAdded(eventsQuery, (snapshot) => {
        const event: NeutronEvent = snapshot.val();
        fetchedEvent = event;


    }, (error) => {
    })
    return fetchedEvent;
}


export async function updateFirestoreDocFromData(data: any, collectionName: string, path: string): Promise<DocumentReference<any>> {
    const updatedDocRef = serverFirestore.doc(firestore, collectionName, path)
    await serverFirestore.updateDoc(updatedDocRef, data)
    return updatedDocRef
}