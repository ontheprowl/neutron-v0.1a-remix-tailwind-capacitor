import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/server-runtime";
import { getSingleDoc, sendEvent, updateFirestoreDocFromData } from "~/firebase/queries.server";
import { ContractEvent, EventType, NeutronEvent } from "~/models/events";
import { requireUser } from "~/session.server";





export const loader: LoaderFunction = async ({ request, params }) => {
    return null;
}

// ? Examine this signage function : Why is the redirect leading to the signer's contract page instead of the owner's contract page? 
export const action: ActionFunction = async ({ request, params }) => {

    console.log("request received at signage handler")
    const session = await requireUser(request, true);
    const contractID = params.id;
    const username  = params.username;
    const formData = await request.formData();
    const uidMapping = await getSingleDoc(`/userUIDS/${username}`);
    const ownerUID = uidMapping?.uid;
    const signerEmail = formData.get('email');
    const isClient = formData.get('isClient');

    
    const contractSignEvent: NeutronEvent = { id: contractID, uid: ownerUID, type: EventType.ContractEvent, event: isClient ? ContractEvent.ContractSignedByBoth : ContractEvent.ContractPendingSignByClient }
    const eventAdded = await sendEvent(contractSignEvent);

    return redirect(`/${username}/contracts/${contractID}`)

}