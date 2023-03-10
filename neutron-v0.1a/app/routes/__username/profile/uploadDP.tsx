import type { ActionFunction } from "@remix-run/server-runtime";
import { json, redirect, unstable_parseMultipartFormData as parseMultipartFormData } from "@remix-run/server-runtime";
import type { UploadTaskSnapshot } from "firebase/storage";
import { getDownloadURL, ref, uploadBytesResumable, } from "firebase/storage";
import { juneClient } from "~/analytics/june-config.server";
import createFirebaseStorageFileHandler from "~/firebase/FirebaseUploadHandler";

import { storage } from "~/firebase/neutron-config.server";
import { setFirestoreDocFromData } from "~/firebase/queries.server";
import { requireUser } from "~/session.server";

export const action: ActionFunction = async ({ request }) => {

    const session = await requireUser(request, true);

    if (!session) {
        return redirect('/login')
    }

    const formData = await parseMultipartFormData(request, createFirebaseStorageFileHandler({
        async uploadRoutine(buffer, session, filename) {
            const storageRef = ref(storage, `users/images/${session.metadata?.id}/${filename}`)

            const snapshot: UploadTaskSnapshot = await uploadBytesResumable(storageRef, buffer.buffer);
            while (snapshot.bytesTransferred < snapshot.totalBytes) {
                // * Specific statement to log
                console.log("Bytes transferred : " + (snapshot.totalBytes - snapshot.bytesTransferred));
            }
            return getDownloadURL(snapshot.ref)

        }, session: session
    }));

    const dpInputPath = formData.get("dpFile");
    const metadataRef = await setFirestoreDocFromData({ ...session.metadata, photoURL: dpInputPath }, `metadata`, session?.metadata?.id);

    // const blob: Blob = await (await request.blob());
    // console.log(file)

    return json({ status: "success", message: `profile picture updated successfully for user ${session.metadata?.id} ` })
}