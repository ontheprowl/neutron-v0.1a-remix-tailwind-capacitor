import { useParams } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { getDoc, doc } from "firebase/firestore";
import { useLoaderData } from "@remix-run/react";

import { firestore } from "~/firebase/neutron-config";
import { primaryGradientDark, primaryGradientLight } from "~/utils/neutron-theme-extensions";
import { AnimatePresence, motion } from "framer-motion";
import { ContractStageStore } from "~/stores/ContractStageStore";
import ContractOverview from "~/components/ContractOverview";
import ContractEditScreen from "~/components/ContractEditScreen";



export const loader: LoaderFunction = async ({ params }) => {

    const contractID = params.contractID;
    const currentContract = await getDoc(doc(firestore, `contracts/${contractID}`));
    return json(currentContract.data());
}



export default function DetailedContractView() {


    const stage = ContractStageStore.useState(s => s.stage);

    const data = useLoaderData();
    const overviewStages = [<ContractOverview key={0} data={data}></ContractOverview>, <ContractEditScreen data={data} key={1} ></ContractEditScreen>]

    const params = useParams();

    return (
        <div className="flex flex-col w-auto h-auto space-x-3 space-y-3 m-4">
            <div className="flex flex-row w-auto h-auto justify-between m-4">
                <div className="flex flex-col w-auto h-auto m-5">
                    <h2> Client Name : {data.clientName}</h2>
                    <h2> Contract Period: {data.startDate} <b>-</b> {data.endDate} </h2>
                </div>
                <div className="flex flex-col w-auto h-auto m-5">
                    <h2> Project Name: {data.projectName}</h2>
                    <h2> Redressal Period: 14 days</h2>
                </div>
                <select className="w-auto h-auto" placeholder="More Options">
                    <option value="">test 1 </option>
                    <option value="">test 2</option>
                </select>
                <button className="w-40 rounded-lg bg-bg-primary-dark p-3 text-white border-solid border-2 border-white transition-all hover:scale-105" onClick={stage == 1 ? () => {
                    ContractStageStore.update((s) => {
                        s.stage = 0;
                    })
                } : () => {
                    ContractStageStore.update((s) => {
                        s.stage = 1;
                    })
                }}>{stage == 1 ? 'Back to Overview' : 'Open Contract'}</button>
                <button className="w-40 rounded-lg bg-accent-dark p-3 text-white transition-all hover:scale-105" type="submit">Save As Draft</button>
            </div>
            <AnimatePresence>
                <motion.div
                    key={stage}
                    animate={{ opacity: 1, x: 0 }}
                    initial={{ opacity: 0, x: 500 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.5 }}
                    className="h-[50vh]"
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
