import type { ActionFunction, LoaderFunction} from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { sendEvent, updateFirestoreDocFromData } from "~/firebase/queries.server";
import { DisputeStatus } from "~/models/disputes";
import type { NeutronEvent } from "~/models/events";
import { ContractEvent, EventType } from "~/models/events";
import { requireUser } from "~/session.server";



export const action: ActionFunction = async ({ request, params }) => {
    const session = await requireUser(request);
    const formData = await request.formData();
    const payload = JSON.parse(formData.get('payload'));

    const contractID = payload.contractID;
    const milestone = payload.milestone;
    const dispute = payload.dispute;
    const viewers = payload.viewers;
    const nextMilestoneIndex = payload.nextMilestoneIndex;
    const disputeID = params.disputeID;

    const disputePayload: { [x: string]: any } = {};
    disputePayload['status'] = DisputeStatus.Rejected;

    const disputeRef = await updateFirestoreDocFromData(disputePayload, 'disputes', `${disputeID}`);

    const disputeRejectedEvent: NeutronEvent = { type: EventType.ContractEvent, event: ContractEvent.ContractDisputeRejected, uid: session?.metadata?.id, id: contractID, payload: { data: { queuedMilestone: milestone, nextMilestoneIndex: nextMilestoneIndex, dispute: dispute, disputeID: disputeID }, message: 'A contract dispute has been rejected' } }

    const eventRef = await sendEvent(disputeRejectedEvent, viewers, session?.metadata?.defaultTestMode);
    return redirect(`${session?.metadata?.displayName}/disputes`);

}

export const loader: LoaderFunction = async ({ request, params }) => {
    return 'hi'
}