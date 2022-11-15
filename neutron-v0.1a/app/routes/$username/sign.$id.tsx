import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { getSingleDoc, sendEvent, updateFirestoreDocFromData } from "~/firebase/queries.server";
import type { NeutronEvent } from "~/models/events";
import { ContractEvent, EventType } from "~/models/events";
import { requireUser } from "~/session.server";
import { juneClient, trackJuneEvent } from "~/analytics/june-config.server";





export const loader: LoaderFunction = async ({ request, params }) => {
    return null;
}

export const action: ActionFunction = async ({ request, params }) => {

    console.log("request received at signage handler")
    const session = await requireUser(request, true);
    const contractID = params.id;
    const username = params.username;
    const formData = await request.formData();
    const uidMapping = await getSingleDoc(`/userUIDS/${username}`);
    const ownerUID = uidMapping?.uid;
    const signerEmail = formData.get('email');
    const signerID = formData.get('id') as string;
    const signerLegalName = formData.get('legalName');
    const isClient = formData.get('isClient');
    const viewers = JSON.parse(formData.get('viewers'));


    const signDate = new Date().getTime();

    let payload = {}
    if (isClient) {
        payload['signedByClient'] = true;
        payload['signedByClientDate'] = signDate;
    } else {
        payload['signedByProvider'] = true;
        payload['signedByProviderDate'] = signDate;
    }

    const updateRef = await updateFirestoreDocFromData(payload, 'contracts', `${contractID}`);

    trackJuneEvent(signerID, 'Contract Signed', { contractID: contractID }, 'signEvent');

    const contractSignEvent: NeutronEvent = {
        id: contractID, uid: ownerUID, type: EventType.ContractEvent, payload: {
            data: {
                signerEmail: signerEmail,
                signerID: signerID,
                signDate: signDate,
                contractID: updateRef.id
            }, message: ''
        }, event: isClient ? ContractEvent.ContractSignedByBoth : ContractEvent.ContractPendingSignByClient
    }
    const eventAdded = await sendEvent(contractSignEvent, viewers);

    return redirect(`/${username}/contracts/${contractID}`)

}