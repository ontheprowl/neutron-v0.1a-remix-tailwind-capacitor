import { useFetcher, useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form"
import FormButton from "../inputs/FormButton";
import { ErrorMessage } from '@hookform/error-message'
import { toast, ToastContainer } from "react-toastify";
import DefaultSpinner from "../layout/DefaultSpinner";


export default function ProfileAccountInformationForm() {

    const data = useLoaderData();

    const userMetadata = data.metadata

    const userNames: string[] = data.usernames;

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

    const IsUsernameAvailable = (username: string) => {
        return userNames.indexOf(username) == -1 || username == userMetadata.displayName
    }
    const fetcher = useFetcher();
    const { handleSubmit, register, trigger, formState: { errors }, control } = useForm();

    const phoneNumber = useWatch({ control, name: 'phoneNumber' })
    const bankAccount = useWatch({ control, name: 'bankAccount' })
    const ifscCode = useWatch({ control, name: 'ifscCode' })
    const address = useWatch({ control, name: 'address' })
    const city = useWatch({ control, name: 'city' })
    const state = useWatch({ control, name: 'state' })
    const pincode = useWatch({ control, name: 'pincode' })


    useEffect(() => {
        trigger()
        if (fetcher.type === "done") {
            console.log("THE FETCHER TYPE IS " + fetcher.type)
            toast(<div><h2>Details saved!</h2></div>, { theme: "dark", type: "success" })
        }

    }, [phoneNumber, bankAccount, ifscCode, address, city, state, pincode, fetcher, trigger])

    return (<form onSubmit={
        handleSubmit(async (data) => {
            const form = new FormData()
            console.log(data);
            form.append('payload', JSON.stringify(data));

            fetcher.submit(form, { method: "post" });

        })
    }>

        <h2 className="prose prose-lg mt-3 text-white"> Account Details </h2>
        <div className="relative w-auto mt-2 mb-5 sm:mt-5 sm:mb-5 flex flex-col ">
            <span className=" prose prose-md text-white mb-5">Phone Number</span>
            <input type="text" id="phone-number"  {...register('phoneNumber', {
                required: 'This field is required', pattern: {
                    value: /^[^0]\d{9}/, message: "Not a valid Indian phone number"
                }
            })} defaultValue={userMetadata.phoneNumber} className=" bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-auto h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " placeholder="Ring ring... its your money calling :P " required />
            <div className="w-full h-10 mt-3">
                <ErrorMessage errors={errors} name='phoneNumber' render={(data) => {
                    return <span className="text-red-500 p-2 m-3 z-10">{data.message}</span>
                }} />
            </div>
            <div className="flex items-end mt-5 flex-col space-y-3 sm:space-x-3 sm:flex-row w-full">
                <div className="sm:text-center space-y-3 w-full h-auto">
                    <span className=" prose prose-md text-white">Bank Account</span>
                    <input  {...register('bankAccount', {
                        required: true, pattern: {
                            value: /^\d{9,18}$/, message: 'Not a valid Indian bank account'
                        }
                    })} type="text" placeholder="You know what to do..." defaultValue={userMetadata.bankAccount} className=" bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white text-sm rounded-lg invalid:border-red-500 placeholder-white block w-full h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " />
                    <div className="w-full h-10 mt-3 text-left">
                        <ErrorMessage errors={errors} name='bankAccount' render={(data) => {
                            return <span className="text-red-500 p-2 m-3 z-10">{data.message}</span>
                        }} />
                    </div>

                </div>


                <div className="sm:text-center space-y-3 w-full">
                    <span className=" prose prose-md text-white">IFSC Code</span>
                    <input {...register('ifscCode', { required: true, pattern: { value: /^[A-Z]{4}0[A-Z0-9]{6}$/, message: 'This is not a valid IFSC Code' } })} type="text" placeholder="e.g: ICIC0001875" defaultValue={userMetadata.ifscCode} className=" bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-full h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " />
                    <div className="w-full h-10 mt-3 text-left">
                        <ErrorMessage errors={errors} name='ifscCode' render={(data) => {
                            return <span className="text-red-500 p-2 m-3 z-10">{data.message}</span>
                        }} />
                    </div>
                </div>
                <div className="sm:text-center space-y-3 w-full">
                    <span className=" prose prose-md text-white">Address</span>
                    <input {...register('address', { required: true, minLength: { value: 10, message: 'Please enter a complete billing address' } })} type="text" placeholder="e.g: Your mom's basement" defaultValue={userMetadata.address} className=" bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-full h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " />
                    <div className="w-full h-10 mt-3 text-left">
                        <ErrorMessage errors={errors} name='address' render={(data) => {
                            return <span className="text-red-500 p-2 m-3 z-10">{data.message}</span>
                        }} />
                    </div>
                </div>

                <div className="sm:text-center space-y-3 w-full">
                    <span className=" prose prose-md text-white">City</span>
                    <input {...register('city', { required: true })} type="text" placeholder="e.g: Bengaluru" defaultValue={userMetadata.city} className=" bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-full h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " />
                    <div className="w-full h-10 mt-3 text-left">
                        <ErrorMessage errors={errors} name='city' render={(data) => {
                            return <span className="text-red-500 p-2 m-3 z-10">{data.message}</span>
                        }} />
                    </div>
                </div>

                <div className="sm:text-center space-y-3 w-full">
                    <span className=" prose prose-md text-white">State</span>
                    <input {...register('state', { required: true })} type="text" placeholder="e.g: Karnataka" defaultValue={userMetadata.state} className=" bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-full h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " />
                    <div className="w-full h-10 mt-3 text-left">
                        <ErrorMessage errors={errors} name='state' render={(data) => {
                            return <span className="text-red-500 p-2 m-3 z-10">{data.message}</span>
                        }} />
                    </div>
                </div>

                <div className="sm:text-center space-y-3 w-full">
                    <span className=" prose prose-md text-white">Pincode</span>
                    <input {...register('pincode', { required: true, maxLength: { value: 6, message: 'Please enter a valid Indian pincode' }, pattern: { value: /[1-9]*/, message: "Please enter a valid Indian pincode" } })} type="text" placeholder="e.g: 560*** " defaultValue={userMetadata.pincode} className=" bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-full h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " />
                    <div className="w-full h-10 mt-3 text-left">
                        <ErrorMessage errors={errors} name='pincode' render={(data) => {
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


