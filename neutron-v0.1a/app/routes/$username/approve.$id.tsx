import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/server-runtime";
import { getSingleDoc, sendEvent, updateFirestoreDocFromData } from "~/firebase/queries.server";
import { Contract, DeliverableStatus, Milestone } from "~/models/contracts";
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
    const contractData: Contract = JSON.parse(formData.get('contract'));
    const milestone = formData.get('milestone');
    const milestoneData = JSON.parse(milestone);
    const isLastMilestone = formData.get('isLastMilestone');

    console.log(" IS THIS THE LAST MILESTONE ? " + isLastMilestone);
    const uidMapping = await getSingleDoc(`/userUIDS/${username}`);
    const ownerUID = uidMapping?.uid;
    let milestoneCompletionEvent: NeutronEvent;
    if (!isLastMilestone) {
        const nextMilestoneIndex: string = formData.get('nextMilestoneIndex');
        const nextMilestoneIndexValue = Number(nextMilestoneIndex.replace(/"/g, ``));
        console.log("NEXT MILESTONE INDEX IS " + nextMilestoneIndexValue);
        console.log(MULTIPLE_MILESTONES_LOG_PREFIX + " The next milestone index has been obtained");
        console.dir(contractData.milestones.workMilestones)

        const beneficiaryMetadata = await getSingleDoc(`beneficiaries/${contractData?.providerEmail}`);
        console.dir(beneficiaryMetadata)
        const nextMilestone = contractData?.milestones?.workMilestones[nextMilestoneIndexValue];
        if (nextMilestone) {
            milestoneCompletionEvent = { id: contractID, uid: ownerUID, payload: { data: { milestone: milestoneData, contract: contractData, queuedMilestone: nextMilestone, nextMilestoneIndex: nextMilestoneIndex, beneficiaryData: beneficiaryMetadata, amount: milestoneData.value }, message: "The milestone was completed..." }, type: EventType.ContractEvent, event: ContractEvent.ContractMilestoneCompleted }
            console.dir(milestoneCompletionEvent);
            const milestonePayload: { [key: string]: any } = {};
            milestonePayload[`milestones.workMilestones.${nextMilestoneIndexValue - 1}.status`] = DeliverableStatus.Approved;
            console.dir(milestonePayload)


            const milestoneStatusUpdateRef = await updateFirestoreDocFromData(milestonePayload, `contracts`, contractID);
            const nextMilestoneQueuedEvent = await sendEvent(milestoneCompletionEvent, contractData.viewers);
        }

    } else {
        console.log(MULTIPLE_MILESTONES_LOG_PREFIX + " This milestone was the last milestone");

        const beneficiaryMetadata = await getSingleDoc(`beneficiaries/${contractData?.providerEmail}`);
        console.dir(beneficiaryMetadata)
        // const payinCompletedAndAdvanceQueuedEvent: NeutronEvent = { event: ContractEvent.ContractPayinCompleted, type: EventType.ContractEvent, payload: { data: { contractID: contractID, order_id: orderID, order_token: orderToken, queuedMilestone: queuedMilestone, milestones: queuedContract?.milestones, beneficiaryData: beneficiaryMetadata, milestoneType: 'advance', nextMilestoneIndex: nextMilestoneIndex, ownerUsername: ownerUsername }, message: 'Payin was completed for a contract. Queuing advance payout next...' }, uid: ownerUID, id: contractID }
        // await sendEvent(payinCompletedAndAdvanceQueuedEvent);
        milestoneCompletionEvent = {
            type: EventType.ContractEvent, event: ContractEvent.ContractCompleted,
            id: contractID, uid: ownerUID, payload: { data: { milestone: milestoneData, metadata: session?.metadata, beneficiaryData: beneficiaryMetadata, amount: milestoneData.value, isLastMilestone: isLastMilestone }, message: " The last milestone was completed... " }
        }
        console.dir(milestoneCompletionEvent);
        console.dir(milestoneCompletionEvent);
        const milestonePayload: { [key: string]: any } = {};
        milestonePayload[`milestones.workMilestones.${Object.keys(contractData?.milestones?.workMilestones).length - 1}.status`] = DeliverableStatus.Approved;
        const milestoneStatusUpdateRef = await updateFirestoreDocFromData(milestonePayload, `contracts`, contractID);
        const lastMilestoneCompletedEvent = await sendEvent(milestoneCompletionEvent, contractData.viewers);
    }



    return redirect(`/${username}/contracts/${contractID}`);
}