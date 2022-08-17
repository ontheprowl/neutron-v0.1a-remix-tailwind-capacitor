import { useFormContext, useWatch } from "react-hook-form";
import { ContractDataStore } from "~/stores/ContractStores";
import { Contract, ContractCreationStages, ContractCreator } from "~/models/contracts";
import FormButton from "../inputs/FormButton";
import TransparentButton from "../inputs/TransparentButton";
import AccentedToggle from "../layout/AccentedToggle";
import { useStoreState } from "pullstate";
import { ErrorMessage } from "@hookform/error-message";
import { useEffect, useState } from "react";
import { ValidationPatterns, minStartDate, minEndDate, isEmpty } from "~/utils/utils";
import { toast } from "react-toastify";
import NeutronModal from "../layout/NeutronModal";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useMatchesData } from "~/utils";




export default function ContractClientInformation() {

    const { validEmails, users }: { validEmails: string[], users: [{ id: string, data: { [key: string]: any } }] } = useLoaderData();



    console.dir(users)
    function IsProfileComplete(v: any) {
        return validEmails.indexOf(v) != -1 && users.find((value) => {
            return (value.data.email == v && value.data.profileComplete == true)
        })
    }


    function returnUserUID(userEmail: any) {
        const targetUser = users.find((value) => {
            return (value.data.email == userEmail)
        })
        const uid = targetUser?.data.uid;
        return uid;

    }


    let fetcher = useFetcher();
    const formMethods = useFormContext();
    const errors = formMethods.formState.errors;
    const trigger = formMethods.trigger;

    const [showModal, setShowModal] = useState(true);



    const startDate = useWatch({ name: 'startDate' })
    const endDate = useWatch({ name: 'endDate' })
    const revisions = useWatch({ name: 'revisions' })
    const projectName = useWatch({ name: 'projectName' })

    const clientName = useWatch({ name: 'clientName' })
    const clientEmail = useWatch({ name: 'clientEmail' })
    const providerName = useWatch({ name: 'providerName' })
    const providerEmail = useWatch({ name: 'providerEmail' })





    useEffect(() => {
        trigger()

    }, [startDate, endDate, revisions, projectName, clientName, clientEmail, providerName, providerEmail, trigger])

    // useEffect(() => {
    //     console.log(fetcher.data)
    // }, [fetcher])


    const creator = ContractDataStore.useState(s => s.creator);

    console.log("The creator of this contract is :" + creator)


    return (
        <div>
            <div className="flex flex-row items-center space-x-3">
                <AccentedToggle name="isClient" states={{
                    default: <div className="text-white">
                        <h1 className="font-gilroy-black">Employer</h1>
                        <span className="font-gilroy-bold">Are you requesting the service?</span>
                    </div>, toggled: <div className="text-white">
                        <h1 className="font-gilroy-black">Service Provider</h1>
                        <span className="font-gilroy-bold">Are you providing the service?</span>
                    </div>
                }} onToggle={() => {
                    if (creator === ContractCreator.IndividualServiceProvider) {
                        ContractDataStore.update((s: Contract) => {
                            s.creator = ContractCreator.IndividualClient
                        })
                        // formMethods.unregister('providerName');
                        // formMethods.unregister('providerEmail');
                    } else {
                        ContractDataStore.update((s: Contract) => {
                            s.creator = ContractCreator.IndividualServiceProvider
                        })
                        // formMethods.unregister('clientName');
                        // formMethods.unregister('clientEmail');
                    }
                }}></AccentedToggle>
            </div>

            <h2 className="prose prose-lg mb-5 sm:mb-0 mt-5 text-white font-gilroy-bold text-[24px]"> Counter-Party Details </h2>
            <label htmlFor="simple-search" className="sr-only">{creator === ContractCreator.IndividualServiceProvider ? 'Employer Name ' : 'Service Provider Name'}</label>
            <div className="flex flex-col sm:flex-row relative w-auto sm:items-end space-y-5 sm:space-x-10 justify-start align-middle">
                {/* <div className="relative w-auto ">
                    <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                        <svg className="w-5 h-5 text-white dark:text-black" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path></svg>
                    </div>
                    <input type="text" id="existing-client" className=" bg-[#4A4A4A] pt-3 pb-3 pl-10 pr-4 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-auto h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " placeholder="Search for an existing client" required />

                </div> */}
                <div className=" space-y-3 w-full">
                    <span className=" prose prose-md text-white font-gilroy-regular text-[18px]">{creator === ContractCreator.IndividualServiceProvider ? 'Employer Name ' : 'Service Provider Name'}</span>
                    <input type="text" id="client-name" {...formMethods.register(creator === ContractCreator.IndividualServiceProvider ? 'clientName' : 'providerName', { required: 'This field is required', maxLength: { value: 20, message: 'Client name cannot exceed 20 characters' } })} className=" bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-full h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " placeholder="e.g : Acme Corp" required />
                    <div className="w-full h-5 mt-3 text-left">
                        <ErrorMessage errors={errors} name={creator == ContractCreator.IndividualServiceProvider ? 'clientName' : 'providerName'} render={(data) => {
                            return <span className="text-red-500 p-0 m-1 z-10">{data.message}</span>
                        }} />
                    </div>
                </div>
                <div className="hidden sm:flex sm:h-20 w-5 border-l-gray-500 border-l-2"></div>
                <div className=" space-y-3 w-full">
                    <span className=" prose prose-md text-white font-gilroy-regular text-[18px]">{creator === ContractCreator.IndividualServiceProvider ? 'Employer Email ' : 'Service Provider Email'}</span>
                    <input type="text" id="client-email" {...formMethods.register(creator === ContractCreator.IndividualServiceProvider ? 'clientEmail' : 'providerEmail', {
                        required: 'This field is required', pattern: {
                            value: ValidationPatterns.emailValidationPattern,
                            message: 'Not a valid email ID '
                        }, validate: (v) => {
                            return IsProfileComplete(v) || 'Either there is no Neutron account with this email ID, or the associated profile is not complete.';
                        }
                    })}
                        className=" bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-full h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " placeholder="e.g : businessman@business.biz" required />

                    <div className="w-full h-5 mt-3 text-left">
                        <ErrorMessage errors={errors} name={creator === ContractCreator.IndividualServiceProvider ? 'providerEmail' : 'clientName'} render={(data) => {
                            return <span className="text-red-500 p-0 m-1 z-10">{data.message}</span>
                        }} />
                    </div>
                </div>

            </div>
            <label htmlFor="simple-search" className="sr-only">Search through contacts</label>

            <hr className="w-full mt-5 border-solid border-gray-500"></hr>

            <h2 className="prose prose-lg mt-3 text-white font-gilroy-bold text-[24px]"> Basic Details </h2>
            <div className="relative w-full mt-2 mb-5 sm:mt-5 sm:mb-5 flex flex-col ">
                <div className=" space-y-3 w-full">
                    <span className=" prose prose-md text-white w-full font-gilroy-regular text-[18px]"> Project Name </span>

                    <input type="text" id="project-name"  {...formMethods.register('projectName', { required: 'This field is required', pattern: { value: ValidationPatterns.projectNameValidationPattern, message: 'Project name cannot contain numbers' } })} className=" bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-full h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " placeholder="Project Name" required />
                    <div className="w-full h-5 mt-3 text-left">
                        <ErrorMessage errors={errors} name='projectName' render={(data) => {
                            return <span className="text-red-500 p-0 m-1 z-10">{data.message}</span>
                        }} />
                    </div>
                </div>

                <div className="flex items-end mt-5 flex-col space-y-3 sm:space-x-3 sm:flex-row w-full">
                    <div className=" space-y-3 w-full">
                        <span className=" prose prose-md text-white font-gilroy-regular text-[18px]">Contract Start Date</span>
                        <input  {...formMethods.register('startDate', { required: 'This field is required' })} type="date" min={minStartDate()} placeholder="Contract Start Date" className=" bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-full h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " />
                        <div className="w-full h-5  mt-3 text-left">
                            <ErrorMessage errors={errors} name='startDate' render={(data) => {
                                return <span className="text-red-500 p-0 m-1 z-10">{data.message}</span>
                            }} />
                        </div>
                    </div>

                    <div className=" space-y-3 w-full">
                        <span className=" prose prose-md text-white font-gilroy-regular text-[18px]">Contract End Date</span>
                        <input {...formMethods.register('endDate', { required: 'This field is required' })} type="date" min={minEndDate(startDate)} placeholder="Contract Start Date" className=" bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-full h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " />
                        <div className="w-full h-5 mt-3 text-left">
                            <ErrorMessage errors={errors} name='endDate' render={(data) => {
                                return <span className="text-red-500 p-0 m-1 z-10">{data.message}</span>
                            }} />
                        </div>
                    </div>
                    <div className="hidden sm:flex h-20 w-5 border-l-gray-500 border-l-2"></div>

                    <div className="text-left space-y-3 w-full">
                        <span className=" prose prose-md text-white font-gilroy-regular text-[18px]">No. of Revisions </span>
                        <input {...formMethods.register('revisions')} type="number" min="0" max="30" value={revisions} defaultValue="0" placeholder="e.g : 15 days" className=" bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-full h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " />
                        <div className="w-full h-5 mt-3 text-left">
                            <ErrorMessage errors={errors} name='revisions' render={(data) => {
                                return <span className="text-red-500 p-0 m-1 z-10">{data.message}</span>
                            }} />
                        </div>
                    </div>
                </div>

            </div>
            <FormButton className="w-40 rounded-lg  bg-accent-dark p-3 border-2 border-transparent active:bg-amber-300 outline-none focus:ring-1 focus:ring-white focus:border-white hover:border-white hover:ring-white text-white transition-all" onClick={() => {
                if (!isEmpty(errors)) {

                    toast("Invalid values detected for contract fields!", { theme: 'dark', type: 'warning' })
                } else {
                    ContractDataStore.update(s => {
                        s.stage = ContractCreationStages.ScopeOfWork;
                        s.clientName = formMethods.getValues('clientName');
                        s.clientEmail = formMethods.getValues('clientEmail')
                        s.providerName = formMethods.getValues('providerName');
                        s.providerEmail = formMethods.getValues('providerEmail');
                        s.projectName = formMethods.getValues('projectName');
                        s.startDate = formMethods.getValues('startDate');
                        s.endDate = formMethods.getValues('endDate');
                        s.revisions = formMethods.getValues('revisions');
                    });
                }

            }} text="Create Contract"></FormButton>
            {showModal && <NeutronModal onConfirm={() => { setShowModal(false) }} heading={<p>Important Notice</p>} body={<p>Neutron provides generic contracts, but it may not contain important clauses for your country.<br></br><br></br> You can use and modify the contracts as you like, but it's provided 'as is' and to be used at your own risk. <br></br> <br></br><span className="text-purple-500 break-normal">Contracts can only be created between two Neutron users whose profiles and KYC have been completed</span> </p>} toggleModalFunction={setShowModal}></NeutronModal>}

        </div >);
}


