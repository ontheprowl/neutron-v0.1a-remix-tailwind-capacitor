import { ActionFunction, redirect } from "@remix-run/server-runtime";
import { randomUUID } from "crypto";
import { json } from "remix-utils";
import { addFirestoreDocFromData, getSingleDoc, sendChatMessage, sendEvent } from "~/firebase/queries.server";
import { Dispute, DisputeSeverity, DisputeStatus, DisputeType } from "~/models/disputes";
import { ContractEvent, EventType } from "~/models/events";
import { requireUser } from "~/session.server";


export const action: ActionFunction = async ({ request, params }) => {

    const session = await requireUser(request);


    if (session) {
        console.dir("REQUEST RECEIVED AT DISPUTE CREATION HANDLER")

        const data = await request.formData();

        const payload = JSON.parse(data.get('payload') as string);
        const contractID = params.contractID;
        const currentContract = payload.contract;
        const currentMilestone = payload.milestone;
        const nextMilestoneIndex = payload.nextMilestoneIndex;

        const viewers = payload.viewers;

        const disputeType: DisputeType = Number.parseInt(payload.disputeType);
        let disputeSeverity: DisputeSeverity = DisputeSeverity.Low;

        switch (disputeType) {
            case DisputeType.DeadlineExtension:
                disputeSeverity = DisputeSeverity.Low
                break;
            case DisputeType.QualityIssue:
                disputeSeverity = DisputeSeverity.Medium;
                break;
            case DisputeType.Fraud:
                disputeSeverity = DisputeSeverity.Urgent;
                break;
        }

        const description = payload?.description;
        const contractName = payload?.contractName;
        const raisedBy = payload?.raisedBy;
        const extension = payload?.extension;


        //* Retrieve client and service provider details from the contract 
        const clientEmail = currentContract.clientEmail;
        const providerEmail = currentContract.providerEmail;
        const clientID = currentContract.clientID;
        const providerID = currentContract.providerID;
        const clientName = currentContract.clientName;
        const providerName = currentContract.providerName;



        const ownerUsername = params.username
        const contractOwner = await getSingleDoc(`userUIDS/${ownerUsername}`);
        const newDispute: Dispute = { contractID: contractID, data: disputeType == DisputeType.DeadlineExtension ? { extension: extension } : {}, currentMilestone: currentMilestone, nextMilestoneIndex: nextMilestoneIndex, description: description, type: disputeType, severity: disputeSeverity, raisedBy: raisedBy, status: DisputeStatus.Raised, client: { email: clientEmail, id: clientID, name: clientName }, provider: { email: providerEmail, id: providerID, name: providerName }, contractName: contractName, viewers: [clientID, providerID] }

        console.dir(newDispute)
        const disputeRef = await addFirestoreDocFromData(newDispute, 'disputes');

        const disputeRegisteredEvent = {
            type: EventType.ContractEvent, event: ContractEvent.ContractDisputeRegistered,
            id: contractID, uid: session?.metadata?.id, payload: { data: { dispute: { ...newDispute, id: disputeRef.id }, contract: currentContract, currentMilestone: currentMilestone, nextMilestoneIndex: nextMilestoneIndex }, message: "A dispute has been registered for this contract" }
        }

        const initialMessage = await sendChatMessage(disputeType == DisputeType.Fraud ? "Fraud has been reported for this contract. The Neutron team will contact both parties in order to resolve this dispute. " : description, disputeType == DisputeType.DeadlineExtension ? providerID : clientID, disputeType == DisputeType.DeadlineExtension ? clientID : providerID, disputeRef.id)

        const eventRef = await sendEvent(disputeRegisteredEvent, viewers);
        return redirect(`/${session?.metadata?.displayName}/disputes/${disputeRef.id}`);
    } else {
        throw Error("Invalid permissions to access this function...");
    }
}