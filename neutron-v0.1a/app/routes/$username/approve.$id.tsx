import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/server-runtime";
import { getSingleDoc, sendEvent, updateFirestoreDocFromData } from "~/firebase/queries.server";
import { Milestone } from "~/models/contracts";
import { ContractEvent, EventType, NeutronEvent } from "~/models/events";
import { requireUser } from "~/session.server";
import { MULTIPLE_MILESTONES_LOG_PREFIX } from "~/utils";





export const loader: LoaderFunction = async ({ request, params }) => {
    return null;
}

export const action: ActionFunction = async ({ request, params }) => {

    console.log(MULTIPLE_MILESTONES_LOG_PREFIX + "request received at approval handler")
    const session = await requireUser(request, true);
    const contractID = params.id;
    const username = params.username;
    console.dir(params)

    const formData = await request.formData();
    const contract = formData.get('contract');
    const contractData = JSON.parse(formData.get('contract'));
    const milestone = formData.get('milestone');
    const milestoneData = JSON.parse(milestone);
    const isLastMilestone = formData.get('isLastMilestone');
    const nextMilestoneIndex: string = formData.get('nextMilestoneIndex');
    console.log("NEXT MILESTONE INDEX IS " + nextMilestoneIndex);
    console.log(" IS THIS THE LAST MILESTONE ? " + isLastMilestone);
    const uidMapping = await getSingleDoc(`/userUIDS/${username}`);
    const ownerUID = uidMapping?.uid;
    let milestoneCompletionEvent: NeutronEvent;
    if (!isLastMilestone) {
        console.log(MULTIPLE_MILESTONES_LOG_PREFIX + " The next milestone index has been obtained");
        const nextMilestone = contract?.milestones?.workMilestones[nextMilestoneIndex];
        if (nextMilestone) {
            milestoneCompletionEvent = { id: contractID, uid: ownerUID, payload: { data: { milestone: milestoneData, contract: contractData, queuedMilestone: nextMilestone, nextMilestoneIndex: nextMilestoneIndex }, message: "The milestone was completed..." }, type: EventType.ContractEvent, event: ContractEvent.ContractMilestoneCompleted }
        }
    } else {
        console.log(MULTIPLE_MILESTONES_LOG_PREFIX + " This milestone was the last milestone");

        const beneficiaryMetadata = await getSingleDoc(`beneficiaries/${contractData?.providerEmail}`);
        console.dir(beneficiaryMetadata)
        // const payinCompletedAndAdvanceQueuedEvent: NeutronEvent = { event: ContractEvent.ContractPayinCompleted, type: EventType.ContractEvent, payload: { data: { contractID: contractID, order_id: orderID, order_token: orderToken, queuedMilestone: queuedMilestone, milestones: queuedContract?.milestones, beneficiaryData: beneficiaryMetadata, milestoneType: 'advance', nextMilestoneIndex: nextMilestoneIndex, ownerUsername: ownerUsername }, message: 'Payin was completed for a contract. Queuing advance payout next...' }, uid: ownerUID, id: contractID }
        // await sendEvent(payinCompletedAndAdvanceQueuedEvent);
        milestoneCompletionEvent = {   type: EventType.ContractEvent, event: ContractEvent.ContractCompleted,
            id: contractID, uid: ownerUID, payload: { data: { milestone: milestoneData, metadata: session?.metadata, beneficiaryData: beneficiaryMetadata, amount: milestoneData.value, isLastMilestone: isLastMilestone } }
        }

    }

    console.dir(milestoneCompletionEvent);
    const eventAdded = await sendEvent(milestoneCompletionEvent);

    return redirect(`/${username}/contracts/${contractID}`);
}