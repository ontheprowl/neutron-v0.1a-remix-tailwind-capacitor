import { useFetcher, useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form"
import FormButton from "../inputs/FormButton";
import { ErrorMessage } from '@hookform/error-message'
import { CountrySelect } from "~/utils/utils";
import { toast, ToastContainer } from "react-toastify";
import DefaultSpinner from "../layout/DefaultSpinner";





export default function ProfileProfInformationForm() {

    const data = useLoaderData();

    const userMetadata = data.metadata
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
   

    const userNames: string[] = data.usernames;

    const IsUsernameAvailable = (username: string) => {
        return userNames.indexOf(username) == -1 || username == userMetadata.displayName
    }
    const fetcher = useFetcher();
    const { handleSubmit, register, trigger, formState: { errors }, control } = useForm();

    const designation = useWatch({ control, name: 'designation' })
    const experience = useWatch({ control, name: 'experience' })
    const location = useWatch({ control, name: 'location' })
    const language = useWatch({ control, name: 'language' })


    useEffect(() => {
        trigger()
        if (fetcher.type === "done") {
            console.log("THE FETCHER TYPE IS " + fetcher.type)
            toast(<div><h2>Details saved!</h2></div>, { theme: "dark", type: "success" })
        }

    }, [designation, experience, location, language, fetcher, trigger])

    return (<form onSubmit={
        handleSubmit(async (data) => {
            const form = new FormData()
            console.log(data);
            form.append('payload', JSON.stringify(data));

            fetcher.submit(form, { method: "post" });

        })
    }>

        <h2 className="prose prose-lg mt-3 text-white"> Professional Information </h2>
        <div className="relative w-auto mt-2 mb-5 sm:mt-5 sm:mb-5 flex flex-col ">
            <span className=" prose prose-md text-white mb-5">Designation</span>
            <input type="text" id="designation"  {...register('designation', {
                required: 'This field is required'
            })} defaultValue={userMetadata.designation} className=" bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-auto h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " placeholder="What do you do tho?" required />
            <div className="w-full h-10 mt-3">
                <ErrorMessage errors={errors} name='designation' render={(data) => {
                    return <span className="text-red-500 p-2 m-3 z-10">{data.message}</span>
                }} />
            </div>
            <div className="flex items-end mt-2 flex-col space-y-2 sm:space-x-3 sm:flex-row w-full">
                <div className="sm:text-center space-y-3 w-full h-auto">
                    <span className=" prose prose-md text-white">Experience ( in years )</span>
                    <input  {...register('experience', { required: 'This field is required', maxLength: { value: 3, message: 'Please enter a number of years less than a human life-span' } })} type="number" placeholder="e.g : 5 years" defaultValue={userMetadata.experience} className=" bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white text-sm rounded-lg invalid:border-red-500 placeholder-white block w-full h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " />
                    <div className="w-full h-10 mt-3 text-left">
                        <ErrorMessage errors={errors} name='experience' render={(data) => {
                            return <span className="text-red-500 p-2 m-3 z-10">{data.message}</span>
                        }} />
                    </div>

                </div>


                <div className="sm:text-center space-y-3 w-full">
                    <span className=" prose prose-md text-white">Location</span>
                    <input  {...register('location', { required: 'This field is required', maxLength: { value: 20, message: 'Location exceeds maximum length of 20' } })} type="text" placeholder="e.g : Mumbai, India" defaultValue={userMetadata.location} className=" bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white text-sm rounded-lg invalid:border-red-500 placeholder-white block w-full h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " />
                    {/* <CountrySelect formFieldName="location" defaultValue={() => 'India'} className=" bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-full h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " id={""} /> */}
                    <div className="w-full h-10 mt-3 text-left">
                        <ErrorMessage errors={errors} name='location' render={(data) => {
                            return <span className="text-red-500 p-2 m-3 z-10">{data.message}</span>
                        }} />
                    </div>
                </div>
                <div className="sm:text-center space-y-3 w-full h-auto">
                    <span className=" prose prose-md text-white">Working Language</span>
                    <input  {...register('language', { required: 'This field is required', maxLength: { value: 10, message: 'Language name exceeds maximum length of 10' } })} type="text" placeholder="e.g : English" defaultValue={userMetadata.language} className=" bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white text-sm rounded-lg invalid:border-red-500 placeholder-white block w-full h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " />
                    <div className="w-full h-10 mt-3 text-left">
                        <ErrorMessage errors={errors} name='language' render={(data) => {
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


