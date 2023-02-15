import type React from 'react';
import { useEffect, useState } from 'react';


/**
 * Utility hook that returns a persistent reference to an item stored in the browser's LocalStorage 
 * 
 * 
 * @param itemKey The key against which to query and store the LocalStorage item
 * @param
 */
export function useLocalStorage(itemKey: string, defaultValue: any): (any | React.Dispatch<any>)[] {

    let localInitializer = null

    if (window) localInitializer = window.localStorage.getItem(itemKey)

    const [localStorageItem, setLocalStorageItem] = useState(localInitializer != null ? localInitializer : defaultValue);

    useEffect(() => {
        window.localStorage.setItem(itemKey, localStorageItem);
    }, [localStorageItem, itemKey]);


    return [localStorageItem, setLocalStorageItem];
}
