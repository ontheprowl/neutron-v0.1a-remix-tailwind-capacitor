import { useNavigate, useParams } from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { useLoaderData } from "@remix-run/react";
import IconDisputesChat from '~/assets/images/Chat2.svg'
import IconMilestones from '~/assets/images/atom.svg'
import { db } from "~/firebase/neutron-config.server";
import { AnimatePresence, motion } from "framer-motion";
import { ContractDataStore } from "~/stores/ContractStores";
import ContractOverview from "~/components/contracts/ContractOverview";
import ContractEditScreen from "~/components/contracts/ContractEditScreen";
import BackArrowButton from "~/components/inputs/BackArrowButton";
import FormButton from "~/components/inputs/FormButton";
import { fetchEvents, getSingleDoc, sendEvent, updateFirestoreDocFromData } from "~/firebase/queries.server";
import { requireUser } from "~/session.server";
import { unstable_parseMultipartFormData as parseMultipartFormData } from "@remix-run/server-runtime";
import createFirebaseStorageFileHandler from "~/firebase/FirebaseUploadHandler";
import { generalFilesUploadRoutine } from "~/firebase/firebase-utils";
import type { NeutronEvent } from "~/models/events";
import { ContractEvent, EventType } from "~/models/events";
import { get, query, ref } from "firebase/database";
import { ContractSidePanelStages, DeliverableStatus } from "~/models/contracts";
import { primaryGradientDark } from "~/utils/neutron-theme-extensions";
import { env } from "process";
import { ToastContainer } from "react-toastify";
import MobileNavbarPadding from "~/components/layout/MobileNavbarPadding";
import { useEffect } from "react";
import { injectStyle } from "react-toastify/dist/inject-style";
import ContractViewMobileUI from "~/components/pages/ContractViewMobileUI";
import { trackJuneEvent } from "~/analytics/june-config.server";


/**
 * Current Contract Loader - Loader Function
 * 
 * @param params - The params collected from dynamic URL segments
 * @param request - The POST request that triggers this action
 * @returns JSON with the following structure : { contract, metadata , contractEvents, ownerUsername }
 */
export const loader: LoaderFunction = async ({ params, request }) => {

    const session = await requireUser(request, true);

    const ownerUsername = params.username
    const contractID = params.contractID;
    const currentContract = await getSingleDoc(`${session?.metadata?.defaultTestMode ? 'testContracts' : `contracts`}/${contractID}`);
    const contractViewers: String[] = currentContract?.viewers;

    //* This block enforces privileged access to this contract
    if (!contractViewers || !contractViewers.includes(session?.metadata?.id)) {
        throw new Error("Don't have the privilege to view this page")
    }

    const currentContractEvents = await fetchEvents(EventType.ContractEvent, contractID)
    let from, to;
    if (session?.metadata?.email == currentContract?.clientEmail) {
        from = currentContract?.clientID;
        to = currentContract?.providerID;
    } else {
        from = currentContract?.providerID;
        to = currentContract?.clientID;
    }

    let messagesArray: Array<{ text: string, to: string, from: string, timestamp: string }> = []

    // if (from && to) {
    //     const messageQuery = query(ref(db, 'messages/' + btoa((from + to + contractID).split('').sort().join(''))));


    //     const queryData = await get(messageQuery);

    //     const data = queryData.val();
    //     if (data) {
    //         for (const [key, value] of Object.entries(data)) {
    //             messagesArray.push(value)
    //         }
    //     }
    //     // if (messages.length != messagesArray.length)
    //     //     setMessages(messagesArray)


    // }
    

    // if(session?.metadata?.displayName == ownerUsername){

    // }
    trackJuneEvent(session?.metadata?.id, 'Open Contract Event', {}, 'contractEvents',)
    return json({ contract: { ...currentContract, id: contractID }, metadata: session?.metadata, contractEvents: currentContractEvents, contractMessages: messagesArray, node_env: env.NODE_ENV, ownerUsername: ownerUsername, from: from, to: to });
}


/**
 * Submit Deliverable - Action Function
 * 
 * 
 * @param params - The params collected from dynamic URL segments
 * @param request - The POST request that triggers this action
 * @returns A redirect to the current contract page
 */
