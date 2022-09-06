import type { ActionFunction } from "@remix-run/server-runtime";
import { randomUUID } from "crypto";
import { json } from "remix-utils";
import { addFirestoreDocFromData, getSingleDoc } from "~/firebase/queries.server";
import { Dispute, DisputeSeverity, DisputeStatus, DisputeType } from "~/models/disputes";
import { requireUser } from "~/session.server";


export const action: ActionFunction = async ({ request, params }) => {

    const session = await requireUser(request);


    if (session) {
        console.dir("REQUEST RECEIVED AT DISPUTE CREATION HANDLER")

        const data = await request.formData();

        const payload = JSON.parse(data.get('payload') as string);
        const contractID = params.contractID;
        const currentContract = payload.contract;

        const disputeType: DisputeType = Number.parseInt(payload.disputeType);
        let disputeSeverity: DisputeSeverity = DisputeSeverity.Low;

        switch (disputeType) {
            case DisputeType.DeadlineExtension:
                disputeSeverity = DisputeSeverity.Low
            case DisputeType.QualityIssue:
                disputeSeverity = DisputeSeverity.Medium;
            case DisputeType.Fraud:
                disputeSeverity = DisputeSeverity.Urgent;
        }

        const description = payload?.description;
        const contractName = payload?.contractName;
        const raisedBy = payload?.raisedBy;



        const ownerUsername = params.username
        const contractOwner = await getSingleDoc(`userUIDS/${ownerUsername}`);
        const newDispute: Dispute = { contractID: contractID, description: description, type: disputeType, severity: disputeSeverity, raisedBy: raisedBy, status: DisputeStatus.Raised, contractName: contractName }
        console.dir(newDispute)
        const disputeRef = await addFirestoreDocFromData(newDispute, 'users/disputes', `${contractOwner?.uid}`);

        return json({ id: contractID });
    } else {
        throw Error("Invalid permissions to access this function...");
    }
}