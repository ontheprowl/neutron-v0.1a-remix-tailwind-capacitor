import { ActionFunction, json } from "@remix-run/server-runtime";
import { randomUUID } from "crypto";
import { redirectBack } from "remix-utils";
import { addFirestoreDocFromData, getSingleDoc, sendEvent, updateFirestoreDocFromData } from "~/firebase/queries.server";
import { DeliverableStatus, Milestone, MilestoneStatus, Revision } from "~/models/contracts";
import { ContractEvent, EventType, NeutronEvent } from "~/models/events";
import { requireUser } from "~/session.server";




export const action: ActionFunction = async ({ request, params }) => {

    const session = await requireUser(request);
    const contractID = params.contractID;
    const data = await request.formData();

    const ownerUsername = params.username;
    const uidMapping = await getSingleDoc(`/userUIDS/${ownerUsername}`);
    const ownerUID = uidMapping?.uid;

    const payload = JSON.parse(data.get('payload') as string);

    const milestone = payload?.milestone;
    const milestoneIndex = payload?.milestoneIndex;
    const description = payload?.requestDetails;
    const newRevisions = Number.parseInt(payload?.revisions) - 1;
    if (session && contractID) {
        console.log("Revision request has been submitted for contract with ID : " + contractID + " for milestone with index " + milestoneIndex);
        const revision: Revision = { id: randomUUID(), description: description }

        const milestonePayload: { [key: string]: any } = {}
        milestonePayload['revisions'] = newRevisions;
        milestonePayload[`milestones.workMilestones.${milestoneIndex}.status`] = DeliverableStatus.InFeedback;
        milestonePayload[`milestones.workMilestones.${milestoneIndex}.revision`] = revision;
        console.dir(milestonePayload)
        const revisionRef = await updateFirestoreDocFromData(milestonePayload, `users/contracts/${ownerUID}`, contractID);
        const milestoneFeedbackEvent: NeutronEvent = { type: EventType.ContractEvent, event: ContractEvent.ContractMilestoneInFeedback, id: contractID, uid: session.metadata?.id, payload: { data: { milestone: milestone, milestoneIndex: milestoneIndex, revision: revision }, message: ' A revision request has been acknowledged for a milestone in this contract' } }
        await sendEvent(milestoneFeedbackEvent);
        return redirectBack(request, { fallback: '/' });

    } else {
        return json({ result: 'failed', message: 'The current user does not have the permission to access this function' });
    }

}