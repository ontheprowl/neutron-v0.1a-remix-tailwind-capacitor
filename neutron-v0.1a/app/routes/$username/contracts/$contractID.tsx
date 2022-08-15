import { Link, useNavigate, useParams } from "@remix-run/react";
import { ActionFunction, LoaderFunction, redirect } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { getDoc, doc, arrayRemove } from "firebase/firestore";
import { useLoaderData } from "@remix-run/react";

import { auth, firestore, storage } from "~/firebase/neutron-config.server";
import { primaryGradientDark, primaryGradientLight } from "~/utils/neutron-theme-extensions";
import { AnimatePresence, motion } from "framer-motion";
import { ContractDataStore } from "~/stores/ContractStores";
import ContractOverview from "~/components/contracts/ContractOverview";
import ContractEditScreen from "~/components/contracts/ContractEditScreen";
import { useAuthState } from "react-firebase-hooks/auth";
import { formatDateToReadableString } from "~/utils/utils";
import BackArrowButton from "~/components/inputs/BackArrowButton";
import TransparentButton from "~/components/inputs/TransparentButton";
import FormButton from "~/components/inputs/FormButton";
import ShareButton from "~/components/inputs/ShareButton";
import { fetchEvents, getSingleDoc, sendEvent, updateFirestoreDocFromData } from "~/firebase/queries.server";
import { requireUser } from "~/session.server";
import { unstable_parseMultipartFormData as parseMultipartFormData } from "@remix-run/server-runtime";
import createFirebaseStorageFileHandler from "~/firebase/FirebaseUploadHandler";
import { getDownloadURL, ref, UploadTaskSnapshot } from "firebase/storage";
import { generalFilesUploadRoutine } from "~/firebase/firebase-utils";
import PDFViewer from "~/components/deliverables/PDFViewer.client";
import { ContractEvent, EventType, NeutronEvent } from "~/models/events";


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
    const contractOwner = await getSingleDoc(`userUIDS/${ownerUsername}`)
    const currentContract = await getSingleDoc(`users/contracts/${contractOwner?.uid}/${contractID}`)
    const currentContractEvents = await fetchEvents(EventType.ContractEvent, contractID)
    if(session?.metadata?.displayName == ownerUsername){
        
    }
    return json({ contract: { ...currentContract, id: contractID }, metadata: session?.metadata, contractEvents: currentContractEvents, ownerUsername: ownerUsername });
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


    console.log(`from the Action Function`);
    const formData = await parseMultipartFormData(request, createFirebaseStorageFileHandler({
        uploadRoutine: generalFilesUploadRoutine,
        session: session
    }));

    console.log("contract payload")
    const data = {}
    for (const key of formData.keys()) {
        let value = formData.get(key);
        console.log(`Key : ${key}`)
        if (value?.toString().includes('[') || value?.toString()?.includes('{')) {
            value = JSON.parse(value)
        }
        console.dir(`Value : ${value}`)
        data[key] = value;
    }

    const finalDeliverableData = { ...data }

    console.log('Final deliverable data is : ')
    console.dir(finalDeliverableData)

    const milestonePayload: { [key: string]: any } = {}

    milestonePayload[`milestones.${finalDeliverableData.milestone.name}.submissionPath`] = finalDeliverableData.deliverableFile


    await updateFirestoreDocFromData(milestonePayload, `users/contracts/${session?.metadata?.id}`, contractID);

    // await updateFirestoreDocFromData({ deliverables: arrayUn({ name: 'test' }) }, `users/contracts/${session?.metadata?.id}`, contractID);
    const deliverableSubmissionEvent: NeutronEvent = { event: ContractEvent.ContractMilestoneSubmitted, type: EventType.ContractEvent, payload: { data: { milestone: { ...finalDeliverableData.milestone, submissionPath: finalDeliverableData.deliverableFile }, nextMilestoneIndex: finalDeliverableData.nextMilestoneIndex }, message: 'A contract milestone deliverable was submitted' }, uid: session?.metadata?.id, id: contractID }
    const eventAdded = await sendEvent(deliverableSubmissionEvent);

    return redirect(`/${session?.metadata?.displayName}/contracts/${contractID}`)
}


/**
 * 
 * @returns A view for the contract at the specified URL
 */

export default function DetailedContractView() {

    const stage = ContractDataStore.useState(s => s.viewStage);

    let navigate = useNavigate();

    const data = useLoaderData();
    const contractData = data.contract;
    console.dir(contractData)
    const currentUser = data.metadata
    const overviewStages = [<ContractOverview key={0} ></ContractOverview>, <ContractEditScreen viewMode key={1} ></ContractEditScreen>]

    const params = useParams();

    return (
        <div className='flex flex-col space-y-8 bg-bg-primary-dark h-auto'>
            <div className="hidden sm:flex sm:flex-row w-full">
                <div className='flex flex-row m-6 justify-between w-full space-x-10'>
                    <div className="flex flex-col">
                        <article className="prose">
                            <h2 className="text-white prose prose-lg">Welcome {currentUser?.email}</h2>
                            <p className="text-white prose prose-sm">{formatDateToReadableString()}</p>
                        </article>
                    </div>
                    <div className="flex items-center w-[692px] ">
                        <label htmlFor="simple-search" className="sr-only">Search</label>
                        <div className="relative w-full ">
                            <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                                <svg className="w-5 h-5 text-white dark:text-black" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path></svg>
                            </div>
                            <input type="text" id="simple-search" className="p-5 bg-bg-primary-dark border border-gray-300 text-gray-900 text-sm rounded-lg placeholder-white block w-full pl-10  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white " placeholder="Search through contracts" required />

                        </div>
                    </div>
                </div>



            </div>
            <div className="flex flex-row m-6 mb-2 space-x-3 justify-between">
                <div className="flex flex-row align-middle items-center space-x-3">
                    <BackArrowButton onClick={() => {
                        navigate(-1);

                    }} className="scale-75"></BackArrowButton>
                    <h1 className="prose prose-xl font-gilroy-bold text-white">{contractData?.projectName}</h1>
                </div>
                <div className="hidden sm:flex sm:flex-row space-x-5 w-auto">
                    <TransparentButton onClick={() => {
                        ContractDataStore.update(s => {
                            s.viewStage == 1 ? s.viewStage = 0 : s.viewStage = 1;
                        })
                    }} text={`${stage == 1 ? 'Back To Overview' : 'Open Contract'}`}></TransparentButton>
                    <FormButton onClick={() => {

                    }} text="Share Deliverables"></FormButton>
                    <a href={contractData?.attachment}>
                        Download proposal
                    </a>
                </div>
                {/* Todo - Hide this div on all viewports larger than sm */}
                <div className="flex flex-row space-x-5 w-auto sm:hidden">
                    <ShareButton onClick={() => {
                        ContractDataStore.update(s => {
                            s.viewStage == 2 ? s.viewStage = 0 : s.viewStage = 2;
                            2;
                        })
                    }}  ></ShareButton>

                </div>

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
        </div>
    );

}

