import { Link, useNavigate, useParams } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { getDoc, doc } from "firebase/firestore";
import { useLoaderData } from "@remix-run/react";

import { auth, firestore } from "~/firebase/neutron-config.server";
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
import { getSingleDoc } from "~/firebase/queries.server";
import { requireUser } from "~/session.server";



export const loader: LoaderFunction = async ({ params, request }) => {

    const session = await requireUser(request, true);

    const contractID = params.contractID;
    console.log('logging fetched object');
    const currentContract = await getSingleDoc(`users/contracts/${session?.metadata?.id}/${contractID}`)
    return json({ contract: currentContract, metadata: session?.metadata });
}



export default function DetailedContractView() {

    const stage = ContractDataStore.useState(s => s.viewStage);

    let navigate = useNavigate();

    const data = useLoaderData();
    const contractData = data.contract;
    console.dir(contractData)
    const currentUser = data.metadata
    const overviewStages = [<ContractOverview key={0} loaderData={contractData}></ContractOverview>, <ContractEditScreen loaderData={contractData} key={1} ></ContractEditScreen>]

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
                    <a href={contractData.attachment}>
                        Download proposal
                    </a>
                </div>
                <div className="sm:hidden flex flex-row space-x-5 w-auto">
                    <ShareButton  ></ShareButton>

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

function iconForDeliverableType(type: any): string | undefined {
    throw new Error("Function not implemented.");
}
