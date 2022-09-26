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
        const queuedContract = await getSingleDoc(`contracts/${contractID}`);
        console.dir("queued contract milestones are ")

        if (queuedContract?.milestones?.advance) {
            const queuedMilestone = queuedContract?.milestones?.advance;
            const nextMilestoneIndex = 0;
            const beneficiaryMetadata = await getSingleDoc(`beneficiaries/${queuedContract.providerEmail}`);

            const payinCompletedAndAdvanceQueuedEvent: NeutronEvent = { event: ContractEvent.ContractPayinCompleted, type: EventType.ContractEvent, payload: { data: { contractID: contractID, order_id: orderID, order_token: orderToken, queuedMilestone: queuedMilestone, milestones: queuedContract?.milestones, beneficiaryData: beneficiaryMetadata, milestoneType: 'advance', nextMilestoneIndex: nextMilestoneIndex, ownerUsername: ownerUsername }, message: 'Payin was completed for a contract. Queuing advance payout next...' }, uid: ownerUID, id: contractID }
            await sendEvent(payinCompletedAndAdvanceQueuedEvent, queuedContract?.viewers);

        } else {
            const queuedMilestone = queuedContract?.milestones?.workMilestones['0'];
            const nextMilestoneIndex = 0;
            const payinCompletedAndFirstMilestoneEvent: NeutronEvent = { event: ContractEvent.ContractPayinCompleted, type: EventType.ContractEvent, payload: { data: { contractID: contractID, order_id: orderID, order_token: orderToken, queuedMilestone: queuedMilestone, milestones: queuedContract?.milestones, milestoneType: 'deliverable', nextMilestoneIndex: nextMilestoneIndex, ownerUsername: ownerUsername }, message: 'Payin was completed for a contract. Queuing first milestone next...' }, uid: ownerUID, id: contractID }
            await sendEvent(payinCompletedAndFirstMilestoneEvent, queuedContract?.viewers);
        }

        return redirect(`/${ownerUsername}/contracts/${contractID}`)
    }

}


export const action: ActionFunction = async ({ request, params }) => {
    return null;
}

export default function SuccessfulPayment() {

    return (<p> Successful Payment </p>)
}