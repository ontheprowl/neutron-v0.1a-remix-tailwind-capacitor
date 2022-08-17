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
    const milestone = formData.get('milestone');
    const isLastMilestone = formData.get('isLastMilestone');
    const nextMilestoneIndex: string = formData.get('nextMilestoneIndex');
    const uidMapping = await getSingleDoc(`/userUIDS/${username}`);
    const ownerUID = uidMapping?.uid;
    let milestoneCompletionEvent: NeutronEvent;
    if (nextMilestoneIndex) {
        console.log(MULTIPLE_MILESTONES_LOG_PREFIX + " The next milestone index has been obtained");
        const nextMilestone = contract?.milestones?.workMilestones[nextMilestoneIndex];
        if (nextMilestone) {
            milestoneCompletionEvent = { id: contractID, uid: ownerUID, payload: { data: { milestone: JSON.parse(milestone), contract: JSON.parse(formData.get('contract')), queuedMilestone: nextMilestone, nextMilestoneIndex: nextMilestoneIndex }, message: "The milestone was completed..." }, type: EventType.ContractEvent, event: ContractEvent.ContractMilestoneCompleted }
        }
    } else {
        console.log(MULTIPLE_MILESTONES_LOG_PREFIX + " This milestone was the last milestone");

        milestoneCompletionEvent = {
            id: contractID, uid: ownerUID, payload: { data: { milestone: JSON.parse(milestone), isLastMilestone: isLastMilestone } }
        }


    }
    const eventAdded = await sendEvent(milestoneCompletionEvent);

    return redirect(`/${username}/contracts/${contractID}`)
}