export const action: ActionFunction = async ({ params, request }) => {
    const session = await requireUser(request, true);

    const contractID = params.contractID;


    const formData = await parseMultipartFormData(request, createFirebaseStorageFileHandler({
        uploadRoutine: generalFilesUploadRoutine,
        session: session
    }));

    const data = {}
    for (const key of formData.keys()) {
        let value = formData.get(key);
        if (value?.toString().includes('[') || value?.toString()?.includes('{')) {
            value = JSON.parse(value)
        }
        data[key] = value;
    }

    const finalDeliverableData = { ...data }


    const milestonePayload: { [key: string]: any } = {}
    const ownerUsername = params.username;

    const viewers = finalDeliverableData?.viewers;

    //TODO : This is an unnecessary modification to the milestone index, due to poorly documented string processing. Please refactor ASAP.
    if (finalDeliverableData?.milestoneIndex?.includes('"')) {
        finalDeliverableData.milestoneIndex = Number(finalDeliverableData?.milestoneIndex?.replace(/"/g, ""))
    }

    if (finalDeliverableData?.externallyDelivered) {
        milestonePayload[`milestones.workMilestones.${finalDeliverableData.milestoneIndex}.submissionPath`] = '[EXTERNAL]';
        milestonePayload[`milestones.workMilestones.${finalDeliverableData.milestoneIndex}.status`] = DeliverableStatus.SubmittedExternally;

        await updateFirestoreDocFromData(milestonePayload, `${session?.metadata?.defaultTestMode ? 'testContracts' : `contracts`}`, contractID);

        // await updateFirestoreDocFromData({ deliverables: arrayUn({ name: 'test' }) }, `users/contracts/${session?.metadata?.id}`, contractID);
        const deliverableSubmissionEvent: NeutronEvent = { event: ContractEvent.ContractMilestoneSubmitted, type: EventType.ContractEvent, payload: { data: { milestone: { ...finalDeliverableData.milestone, submissionPath: '[EXTERNAL]', status: DeliverableStatus.SubmittedExternally }, metadata: session?.metadata, nextMilestoneIndex: finalDeliverableData.milestoneIndex }, message: 'A contract milestone deliverable was submitted' }, uid: session?.metadata?.id, id: contractID }
        const eventAdded = await sendEvent(deliverableSubmissionEvent, viewers, session?.metadata?.defaultTestMode);

    } else {
        milestonePayload[`milestones.workMilestones.${finalDeliverableData.milestoneIndex}.submissionPath`] = finalDeliverableData.deliverableFile;
        milestonePayload[`milestones.workMilestones.${finalDeliverableData.milestoneIndex}.status`] = DeliverableStatus.SubmittedForApproval;

        await updateFirestoreDocFromData(milestonePayload, `${session?.metadata?.defaultTestMode ? 'testContracts' : `contracts`}`, contractID);

        // await updateFirestoreDocFromData({ deliverables: arrayUn({ name: 'test' }) }, `users/contracts/${session?.metadata?.id}`, contractID);
        const deliverableSubmissionEvent: NeutronEvent = { event: ContractEvent.ContractMilestoneSubmitted, type: EventType.ContractEvent, payload: { data: { milestone: { ...finalDeliverableData.milestone, submissionPath: finalDeliverableData.deliverableFile, status: DeliverableStatus.SubmittedForApproval }, metadata: session?.metadata, nextMilestoneIndex: finalDeliverableData.milestoneIndex }, message: 'A contract milestone deliverable was submitted' }, uid: session?.metadata?.id, id: contractID }
        const eventAdded = await sendEvent(deliverableSubmissionEvent, viewers, session?.metadata?.defaultTestMode);

    }



    return redirect(`/${ownerUsername}/contracts/${contractID}`)
}


/**
 * 
 * @returns A view for the contract at the specified URL
 */

export default function DetailedContractView() {

    const stage = ContractDataStore.useState(s => s.viewStage);

    const sidePanelStage = ContractDataStore.useState(s => s.sidePanelStage);
    let navigate = useNavigate();

    useEffect(() => {
        injectStyle();
    })

    const data = useLoaderData();
    const contractData = data.contract;
    const currentUser = data.metadata
    const overviewStages = [<ContractOverview published={contractData?.isPublished == "true"} key={0} ></ContractOverview>, <ContractEditScreen viewMode key={1} ></ContractEditScreen>]

    const params = useParams();

    function generateMilestoneStats(milestones: { [x: string]: any }) {
        if (!milestones || Object.keys(milestones).length == 0) {
            return <h1 className="text-white pl-2 pr-3"> No milestones </h1>
        }

        const workMilestonesCount = milestones?.workMilestones ? Object.keys(milestones?.workMilestones).length : 0;
        const denominator = workMilestonesCount;
        return (<h1 className="prose prose-lg text-white text-right"> <span className="text-purple-400">{contractData.completedMilestones ? contractData.completedMilestones : '0'}</span>/{denominator}</h1>);
    };



    return (
        <>
            <div className='hidden sm:flex sm:flex-col bg-bg-primary-dark h-auto'>
                {/* <div className="hidden sm:flex sm:flex-row w-full border-2 border-purple-600">
                <div className='flex flex-row m-6 mb-3 justify-between w-full space-x-10 border-2 border-accent-dark '>
                    <div className="flex flex-col">
                        <article className="prose ">
                            <h2 className="text-white font-gilroy-bold text-[24px]">Welcome {currentUser?.email}</h2>
                            <p className="text-white font-gilroy-regular text-[12px]">{formatDateToReadableString()}</p>
                        </article>
                    </div>
                    <div className="flex items-center w-[692px] ">
                        <label htmlFor="simple-search" className="sr-only">Search</label>
                        <div className="relative w-full ">
                            <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                                <svg className="w-5 h-5 text-white dark:text-black" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path></svg>
                            </div>
                            <input type="text" id="simple-search" className="p-5 bg-bg-primary-dark border border-gray-300 text-gray-900 text-sm rounded-lg placeholder-white block w-full pl-10  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white " placeholder="Search through contracts" required />

                        </div>
                    </div>
                </div>
            </div> */}
                <div className="flex flex-col m-3  mb-0 mt-2 space-y-5 justify-between">
                    <div className="flex flex-row space-x-3 mb-0 w-full  ">
                        <div className="hidden sm:inline hover:drop-shadow-md  transition-all h-12 translate-y-[8px]  rounded-full">
                            <BackArrowButton className="p-2 ring-2 ring-transparent hover:bg-bg-secondary-dark hover:ring-purple-400 transition-all rounded-full" onClick={() => {
                                navigate(`/${currentUser.displayName}/dashboard`);

                            }} ></BackArrowButton>
                        </div>

                        <h1 className="prose prose-xl font-gilroy-black text-[25px] mt-2 text-white">{contractData?.projectName}</h1>
                    </div>
                    <div id="contract-buttons-section" className="hidden w-full sm:flex sm:flex-row space-x-2 ">
                        <div className="flex flex-row space-x-4 justify-between w-full ">

                            <button onClick={() => {
                                ContractDataStore.update(s => {
                                    s.viewStage == 1 ? s.viewStage = 0 : s.viewStage = 1;
                                })
                            }} className=' p-4 text-center bg-[#E6E0FA] sm:w-full text-[#765AD1] basis-1/2 prose prose-md transition-all rounded-lg active:border-white whitespace-nowrap hover:bg-white'>{`${stage == 1 ? 'Back To Overview' : 'Open Contract'}`}</button>
                            <a href={contractData.attachment && contractData.attachment != "null" ? contractData.attachment : "#"} className=" hover:bg-bg-secondary-dark bg-bg-primary-dark basis-1/2 transition-all active:bg-bg-secondary-dark border-2 border-transparent border-purple-400 hover:border-purple-400 p-4 rounded-xl">
                                <div className="flex flex-row space-x-8 text-white items-center">
                                    <span>
                                        <svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M9.66634 1.89111V5.33323C9.66634 5.79994 9.66634 6.0333 9.75717 6.21156C9.83706 6.36836 9.96455 6.49584 10.1213 6.57574C10.2996 6.66656 10.533 6.66656 10.9997 6.66656H14.4418M5.49967 12.4998L7.99967 14.9998M7.99967 14.9998L10.4997 12.4998M7.99967 14.9998L7.99967 9.99984M9.66634 1.6665H5.33301C3.93288 1.6665 3.23281 1.6665 2.69803 1.93899C2.22763 2.17867 1.84517 2.56112 1.60549 3.03153C1.33301 3.56631 1.33301 4.26637 1.33301 5.6665V14.3332C1.33301 15.7333 1.33301 16.4334 1.60549 16.9681C1.84517 17.4386 2.22763 17.821 2.69803 18.0607C3.23281 18.3332 3.93288 18.3332 5.33301 18.3332H10.6663C12.0665 18.3332 12.7665 18.3332 13.3013 18.0607C13.7717 17.821 14.1542 17.4386 14.3939 16.9681C14.6663 16.4334 14.6663 15.7333 14.6663 14.3332V6.6665L9.66634 1.6665Z" stroke="white" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                    <span className="whitespace-nowrap"> Download Proposal </span>
                                </div>
                            </a>
                        </div>
                        <div className="flex flex-row space-x-4 w-full justify-between">
                            <button onClick={() => {

                                ContractDataStore.update(s => {
                                    s.sidePanelStage == ContractSidePanelStages.MilestonesPanel ? s.sidePanelStage = ContractSidePanelStages.ChatsPanel : s.sidePanelStage = ContractSidePanelStages.MilestonesPanel;
                                })
                            }} className="w-full hover:bg-bg-secondary-dark bg-bg-primary-dark basis-1/2 rounded-xl transition-all  border-2 border-purple-400 hover:border-purple-400"  ><div className="transition-all p-4 flex flex-row justify-between w-full rounded-xl">
                                    <h1 className="prose prose-sm text-white font-gilroy-bold text-[14px] whitespace-nowrap">
                                        {sidePanelStage == ContractSidePanelStages.MilestonesPanel ? 'View Contract Chat' : ' View Contract Milestones'}
                                    </h1>
                                    <img src={sidePanelStage === ContractSidePanelStages.MilestonesPanel ? IconDisputesChat : IconMilestones} alt="Disputes Chat Icon"></img>
                                </div>
                            </button>
                            <button onClick={() => {
                                if (navigator.share) {
                                    navigator.share({
                                        title: `${contractData.projectName}`,
                                        text: 'Check out this Neutron contract!',
                                        url: window.location.href,
                                    })
                                        .then(() => console.log('Successful share'))
                                        .catch((error) => console.log('Error sharing', error));
                                }
                            }} className={`${primaryGradientDark} p-0.5 rounded-xl w-full basis-1/2 hover:bg-white transition-all `}>
                                <div className="bg-bg-primary-dark border-2 hover:bg-bg-secondary-dark  text-white h-full flex flex-row space-x-3 justify-center items-center border-transparent rounded-xl">
                                    <span className="flex flex-row space-x-4 ">
                                        <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M6.15833 11.2582L11.85 14.5748M11.8417 5.42484L6.15833 8.7415M16.5 4.1665C16.5 5.54722 15.3807 6.6665 14 6.6665C12.6193 6.6665 11.5 5.54722 11.5 4.1665C11.5 2.78579 12.6193 1.6665 14 1.6665C15.3807 1.6665 16.5 2.78579 16.5 4.1665ZM6.5 9.99984C6.5 11.3805 5.38071 12.4998 4 12.4998C2.61929 12.4998 1.5 11.3805 1.5 9.99984C1.5 8.61913 2.61929 7.49984 4 7.49984C5.38071 7.49984 6.5 8.61913 6.5 9.99984ZM16.5 15.8332C16.5 17.2139 15.3807 18.3332 14 18.3332C12.6193 18.3332 11.5 17.2139 11.5 15.8332C11.5 14.4525 12.6193 13.3332 14 13.3332C15.3807 13.3332 16.5 14.4525 16.5 15.8332Z" stroke="white" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                    <span >Share Contract</span>
                                </div>
                            </button>





                        </div>


                    </div>

                    {/* Todo - Hide this div on all viewports larger than sm */}

                </div>
                <div className="hidden sm:flex sm:flex-row h-14 space-x-5 m-3 sm:justify-between">
                    <div className='flex flex-row space-x-3 justify-between w-full'>
                        <div className={`flex flex-row ${primaryGradientDark} w-full   transition-all h-full rounded-full  justify-between p-4 items-center`}>
                            <h2 className='prose prose-md text-white'>Total Funds</h2>
                            <h1 className="prose prose-lg text-white text-right"> {contractData.contractValue}</h1>
                        </div>
                        <div className={`flex flex-row bg-bg-secondary-dark transition-all  w-full h-full rounded-full justify-between p-4 items-center`}>
                            <h2 className='prose prose-md text-white'>Released Funds</h2>
                            <h1 className="prose prose-lg text-white text-right"> ₹{contractData?.releasedFunds ? contractData?.releasedFunds : '0'}</h1>
                        </div>
                        <div className={`flex flex-row bg-bg-secondary-dark transition-all  w-full h-full rounded-full justify-between p-4 items-center`}>
                            <h2 className='prose prose-md text-white'>Milestones</h2>
                            {generateMilestoneStats(contractData?.isPublished == "true" ? contractData?.milestones : contractData?.milestonesProcessed)}
                        </div>
                    </div>


                    {/* <div id="contract-buttons-section" className="hidden sm:flex sm:flex-col space-y-3 w-auto pr-6 pl-2 items-center ">
                    <div className="flex flex-row space-x-4">
                        <button onClick={() => {
                            ContractDataStore.update(s => {
                                s.viewStage == 1 ? s.viewStage = 0 : s.viewStage = 1;
                            })
                        }} className={`transition-all p-4  border-2 text-center bg-[#E6E0FA] sm:w-full text-[#765AD1] prose prose-md rounded-lg active:border-white whitespace-nowrap border-transparent hover:border-purple-400`}>{`${stage == 1 ? 'Back To Overview' : 'Open Contract'}`}</button>
                        <FormButton onClick={() => {

                        }} text="Share Deliverables" ></FormButton>
                    </div>
                    <div className="flex flex-row space-x-4 w-full">
                        <button className={`${primaryGradientDark} p-0.5 rounded-xl w-full`}>
                            <div className="bg-bg-primary-dark border-2 h-full flex flex-row justify-center items-center border-transparent rounded-xl">
                                <span>Hello</span>
                            </div>
                        </button>
                        <button onClick={() => {

                            ContractDataStore.update(s => {
                                s.sidePanelStage == ContractSidePanelStages.MilestonesPanel ? s.sidePanelStage = ContractSidePanelStages.ChatsPanel : s.sidePanelStage = ContractSidePanelStages.MilestonesPanel;
                            })
                        }}  ><div className="transition-all pt-4 pb-4 flex flex-row space-x-2 justify-between border-2 border-white w-48 p-2 rounded-xl">
                                <h1 className="prose prose-sm text-white font-gilroy-bold text-[14px] whitespace-nowrap">
                                    {sidePanelStage == ContractSidePanelStages.MilestonesPanel ? 'View Contract Events' : ' View Contract Milestones'}
                                </h1>
                                <img src={sidePanelStage === ContractSidePanelStages.ChatsPanel ? IconDisputesChat : IconMilestones} alt="Disputes Chat Icon"></img>
                            </div>
                        </button>
                    </div>s

                </div> */}
                </div>
                <div className="flex flex-row sm:hidden justify-center w-full">
                    <FormButton onClick={() => {
                        ContractDataStore.update(s => {
                            s.viewStage == 1 ? s.viewStage = 0 : s.viewStage = 1;
                        })
                    }} text={`${stage == 1 ? 'Back To Overview' : 'Open Contract'}`}></FormButton>
                </div>

                <AnimatePresence exitBeforeEnter>
                    <motion.div
                        key={stage}
                        animate={{ opacity: 1, x: 0 }}
                        initial={{ opacity: 0, x: 500 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.5 }}
                        className="h-full m-3"
                    >
                        {overviewStages[stage]}


                    </motion.div >
                </AnimatePresence>
                <ToastContainer position="bottom-center"
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    theme="dark"
                    limit={1}

                    pauseOnFocusLoss
                    draggable
                    pauseOnHover></ToastContainer>
                <MobileNavbarPadding />
            </div>
            <ContractViewMobileUI></ContractViewMobileUI>

        </>
    );

}



