import { useFetcher, useLoaderData, useTransition } from "@remix-run/react";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form"
import FormButton from "../inputs/FormButton";
import { ErrorMessage } from '@hookform/error-message'
import { toast, ToastContainer } from "react-toastify";

import DefaultSpinner from "../layout/DefaultSpinner";





export default function ProfileBasicDetailsForm() {
    const data = useLoaderData();
    const fetcher = useFetcher();
    const saveButtonStates = (state: string) => {
        switch (state) {
            case "idle":
                return (<span> Save Details </span>);

            case "submitting":
                return (<span> Saving Details ...</span>)
            case "loading":
                return (<DefaultSpinner></DefaultSpinner>);
        }
    }



    const userMetadata = data.metadata

    const userNames: string[] = data.usernames;

    const IsUsernameAvailable = (username: string) => {
        return userNames.indexOf(username) == -1 || username == userMetadata.displayName
    }


    const { handleSubmit, register, trigger, formState: { errors }, control } = useForm();

    const firstName = useWatch({ control, name: 'firstName' })
    const lastName = useWatch({ control, name: 'lastName' })
    const displayName = useWatch({ control, name: 'displayName' })

    useEffect(() => {
        trigger()
        if (fetcher.type === "done") {
            console.log("THE FETCHER TYPE IS " + fetcher.type)
            toast(<div><h2>Details saved!</h2></div>, { theme: "dark", type: "success" })
        }

    }, [firstName, lastName, displayName, trigger, fetcher])

    return (<form onSubmit={
        handleSubmit(async (data) => {
            const form = new FormData()
            console.log(data);
            form.append('payload', JSON.stringify(data));

            fetcher.submit(form, { method: "post" });

        })
    }>

        <h2 className="prose prose-lg mt-3 text-white"> Basic Details </h2>
        <div className="relative w-auto mt-2 mb-5 sm:mt-5 sm:mb-5 flex flex-col ">
            <span className=" prose prose-md text-white mb-5">Display Name</span>
            <input type="text" readOnly id="project-name"  {...register('displayName', {
                required: 'This field is required', validate: (v) => {
                    return IsUsernameAvailable(v) || 'This username is already taken';
                }
            })} defaultValue={userMetadata.displayName} className=" bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-auto h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " placeholder="Something cool like XXX_DEMONSLAYER_XXX" required />
            <div className="w-full h-10 mt-3">
                <ErrorMessage errors={errors} name='displayName' render={(data) => {
                    return <span className="text-red-500 p-2 m-3 z-10">{data.message}</span>
                }} />
            </div>
            <div className="flex items-end mt-2 flex-col space-y-3 sm:space-x-3 sm:flex-row w-full">
                <div className="sm:text-center space-y-3 w-full h-auto">
                    <span className=" prose prose-md text-white">First Name</span>
                    <input  {...register('firstName', { required: 'This field is required', maxLength: { value: 10, message: 'First name exceeds maximum length' } })} type="text" placeholder="e.g : Harvey" defaultValue={userMetadata.firstName} className=" bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white text-sm rounded-lg invalid:border-red-500 placeholder-white block w-full h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " />
                    <div className="w-full h-10 mt-3 text-left">
                        <ErrorMessage errors={errors} name='firstName' render={(data) => {
                            return <span className="text-red-500 p-2 m-3 z-10">{data.message}</span>
                        }} />
                    </div>

                </div>


                <div className="sm:text-center space-y-3 w-full">
                    <span className=" prose prose-md text-white">Last Name</span>
                    <input {...register('lastName', { required: 'This field is required', maxLength: { value: 20, message: 'Last name exceeds maximum length' } })} type="text" placeholder="e.g: Spector" defaultValue={userMetadata.lastName} className=" bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-full h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " />
                    <div className="w-full h-10 mt-3 text-left">
                        <ErrorMessage errors={errors} name='lastName' render={(data) => {
                            return <span className="text-red-500 p-2 m-3 z-10">{data.message}</span>
                        }} />
                    </div>
                </div>
            </div>

        </div>
        <button
            className="w-40 rounded-lg mt-2 self-start  bg-accent-dark p-3 border-2 border-transparent active:bg-amber-300 outline-none focus:ring-1 focus:ring-white focus:border-white hover:border-white hover:ring-white text-black font-gilroy-black font-[18px] transition-all"
            type="submit"
        >
            {saveButtonStates(fetcher.state)}
        </button>

    </form>)
}

