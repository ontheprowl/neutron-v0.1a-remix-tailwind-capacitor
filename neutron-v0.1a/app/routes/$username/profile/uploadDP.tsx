import { ActionFunction, json, redirect, UploadHandler, unstable_parseMultipartFormData as parseMultipartFormData } from "@remix-run/server-runtime";
import { getDownloadURL, getStorage, ref, uploadBytes, uploadBytesResumable, UploadResult, UploadTask, UploadTask, UploadTaskSnapshot, UploadTaskSnapshot } from "firebase/storage";
import createFirebaseStorageFileHandler from "~/firebase/FirebaseUploadHandler";

import { storage } from "~/firebase/neutron-config.server";
import { deleteFirestoreDoc, setFirestoreDocFromData } from "~/firebase/queries.server";
import { requireUser } from "~/session.server";

export const action: ActionFunction = async ({ request }) => {
    console.log("REQUEST ARRIVED")

    const session = await requireUser(request, true);

    if (!session) {
        return redirect('/login')
    }

    const formData = await parseMultipartFormData(request, createFirebaseStorageFileHandler({
        async uploadRoutine(buffer, session, filename) {
            console.log("Entered upload Routine")
            const storageRef = ref(storage, `users/images/${session.metadata?.id}/${filename}`)
            console.log("ref generated")

            const snapshot: UploadTaskSnapshot = await uploadBytesResumable( storageRef, buffer.buffer );
            console.log(snapshot.metadata)
            console.log('Profile Picture uploaded to storage....');
            while(snapshot.state != "success"){
                console.log("Still running")
            }
            return getDownloadURL(snapshot.ref)
            
        }, session: session
    }));

    const dpInputPath = formData.get("dpFile");
    console.log(`The dp has been uploaded to : ${dpInputPath}`)
    const metadataRef = await setFirestoreDocFromData({ ...session.metadata, photoURL: dpInputPath }, `metadata`, session?.metadata?.id);


    // const blob: Blob = await (await request.blob());
    // console.log(file)

    return json({ status: "success", message: `profile picture updated successfully for user ${session.metadata?.id} ` })
}