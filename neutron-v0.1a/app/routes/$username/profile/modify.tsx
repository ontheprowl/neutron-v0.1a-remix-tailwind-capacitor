import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/server-runtime"
import { deleteFirestoreDoc, setFirestoreDocFromData } from "~/firebase/queries.server";
import { requireUser } from "~/session.server";




export const action: ActionFunction = async ({ request }) => {
    const session = await requireUser(request, true);

    if (!session) {
        return redirect('/login')
    }

    const dataString = (await request.formData()).get('payload')?.toString();
    const data = JSON.parse(dataString);

    if (session?.metadata?.displayName && data.displayName && data.displayName != session.metadata.displayName) {
        await deleteFirestoreDoc('userUIDS', `${session.metadata.displayName}`)
        const userUIDRef = await setFirestoreDocFromData({ uid: session.metadata.id }, 'userUIDS', `${data.displayName}`)

    }
    const metadataRef = await setFirestoreDocFromData({ ...session.metadata, ...data }, `metadata`, session?.metadata?.id);


    return json({status:"success",message:`details updated successfully for user ${session.metadata?.id} `})
}