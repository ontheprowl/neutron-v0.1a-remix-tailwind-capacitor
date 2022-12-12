import type { ActionFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { randomUUID } from "crypto";
import { redirectBack } from "remix-utils";
import { getSingleDoc, sendEvent, updateFirestoreDocFromData } from "~/firebase/queries.server";
import type { Revision } from "~/models/contracts";
import { DeliverableStatus } from "~/models/contracts";
import type { NeutronEvent } from "~/models/events";
import { ContractEvent, EventType } from "~/models/events";
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
    const viewers = payload?.viewers;
    const newRevisions = Number.parseInt(payload?.revisions) - 1;
    if (session && contractID) {
        const revision: Revision = { id: randomUUID(), description: description }

        const milestonePayload: { [key: string]: any } = {}
        milestonePayload['revisions'] = newRevisions;
        milestonePayload[`milestones.workMilestones.${milestoneIndex}.status`] = DeliverableStatus.InFeedback;
        milestonePayload[`milestones.workMilestones.${milestoneIndex}.revision`] = revision;
        const revisionRef = await updateFirestoreDocFromData(milestonePayload, `contracts`, contractID);
        const milestoneFeedbackEvent: NeutronEvent = { type: EventType.ContractEvent, event: ContractEvent.ContractMilestoneInFeedback, id: contractID, uid: session.metadata?.id, payload: { data: { milestone: milestone, milestoneIndex: milestoneIndex, revision: revision }, message: ' A revision request has been acknowledged for a milestone in this contract' } }
        await sendEvent(milestoneFeedbackEvent, viewers, session?.metadata?.defaultTestMode);
        return redirectBack(request, { fallback: '/' });

    } else {
        return json({ result: 'failed', message: 'The current user does not have the permission to access this function' });
    }

}