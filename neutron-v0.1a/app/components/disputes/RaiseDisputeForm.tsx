import { ErrorMessage } from "@hookform/error-message";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Milestone } from "~/models/contracts";
import { DisputeType } from "~/models/disputes";
import { primaryGradientDark } from "~/utils/neutron-theme-extensions";





export default function RaiseDisputeForm({ milestone, milestoneIndex, toggleModalFunction }: { milestone: Milestone, milestoneIndex: number, toggleModalFunction? : Dispatch<SetStateAction<boolean>> }) {
    console.log("Milestone Index : " + milestoneIndex)
    const { contract, metadata, ownerUsername } = useLoaderData();

    const methods = useForm();
    const control = methods.control;
    const trigger = methods.trigger;
    const errors = methods.formState.errors;
    const disputeType = useWatch({ control, name: 'disputeType', defaultValue: DisputeType.DeadlineExtension });


    let fetcher = useFetcher();


    useEffect(() => {
        trigger();
    }, [disputeType, trigger])

    return (
        <form onSubmit={methods.handleSubmit(async (data) => {
            console.dir(data)
            const form = new FormData();
            const payload = { ...data, contractName: contract.projectName, contract: contract, raisedBy: metadata?.displayName, description: data.description ? data.description : 'Deadline Extension requested' };
            form.append('payload', JSON.stringify(payload));
            fetcher.submit(form, { method: "post", action: `/${metadata.displayName}/disputes/createDispute/${contract.id}` });
            if(toggleModalFunction) toggleModalFunction(false)
        })}>
            <div className="flex flex-col justify-start space-y-2 mt-8">
                <h2 className="prose prose-md text-black font-gilroy-medium text-[18px]"> What is the nature of your dispute? </h2>
                <select id="dispute-type-select"  {...methods.register('disputeType')} className=" bg-transparent p-3 transition-all ring-2 ring-black hover:ring-purple-400 active:ring-purple-400 focus:outline-none focus:ring-purple-400  text-black text-sm rounded-lg placeholder-black block w-auto h-auto dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white ">
                    <option value={DisputeType.DeadlineExtension}>Deadline Extension</option>
                    {contract?.externalDeliverables ? <option value={DisputeType.QualityIssue}>Issue of Quality</option> : <></>}
                    {contract?.externalDeliverables ? <option value={DisputeType.Fraud}>Fraud</option> : <></>}
                </select>
            </div>
            <div className="w-full h-10 mt-3 mb-2 text-left">
                <ErrorMessage errors={errors} name='disputeType' render={(data) => {
                    return <span className="text-red-500 p-2 flex-wrap z-10">{data.message}</span>
                }} />
            </div>

            {disputeType == DisputeType.QualityIssue || disputeType == DisputeType.Fraud ?
                <>
                    <div className="flex flex-col justify-start space-y-2 mt-8">
                        <h2 className="prose prose-md text-black font-gilroy-medium text-[18px]"> Describe the quality issue in detail </h2>
                        <input type="text" id="dispute-description" {...methods.register('description')} className=" bg-transparent p-3 transition-all ring-2 ring-black hover:ring-2 hover:ring-purple-400 active:ring-purple-400 focus:outline-none focus:ring-purple-400  text-black text-sm rounded-lg placeholder-black block w-auto h-auto dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " />
                    </div>
                    <div className="w-full h-10 mt-3 mb-2 text-left">
                        <ErrorMessage errors={errors} name='requestDetails' render={(data) => {
                            return <span className="text-red-500 p-2 flex-wrap z-10">{data.message}</span>
                        }} />
                    </div>
                </> : <></>
            }
            <button type="submit" className={`w-auto z-0 sm:w-full sm:min-w-[200px] self-center whitespace-nowrap rounded-lg bg-red-700 hover:bg-red-500 border-2 border-transparent hover:border-white font-gilroy-black text-white p-4 transition-all`}> Raise Dispute </button>

        </form>
    )
}