




export const getIndexedDBRef = async () => {
    // Check for support.
    if (!('indexedDB' in window)) {
        console.log("This browser doesn't support IndexedDB.");
        return;
    }

    const dbPromise = idb.open('test-db1', 1);
}