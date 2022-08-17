import { equalTo, get, onChildAdded, onValue, orderByChild, push, query, QueryConstraint, ref, set } from "firebase/database";

import { getDocs, collection, DocumentData, addDoc, setDoc, doc, getDoc, DocumentReference, deleteDoc, updateDoc } from "firebase/firestore";
import { Stringifier } from "postcss";
import { db, firestore } from "~/firebase/neutron-config.server";
import { EventType, NeutronEvent } from "~/models/events";



export async function getFirebaseDocs(collectionName: string, onlyKeys?: boolean, path?: string): Promise<DocumentData[]> {
    const querySnapshot = await getDocs(collection(firestore, collectionName, path ? path : ''));
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

    console.log('FULL CONTRACT BEING ADDED (server-side) \n');
    const docRef = await addDoc(collection(firestore, `${collectionName}/${path}`), data);
    console.log(`Object added to firestore with id ${docRef}`);
    return docRef
}


export async function setFirestoreDocFromData(data: any, collectionName: string, path: string): Promise<DocumentReference<any>> {

    const docRef = doc(firestore, `${collectionName}/${path}`)
    await setDoc(docRef, data);
    console.log(`Object added to firestore with id ${docRef.id}`);
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


export async function sendEvent(eventData: NeutronEvent) {

    try {
        const result = await set(push(ref(db, 'events/' + eventData.type)), { ...eventData, timestamp: new Date().toUTCString() })
        return true
    }
    catch (e) {
        throw e
    }
}

export async function fetchEvents(type: EventType, id?: string, byUser?: boolean): Promise<NeutronEvent[]> {
    let eventsQuery
    console.log(`THE UID for the fetchEvents call is ${id}`)
    if (id) {
        if (byUser) {
            eventsQuery = query(ref(db, 'events/' + type), orderByChild("uid"), equalTo(id));
        }
        else {
            eventsQuery = query(ref(db, 'events/' + type), orderByChild("id"), equalTo(id));
        }
    } else {
        eventsQuery = query(ref(db, 'events/' + type));
    }
    let fetchedEvents: NeutronEvent[] = []

    try {
        onValue(eventsQuery, (snapshot) => {
            const events = snapshot.val();
            if (events) {
                for (const [key, value] of Object.entries(events)) {
                    fetchedEvents.push(value)
                }
            }

        }, (error) => {
            console.log("EVENT SUBSCRIPTION FAILED DUE TO :" + error)
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
        eventsQuery = query(ref(db, 'events/' + type), orderByChild("id"), equalTo(uid));
    }
    else {
        eventsQuery = query(ref(db, 'events/' + type));
    }
    let fetchedEvent: NeutronEvent;
    onChildAdded(eventsQuery, (snapshot) => {
        const event: NeutronEvent = snapshot.val();
        fetchedEvent = event;


    }, (error) => {
        console.log("EVENT SUBSCRIPTION FAILED DUE TO :" + error)
    })
    return fetchedEvent;
}


export async function updateFirestoreDocFromData(data: any, collectionName: string, path: string): Promise<DocumentReference<any>> {
    const updatedDocRef = doc(firestore, collectionName, path)
    await updateDoc(updatedDocRef, data)
    return updatedDocRef
}