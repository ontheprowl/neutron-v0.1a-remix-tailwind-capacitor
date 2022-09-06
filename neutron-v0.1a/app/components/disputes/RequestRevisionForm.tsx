import { ErrorMessage } from "@hookform/error-message";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { MouseEvent, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Milestone } from "~/models/contracts";
import { primaryGradientDark } from "~/utils/neutron-theme-extensions";
import FormButton from "../inputs/FormButton";




/**
 * This component returns a form that will be used to raise a revision request.
 * Intended to be displayed within a Neutron Modal 
 * 
 * 
 * 
 * 
 */

export default function RequestRevisionForm({ milestone, milestoneIndex }: { milestone: Milestone, milestoneIndex: number }) {

    console.log("Milestone Index : " + milestoneIndex)
    const { contract, metadata, ownerUsername } = useLoaderData();


    const methods = useForm();
    const trigger = methods.trigger;
    const errors = methods.formState.errors;
    const control = methods.control;
    const requestDetails = useWatch({ control: control, name: 'requestDetails' });

    let fetcher = useFetcher();


    useEffect(() => {
        trigger();
    }, [requestDetails, trigger])

    return (
        <form onSubmit={methods.handleSubmit(async (data) => {
            console.dir(data)
            const form = new FormData();
            const payload = { ...data, milestone: milestone, milestoneIndex: milestoneIndex, revisions: contract.revisions };
            form.append('payload', JSON.stringify(payload));
            fetcher.submit(form, { method: "post", action: `/${metadata.displayName}/disputes/submitRevision/${contract.id}` });
        })}>
            <div className="flex flex-row w-full h-[300px]">
                <textarea defaultValue={''} {...methods.register('requestDetails', { required: 'Cannot file a revision request without sufficient details', minLength: { value: 50, message: 'The job description needs to be at least 50 characters long' } })} id="revision-description" className=" bg-bg-primary-dark h-60 pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white text-md rounded-lg placeholder-white w-full dark:bg-gray-700 dark:border-gray-600  dark:placeholder-white dark:text-white placeholder:overflow-ellipsis sm:overflow-visible" placeholder="Please describe the revision in as much detail as possible..." required />
            </div >
            <div className="w-full h-10 mt-3 mb-2 text-left">
                <ErrorMessage errors={errors} name='requestDetails' render={(data) => {
                    return <span className="text-red-500 p-2 flex-wrap z-10">{data.message}</span>
                }} />
            </div>
            <button type="submit" className={`w-auto z-0 sm:w-full sm:min-w-[200px] self-center whitespace-nowrap rounded-lg ${primaryGradientDark} border-2 border-transparent hover:border-white font-gilroy-black text-white p-4 transition-all`}> Submit Revision Request </button>

        </form>
    )
}