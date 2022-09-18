import { json, LoaderFunction, redirect } from "@remix-run/node";
import { Outlet, useLoaderData, useNavigate } from "@remix-run/react";
import { onValue, push, query, ref, set } from "firebase/database";
import { ParamHTMLAttributes, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import DisputesChatComponent from "~/components/disputes/DisputesChatComponent";
import DisputesZeroState from "~/components/disputes/DisputesZeroState";
import MobileNavbarPadding from "~/components/layout/MobileNavbarPadding";
import { DisputeSeverityGenerator, DisputeStatusGenerator } from "~/components/layout/Statuses";
import { auth, db } from "~/firebase/neutron-config.server";
import { fetchEvents, getFirebaseDocs, getSingleDoc, sendChatMessage } from "~/firebase/queries.server";
import { ContractCreator } from "~/models/contracts";
import { Dispute, DisputeSeverity, DisputeStatus, DisputeType } from "~/models/disputes";
import { EventType } from "~/models/events";
import { UserState } from "~/models/user";
import { requireUser } from "~/session.server";
import { formatDateToReadableString } from "~/utils/utils";

export const loader: LoaderFunction = async ({ request, params }) => {

    const session = await requireUser(request, true);
    const viewerUsername = session?.metadata?.displayName;
    const ownerUsername = params.username
    const disputesRef = await getFirebaseDocs('users/disputes', false, `${session?.metadata?.id}`);
    let disputes: Dispute[] = [];
    disputesRef.forEach((dispute) => { disputes.push({ ...dispute.data, id: dispute.id }) });

    // const disputes: Dispute[] = [
    //     {
    //         type: DisputeType.QualityIssue,
    //         client: {
    //             id: '3836423947324guj'
    //         },
    //         provider: {
    //             id: "2324167383hfudf"
    //         },
    //         raisedBy: 'Gaurav',
    //         contractName: 'Test',
    //         description: " This dispute is a sample dispute. Let's see what happens...",
    //         status: DisputeStatus.Raised,
    //         severity: DisputeSeverity.Low,
    //         id: "12321312312",
    //         contractID: "2323232323"
    //     },
    //     {
    //         type: DisputeType.QualityIssue,
    //         client: {
    //             id: '3836423947324guj'
    //         },
    //         provider: {
    //             id: "2324167383hfudf"
    //         },
    //         raisedBy: 'Gaurav',
    //         contractName: 'Test',
    //         description: " This dispute is a second sample dispute.",
    //         status: DisputeStatus.Raised,
    //         severity: DisputeSeverity.Low,
    //         id: "526463724617",
    //         contractID: "45w2556256"
    //     },
    //     {
    //         type: DisputeType.QualityIssue,

    //         name: "Dispute 3 ",
    //         client: {
    //             id: '3836423947324guj'
    //         },
    //         provider: {
    //             id: "2324167383hfudf"
    //         },
    //         raisedBy: 'Gaurav',
    //         contractName: 'Test',
    //         description: " This dispute is a third sample dispute.",
    //         status: DisputeStatus.Raised,
    //         severity: DisputeSeverity.Low,
    //         id: "67682576846",
    //         contractID: "45w2556256"
    //     },
    //     {
    //         type: DisputeType.QualityIssue,
    //         client: {
    //             id: '3836423947324guj'
    //         },
    //         provider: {
    //             id: "2324167383hfudf"
    //         },
    //         raisedBy: 'Gaurav',
    //         contractName: 'Test',
    //         description: " This dispute is a second sample dispute.",
    //         status: DisputeStatus.Raised,
    //         severity: DisputeSeverity.Low,
    //         id: "1345433868",
    //         contractID: "2323232323"
    //     },
    //     {
    //         type: DisputeType.QualityIssue,
    //         client: {
    //             id: '3836423947324guj'
    //         },
    //         raisedBy: 'Gaurav',
    //         contractName: 'Test',
    //         provider: {
    //             id: "2324167383hfudf"
    //         },
    //         description: " This dispute is a second sample dispute.",
    //         status: DisputeStatus.Raised,
    //         severity: DisputeSeverity.Low,
    //         id: "89864766456",
    //         contractID: "85673767832"
    //     },
    //     {
    //         type: DisputeType.QualityIssue,
    //         client: {
    //             id: '3836423947324guj'
    //         },
    //         raisedBy: 'Gaurav',
    //         contractName: 'Test',
    //         provider: {
    //             id: "2324167383hfudf"
    //         },
    //         description: " This dispute is a second sample dispute.",
    //         status: DisputeStatus.Raised,
    //         severity: DisputeSeverity.Low,
    //         id: "565736438765",
    //         contractID: "45w2556256"
    //     },
    //     {
    //         type: DisputeType.QualityIssue,
    //         client: {
    //             id: '3836423947324guj'
    //         },
    //         raisedBy: 'Gaurav',
    //         contractName: 'Test',
    //         provider: {
    //             id: "2324167383hfudf"
    //         },
    //         description: " This dispute is a second sample dispute.",
    //         status: DisputeStatus.Raised,
    //         severity: DisputeSeverity.Low,
    //         id: "67675683568",
    //         contractID: "85673767832"
    //     }
    // ]
    //return redirect(`/${ownerUsername}/disputes/${disputes[0].id}`);
    return json({ metadata: session?.metadata, ownerUsername: ownerUsername, disputes: disputes });
}


export default function DisputesIndex() {

    const data = useLoaderData();

    const [selectedIndex, setSelectedIndex] = useState(0)

    console.log(selectedIndex)

    let navigate = useNavigate();


    const metadata = data.metadata;
    const messages = data.result;
    const disputes: Dispute[] = data.disputes;

    const selectedDispute = disputes[selectedIndex];


    console.log("messages on client side ")
    console.dir(messages)

    return (
        <div className='flex flex-col bg-bg-primary-dark h-full'>
            {/* <div className=" flex flex-row justify-between w-auto mb-0 border-2">
                <div className='flex flex-row m-6 mb-2 justify-between'>
                    <div className="flex flex-col">
                        <article className="prose">
                            <h2 className="text-white prose prose-lg font-gilroy-bold text-[24px]">Welcome {metadata?.displayName}</h2>
                        </article>
                    </div> }
                    <div id="user-action-buttons">
                        <div>
                            {/**Add profile buttons here }
                        </div>
                    </div>
                </div>
                {/* <div className="flex items-center w-auto mt-10">
                        <label htmlFor="simple-search" className="sr-only">Search</label>
                        <div className="relative w-full ">
                            <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                                <svg className="w-5 h-5 text-white dark:text-black" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path></svg>
                            </div>
                            <input type="text" id="simple-search" className="p-5 bg-bg-primary-dark border border-gray-300 text-gray-900 text-sm rounded-lg placeholder-white block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white " placeholder="Search through contracts" required />

                        </div>
                    </div> }

                <div id="user-action-buttons">

                </div>
            </div> */}
            <div id="disputes-window" className="flex flex-row h-screen ">
                <div className="flex flex-row h-auto bg-bg-secondary-dark rounded-3xl m-3 mt-0 mb-0  basis-1/3">
                    <div className="flex flex-col m-3 w-full">
                        {/* <h1 className="text-left font-gilroy-black text-[30px] m-2 text-white prose prose-lg"> Disputes and Redressal</h1> */}
                        <ul className=" space-y-6 transition-all max-h-screen overflow-y-scroll w-full snap-mandatory snap-y">
                            {disputes.length!=0?disputes.map((dispute: Dispute, index) => {
                                return <li onClick={() => {
                                    navigate(`${dispute.id}`);
                                }} key={dispute.id} className={`bg-bg-primary-dark w-full transition-all p-3 cursor-pointer snap-center border-2 border-l-transparent border-r-transparent border-t-transparent h-auto rounded-xl  dark:bg-gray-800 dark:border-gray-700 hover:border-accent-dark hover:bg-bg-secondary-dark hover:bg-opacity-50 dark:hover:bg-gray-600 flex flex-col justify-between`}>
                                    <div className="flex flex-row justify-between items-center ">
                                        <div className="flex flex-col w-full p-2 font-gilroy-regular basis-2/3">
                                            <h2 className="prose prose-md text-white font-gilroy-medium ">
                                                {dispute.name}
                                            </h2>
                                            <h3 className="prose prose-sm text-white ">{dispute.raisedBy}</h3>
                                            <h4 className="prose prose-sm text-gray-300">{dispute.contractName}</h4>
                                        </div>
                                        <div className="m-2 p-3 w-full basis-1/3">
                                            <DisputeSeverityGenerator severity={dispute.severity}></DisputeSeverityGenerator>
                                        </div>
                                    </div>

                                    <div className="flex flex-col space-y-2 h-[60px] p-2 justify-between">
                                        <p className="prose prose-md text-left break-normal align-text-top truncate font-gilroy-regular text-white text-[14px]">
                                            {dispute.description}
                                        </p>
                                    </div>


                                    {/* <td><ViewIcon onClick={() => {
                                    navigate(`${contract.id}`)
                                }} className={''}></ViewIcon></td>
                                <td><EditIcon onClick={function (event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
                                    throw new Error('Function not implemented.');
                                }} className={''}></EditIcon></td>
                                <td><DeleteIcon onClick={(e) => {
                                    let data = new FormData();
                                    data.append('id', contract.id);
                                    submit(data,
                                        { method: 'post' });
                                }} className={''}></DeleteIcon></td>
                                <td><ChatIcon onClick={function (event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
                                    throw new Error('Function not implemented.');
                                }} className={''}></ChatIcon></td> */}
                                </li>
                            }):<DisputesZeroState></DisputesZeroState>}
                        </ul>
                    </div>
                </div>
                <div className="flex flex-col h-auto m-5 basis-2/3  p-3">
                    <Outlet></Outlet>
                </div>
            </div>
            <MobileNavbarPadding></MobileNavbarPadding>

        </div >)
}