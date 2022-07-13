import { useFetcher, useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form"
import FormButton from "../inputs/FormButton";
import { ErrorMessage } from '@hookform/error-message'


export default function ProfileAccountInformationForm() {

    const data = useLoaderData();

    const userMetadata = data.metadata

    const userNames: string[] = data.usernames;

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

    }, [phoneNumber, bankAccount, ifscCode, address, city, state, pincode, trigger])

    return (<form onSubmit={
        handleSubmit(async (data) => {
            const form = new FormData()
            console.log(data);
            form.append('payload', JSON.stringify(data));

            fetcher.submit(form, { method: "post", action: `/${userMetadata.displayName}/profile/modify` });

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
            </div>

        </div>
        <FormButton onClick={() => { }} text="Save" submit></FormButton>
    </form>)
}


