import { useFetcher, useLoaderData, useSubmit } from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { get, query, ref } from "firebase/database";
import { useState } from "react";
import DisputesChatComponent from "~/components/disputes/DisputesChatComponent";
import FormButton from "~/components/inputs/FormButton";
import NeutronModal from "~/components/layout/NeutronModal";
import { DisputeSeverityGenerator, DisputeStatusGenerator } from "~/components/layout/Statuses";
import DisputeViewMobileUI from "~/components/pages/DisputeViewMobileUI";
import { db } from "~/firebase/neutron-config.server";
import { deleteFirestoreDoc, getSingleDoc, sendEvent } from "~/firebase/queries.server";
import type { Dispute } from "~/models/disputes";
import { DisputeType } from "~/models/disputes";
import { DisputeStatus } from "~/models/disputes";
import type { NeutronEvent } from "~/models/events";
import { ContractEvent, EventType } from "~/models/events";
import { requireUser } from "~/session.server";
import { generateTextForDisputeType } from "~/utils/utils";


export const loader: LoaderFunction = async ({ request, params }) => {
    const session = await requireUser(request, true);
    const disputeID = params.disputeID;


    const selectedDispute: Dispute = await getSingleDoc(`disputes/${disputeID}`) as Dispute;

    let messagesArray: Array<{ text: string, to: string, from: string, timestamp: string }> = []
    let from = session?.metadata?.id;
    let to = '';
    if (from == selectedDispute?.client?.id) {
        to = selectedDispute?.provider?.id;
    } else {
        to = selectedDispute?.client?.id;
    }

    if (from && to) {
        const messageQuery = query(ref(db, 'messages/' + btoa((from + to + disputeID).split('').sort().join(''))));


        const snapshot = await get(messageQuery);
        const data = snapshot.val();
        console.log(data)
        if (data) {
            for (const [key, value] of Object.entries(data)) {
                messagesArray.push(value)
            }
            console.log(messagesArray)
        }




        // if (messages.length != messagesArray.length)
        //     setMessages(messagesArray)


    }

    return json({ selectedDispute: { ...selectedDispute, id: disputeID }, from: from, to: to, messages: messagesArray, metadata: session?.metadata });
}



export const action: ActionFunction = async ({ request, params }) => {

    const session = await requireUser(request);
    const formData = await request.formData();
    const payload = JSON.parse(formData.get('payload'));

    const contractID = payload.contractID;
    const milestone = payload.milestone;
    const viewers = payload.viewers;
    const nextMilestoneIndex = payload.nextMilestoneIndex;
    const disputeID = params.disputeID;

    const disputeRef = await deleteFirestoreDoc('disputes', `${disputeID}`);

    const disputeCancelledEvent: NeutronEvent = { type: EventType.ContractEvent, event: ContractEvent.ContractDisputeCancelled, uid: session?.metadata?.id, id: contractID, payload: { data: { queuedMilestone: milestone, nextMilestoneIndex: nextMilestoneIndex }, message: 'A contract dispute has been cancelled. Resuming standard contract flow...' } }

    const eventRef = await sendEvent(disputeCancelledEvent, viewers, session?.metadata?.defaultTestMode);
    return redirect(`${session?.metadata.displayName}/disputes`);

}



