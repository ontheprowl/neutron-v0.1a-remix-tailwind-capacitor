import type { ActionFunction} from "@remix-run/server-runtime";
import { redirect} from "@remix-run/server-runtime";
import { setFirestoreDocFromData } from "~/firebase/queries.server";
import { requireUser } from "~/session.server"




export const action: ActionFunction = async ({ request, params }) => {

    const session = await requireUser(request);
    const metadataRef = await setFirestoreDocFromData({ ...session?.metadata, defaultTestMode: session?.metadata?.defaultTestMode ? !session?.metadata?.defaultTestMode : true }, `metadata`, session?.metadata?.id);
    return redirect(`/`);
}  