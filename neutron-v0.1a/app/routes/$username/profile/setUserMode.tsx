import type { ActionFunction } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { setFirestoreDocFromData } from "~/firebase/queries.server";
import { cacheObject } from "~/redis/queries.server";
import { requireUser } from "~/session.server"




/** This function sets the current user mode
 * 
 *  (write through - write to cache as well)
 */
export const action: ActionFunction = async ({ request, params }) => {
    const session = await requireUser(request);

    const source = new URL(request.url).searchParams.get('source')
    const metadataRef = await setFirestoreDocFromData({ ...session?.metadata, defaultTestMode: session?.metadata?.defaultTestMode ? !session?.metadata?.defaultTestMode : true }, `metadata`, session?.metadata?.id);
    const cacheRef = await cacheObject(`metadata/${session?.metadata?.id}`, { ...session?.metadata, defaultTestMode: session?.metadata?.defaultTestMode ? !session?.metadata?.defaultTestMode : true })

    return redirect(source);
}  