export default function DetailedDisputeView() {

    const data = useLoaderData();
    let submit = useSubmit();
    let fetcher = useFetcher();
    const selectedDispute: Dispute = data.selectedDispute;
    const messages = data.messages;
    const metadata = data.metadata;

    const [resolutionModal, setResolutionModal] = useState(false);
    const [rejectionModal, setRejectionModal] = useState(false);
    const [cancelDisputeModal, setCancelDisputeModal] = useState(false);
    const from = data.from;
    const to = data.to;





    return (
        <>
            <div className="hidden sm:flex sm:flex-col sm:h-[90vh]">
                <div className="w-full max-h-48 p-3 ">
                    <div className="flex flex-col items-center justify-between w-full">
                        <div className="flex flex-row w-full h-auto justify-between">
                            <div className="flex flex-col text-white w-full  ">
                                <h1 className="text-[18px] font-gilroy-regular">{selectedDispute.id}</h1>
                                <h2 className="text-[24px] font-gilroy-bold">{generateTextForDisputeType(selectedDispute.type)}</h2>


                            </div>

                            <div className="flex flex-row w-full justify-between  p-4">

                                <DisputeSeverityGenerator severity={selectedDispute.severity}></DisputeSeverityGenerator>
                                <DisputeStatusGenerator status={selectedDispute.status}></DisputeStatusGenerator>

                            </div>
                        </div>
                        <div className="flex flex-row w-full rounded-xl space-x-4 mt-4 justify-between p-4 ">
                            {selectedDispute.raisedBy == metadata?.email && selectedDispute.type != DisputeType.Fraud && selectedDispute.status == DisputeStatus.Raised && <button onClick={() => {
                                setCancelDisputeModal(true);
                            }} className="rounded-lg p-4  w-auto text-white whitespace-nowrap active:bg-red-500 transition-all hover:border-white bg-red-700 border-2 border-transparent"> Cancel Dispute </button>}
                            {selectedDispute.type === DisputeType.QualityIssue && selectedDispute.provider.email == metadata?.email && selectedDispute.status != DisputeStatus.Accepted &&
                                <div className="flex flex-row space-x-3">
                                    <FormButton text="Accept Dispute" onClick={() => { setResolutionModal(true) }}></FormButton>
                                    <FormButton text="Reject" onClick={() => { setRejectionModal(true) }}></FormButton>
                                </div>
                            }
                            {selectedDispute.type === DisputeType.DeadlineExtension && selectedDispute.client.email == metadata?.email && selectedDispute.status == DisputeStatus.Raised &&
                                <div className="flex flex-row space-x-3">
                                    <FormButton text="Accept Extension Request" onClick={() => { setResolutionModal(true) }}></FormButton>
                                    <button className="p-4 text-center w-40 text-white bg-red-800 border-2 border-transparent hover:border-white transition-all rounded-lg" onClick={() => { setRejectionModal(true) }}>Reject</button>
                                </div>
                            }
                        </div>

                    </div>
                </div>
                <DisputesChatComponent disableMessage={selectedDispute.status == DisputeStatus.Accepted ? `This ${generateTextForDisputeType(selectedDispute.type)} request has been accepted ` : selectedDispute.type === DisputeType.Fraud ? '' : `This ${generateTextForDisputeType(selectedDispute.type)} request has been rejected`} disabled={selectedDispute.type === DisputeType.Fraud || (selectedDispute.status == DisputeStatus.Rejected || selectedDispute.status == DisputeStatus.Accepted)} fullHeight from={from} to={to} customKey={selectedDispute.id} messages={messages}></DisputesChatComponent>
                {resolutionModal && <NeutronModal heading={<h1> You are about to accept this dispute  </h1>} onConfirm={() => {
                    const data = new FormData();
                    const payload = { dispute: selectedDispute, disputeID: selectedDispute.id, disputeData: selectedDispute?.data, contractID: selectedDispute.contractID, milestone: selectedDispute.currentMilestone, nextMilestoneIndex: selectedDispute.nextMilestoneIndex, viewers: selectedDispute.viewers }
                    data.append('payload', JSON.stringify(payload))
                    fetcher.submit(data, { method: "post", action: `/${metadata.displayName}/disputes/acceptDispute/${selectedDispute.id}` });
                }} body={<p> {selectedDispute.type == DisputeType.DeadlineExtension ? `The due date for the relevant milestone will be extended by ${selectedDispute.data.extension} days` : 'Upon confirmation, you will now have 7 days to submit an updated deliverable'} </p>} toggleModalFunction={setResolutionModal}></NeutronModal>}
                {
                    rejectionModal && <NeutronModal heading={<h1 className="text-red-700"> Warning: You are about to reject this dispute request   </h1>} onConfirm={() => {
                        const data = new FormData();
                        const payload = { dispute: selectedDispute, disputeID: selectedDispute.id, contractID: selectedDispute.contractID, milestone: selectedDispute.currentMilestone, nextMilestoneIndex: selectedDispute.nextMilestoneIndex, viewers: selectedDispute.viewers }
                        data.append('payload', JSON.stringify(payload))
                        submit(data, { method: "post", action: `/${metadata.displayName}/disputes/rejectDispute/${selectedDispute.id}` });
                    }} body={<p className="font-gilroy-regular text-[10px" > If this is a request for Deadline Extension, the contract will resume <br></br><br></br> If this is an Issue of Quality, the contract will be held until both parties arrive with a settlement</p>} toggleModalFunction={setRejectionModal} ></NeutronModal >}
                {
                    cancelDisputeModal && <NeutronModal heading={<h1> You are about to cancel this dispute  </h1>} onConfirm={() => {
                        const data = new FormData();
                        const payload = { contractID: selectedDispute.contractID, milestone: selectedDispute.currentMilestone, nextMilestoneIndex: selectedDispute.nextMilestoneIndex, viewers: selectedDispute.viewers }
                        data.append('payload', JSON.stringify(payload))
                        submit(data, { method: "post" });
                    }} body={<p className="text-red-700"> Upon confirmation, the dispute will be cancelled, and normal contract flow will resume </p>} toggleModalFunction={setCancelDisputeModal}></NeutronModal>
                }

            </div>
            <DisputeViewMobileUI></DisputeViewMobileUI>
        </>)
}