import { useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { get, onValue, query, ref } from "firebase/database";
import DisputesChatComponent from "~/components/disputes/DisputesChatComponent";
import { DisputeSeverityGenerator } from "~/components/layout/Statuses";
import { db } from "~/firebase/neutron-config.server";
import { getSingleDoc } from "~/firebase/queries.server";
import { Dispute, DisputeType } from "~/models/disputes";
import { DisputeSeverity, DisputeStatus } from "~/models/disputes";
import { requireUser } from "~/session.server";


export const loader: LoaderFunction = async ({ request, params }) => {
    console.log("SERVER SIDE LOADER")
    const session = await requireUser(request, true);
    const disputeID = params.disputeID;
    const viewerUsername = session?.metadata?.displayName;
    const ownerUsername = params.username;
    console.log("DISPUTE ID IS : " + disputeID)


    const selectedDispute: Dispute = await getSingleDoc(`users/disputes/${session?.metadata?.id}/${disputeID}`) as Dispute;
    console.log("SELECTED DISPUTE IS :")
    console.dir(selectedDispute)

    let messagesArray: Array<{ text: string, to: string, from: string, timestamp: string }> = []
    let from = viewerUsername;
    let to = '';
    if (viewerUsername == selectedDispute.client.name) {
        to = selectedDispute?.provider?.name;
    } else {
        to = selectedDispute?.client?.name;
    }

    if (from && to) {
        const messageQuery = query(ref(db, 'messages/' + btoa((from + to + disputeID).split('').sort().join(''))));


        const snapshot = onValue(messageQuery, (snapshot) => {
            const data = snapshot.val();
            console.log(data)
            if (data) {
                for (const [key, value] of Object.entries(data)) {
                    messagesArray.push(value)
                }
                console.log(messagesArray)
            }
        });



        // if (messages.length != messagesArray.length)
        //     setMessages(messagesArray)


    }

    return json({ selectedDispute: { ...selectedDispute, id: disputeID }, from: from, to: to, messages: messagesArray, metadata: session?.metadata });
}




export default function DetailedDisputeView() {


    const data = useLoaderData();
    const selectedDispute: Dispute = data.selectedDispute;
    const messages = data.messages;

    const from = data.from;
    const to = data.to;

    console.log('The messages array is : ')
    console.dir(messages);

    console.dir(selectedDispute);


    function generateTextForDisputeType(type: DisputeType) {
        switch (type) {
            case DisputeType.QualityIssue:
                return 'Issue of Quality';
            case DisputeType.Fraud:
                return 'Fraud';
            case DisputeType.DeadlineExtension:
                return 'Deadline Extension';
        }
    }

    return (<>
        <div className="w-full max-h-48 p-3">
            <div className="flex flex-row items-center justify-between">
                <div className="flex flex-col text-white  w-full ">
                    <h1 className="text-[18px] font-gilroy-regular">{selectedDispute.id}</h1>
                    <h2 className="text-[24px] font-gilroy-bold">{generateTextForDisputeType(selectedDispute.type)}</h2>
                </div>
                <div className="flex flex-row w-full justify-end">
                    <DisputeSeverityGenerator severity={selectedDispute.severity}></DisputeSeverityGenerator>

                </div>
            </div>
        </div>
        <DisputesChatComponent fullHeight from={from} to={to} customKey={selectedDispute.id} messages={messages}></DisputesChatComponent>
    </>)
}