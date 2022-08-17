import { ActionFunction, LoaderFunction, redirect } from "@remix-run/server-runtime"
import { getSingleDoc, sendEvent } from "~/firebase/queries.server";
import { ContractEvent, EventType, NeutronEvent, NeutronEvent } from "~/models/events";
import { requireUser } from "~/session.server";





export const loader: LoaderFunction = async ({ request, params }) => {

    const session = await requireUser(request, true);
    const url = new URL(request.url);
    const orderID = url.searchParams.get("order_id");
    const orderToken = url.searchParams.get("order_token");

    if (session) {
        console.log("PAYMENT SUCCESS NOTIFICATION RECEIVED...")
        console.log("PARAMS ARE ");
        console.dir(params);
        const contractID = params.contractID;
        const ownerUsername = params.username;

        const uidMapping = await getSingleDoc(`/userUIDS/${ownerUsername}`);
        const ownerUID = uidMapping?.uid;
        const queuedContract = await getSingleDoc(`users/contracts/${ownerUID}/${contractID}`);
        console.dir("queued contract milestones are ")
        const queuedMilestone = queuedContract?.milestones?.advance ? queuedContract?.milestones?.advance : queuedContract?.milestones?.workMilestones['0'];
        const nextMilestoneIndex = queuedContract?.milestones?.advance ? 0 : 1;
        const payinCompletedEvent: NeutronEvent = { event: ContractEvent.ContractPayinCompleted, type: EventType.ContractEvent, payload: { data: { contractID: contractID, order_id: orderID, order_token: orderToken, queuedMilestone: queuedMilestone, cursor: nextMilestoneIndex }, message: 'Payin was completed for a contract' }, uid: ownerUID, id: contractID }
        await sendEvent(payinCompletedEvent);
        return redirect(`/${ownerUsername}/contracts/${contractID}`)
    }

}


export const action: ActionFunction = async ({ request, params }) => {
    return null;
}

export default function SuccessfulPayment() {

    return (<p> Successful Payment </p>)
}