
import { randomUUID } from "crypto";
import { serverDatabase, serverFirestore } from "./firebase-exports.server";


import { adminFirestore, db, firestore } from "~/firebase/neutron-config.server";
import type { EventType, NeutronEvent } from "~/models/events";



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
export async function sendEvent(eventData: NeutronEvent, indexes?: string[], sandbox?: boolean): Promise<boolean> {

    try {
        if (indexes) {
            for (const index of indexes) {
                const indexedByCustomIndex = await serverDatabase.set(serverDatabase.push(serverDatabase.ref(db, eventData.type + "/" + eventData.payload?.data[index])), { ...eventData, sandbox: sandbox ? sandbox : false, timestamp: new Date().getTime() })
            }
        } else {
            const indexedByID = await serverDatabase.set(serverDatabase.push(serverDatabase.ref(db, eventData.type + "/" + eventData.id)), { ...eventData, sandbox: sandbox ? sandbox : false, timestamp: new Date().getTime() })

        }
        return true
    }
    catch (e) {
        throw e
    }
}

export async function deleteEvents(path: string, indexes: string[]): Promise<void> {

    try {
        for (const index of indexes) {
            await serverDatabase.remove(serverDatabase.ref(db, `0/${index}/${path}`))
        }
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


export async function deleteFieldsFromFirestoreDoc(fieldKeys: string[], collectionName: string, path: string): Promise<DocumentReference<any>> {
    const updatedDocRef = serverFirestore.doc(firestore, collectionName, path)
    const updateObject: { [x: string]: any } = {}
    for (const fieldKey of fieldKeys) {
        updateObject[`${fieldKey}`] = serverFirestore.deleteField();
    }
    await serverFirestore.updateDoc(updatedDocRef, updateObject)
    return updatedDocRef
}

export async function uploadBulkToCollection(data: any[], collectionPath: string, batchSize: number, idKey: string) {
    const batches = Math.ceil(data.length / batchSize);


    return new Promise((resolve, reject) => {
        uploadBatch(data, batches, 0, collectionPath, resolve, idKey).catch(reject);
    });
}

export async function uploadBatch(data: any[], batchesLeft: number, offset: number, collectionPath: string, resolve: (value: unknown) => void, idKey: string) {

    if (batchesLeft === 0) {
        // When there are no documents left, we are done
        resolve(batchesLeft);
        return;
    }

    let slice = data;
    if (batchesLeft === 1) {
        slice = data.slice(offset);
    } else {
        slice = data.slice(offset, offset + 500);
    }

    const batch = adminFirestore.batch();

    for (const elem of slice) {
        const slug = elem[idKey];
        const path = `${collectionPath}/${slug ? slug : randomUUID()}`;
        const docRef = adminFirestore.doc(path);
        const doc = await docRef.get();
        if (doc.exists) {
            continue;
        } else {
            batch.create(docRef, elem);
        }

    }

    await batch.commit();

    process.nextTick(() => {
        uploadBatch(data, batchesLeft - 1, offset + 500, collectionPath, resolve, idKey);
    });

}

export async function deleteCollection(collectionPath: string, batchSize: number) {
    const collectionRef = adminFirestore.collection(collectionPath);
    const query = collectionRef.orderBy('__name__').limit(batchSize);

    return new Promise((resolve, reject) => {
        deleteQueryBatch(query, resolve).catch(reject);
    });
}

async function deleteQueryBatch(query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>, resolve: (value: unknown) => void) {
    const snapshot = await query.get();

    const batchSize = snapshot.size;
    if (batchSize === 0) {
        // When there are no documents left, we are done
        resolve(batchSize);
        return;
    }

    // Delete documents in a batch
    const batch = adminFirestore.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();

    // Recurse on the next process tick, to avoid
    // exploding the stack.
    process.nextTick(() => {
        deleteQueryBatch(query, resolve);
    });
}

export async function updateArrayInFirestoreDoc(data: any, arrayKey: string, collectionName: string, path: string): Promise<DocumentReference<any>> {
    const updatedDocRef = serverFirestore.doc(firestore, collectionName, path)
    const updateObject: { [x: string]: any } = {}
    updateObject[`${arrayKey}`] = serverFirestore.arrayUnion(data)
    await serverFirestore.updateDoc(updatedDocRef, updateObject)
    return updatedDocRef
}

export async function removeFromArrayInFirestoreDoc(data: any, arrayKey: string, collectionName: string, path: string): Promise<DocumentReference<any>> {
    const updatedDocRef = serverFirestore.doc(firestore, collectionName, path,)
    const updateObject: { [x: string]: any } = {}
    updateObject[`${arrayKey}`] = serverFirestore.arrayRemove(data)
    await serverFirestore.updateDoc(updatedDocRef, updateObject)
    return updatedDocRef
}