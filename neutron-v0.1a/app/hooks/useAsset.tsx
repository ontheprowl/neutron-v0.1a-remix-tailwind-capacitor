


import { useEffect, useState } from "react"
import { db } from '~/utils/db.client'
import { toDataURL } from "~/utils/utils.client"


/** This hook loads a resource from an asset URL, caching through to the browser's local storage */
export default function useAsset(defaultAssetURL: string) {

    const [assetData, setAssetData] = useState<string>(defaultAssetURL)


    useEffect(() => {
        const assetRoutine = async () => {
            const result = await db.userImages.get(defaultAssetURL);
            if (result) {
                setAssetData(result.data)
            } else {
                toDataURL(defaultAssetURL, function (data) {
                    db.userImages.add({ url: defaultAssetURL, data: data }, defaultAssetURL).then((result) => {
                        setAssetData(defaultAssetURL)
                    })
                })
            }

        }
        assetRoutine()
    })

    return assetData

}

