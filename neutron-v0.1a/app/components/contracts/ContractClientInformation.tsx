import { useFormContext, useWatch } from "react-hook-form";
import { ContractDataStore } from "~/stores/ContractStores";
import { Contract, ContractCreationStages, ContractCreator } from "~/models/contracts";
import FormButton from "../inputs/FormButton";
import TransparentButton from "../inputs/TransparentButton";
import AccentedToggle from "../layout/AccentedToggle";
import { useStoreState } from "pullstate";
import { ErrorMessage } from "@hookform/error-message";
import { useEffect } from "react";
import { ValidationPatterns } from "~/utils/utils";




export default function ContractClientInformation() {

    const formMethods = useFormContext();

    const minStartDate = () => {
        return new Date().toISOString().split("T")[0];
    }

    const minEndDate = () => {
        const startDate = formMethods.getValues('startDate')

        return startDate ? new Date(startDate).toISOString().split("T")[0] : minStartDate();
    }

    const errors = formMethods.formState.errors;
    const control = formMethods.control;
    const trigger = formMethods.trigger;

    const startDate = useWatch({ control, name: 'startDate' })
    const endDate = useWatch({ control, name: 'endDate' })
    const redressalWindow = useWatch({ control, name: 'redressalWindow' })
    const projectName = useWatch({ control, name: 'projectName' })

    const clientName = useWatch({ control, name: 'clientName' })
    const clientEmail = useWatch({ control, name: 'clientEmail' })

    useEffect(() => {
        trigger()

    }, [startDate, endDate, redressalWindow, projectName, clientName, clientEmail, trigger])


    const creator = ContractDataStore.useState(s => s.creator);


    return (
        <div>
            <AccentedToggle name="isClient" states={{ default: 'Client', toggled: 'Freelancer' }} onToggle={() => {
                if (creator == ContractCreator.IndividualServiceProvider) {
                    ContractDataStore.update((s: Contract) => {
                        s.creator = ContractCreator.IndividualClient
                    })
                } else {
                    ContractDataStore.update((s: Contract) => {
                        s.creator = ContractCreator.IndividualServiceProvider
                    })
                }
            }}></AccentedToggle>
            <h2 className="prose prose-lg mb-5 sm:mb-0 mt-5 text-white"> Counter-Party Details </h2>
            <label htmlFor="simple-search" className="sr-only">{creator == ContractCreator.IndividualServiceProvider ? 'Client Name ' : 'Contractor Name'}</label>
            <div className="flex flex-col sm:flex-row relative w-auto sm:items-end space-y-5 sm:space-x-10 justify-start align-middle">
                {/* <div className="relative w-auto ">
                    <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                        <svg className="w-5 h-5 text-white dark:text-black" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path></svg>
                    </div>
                    <input type="text" id="existing-client" className=" bg-[#4A4A4A] pt-3 pb-3 pl-10 pr-4 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-auto h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " placeholder="Search for an existing client" required />

                </div> */}
                <div className="sm:text-center space-y-3 w-full">
                    <span className=" prose prose-md text-white">{creator == ContractCreator.IndividualServiceProvider ? 'Client Name ' : 'Contractor Name'}</span>
                    <input type="text" id="client-name" {...formMethods.register('clientName', { required: 'This field is required', maxLength: { value: 20, message: 'Client name cannot exceed 20 characters' } })} className=" bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-full h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " placeholder="e.g : Acme Corp" required />
                    <div className="w-full h-10 mt-3 text-left">
                        <ErrorMessage errors={errors} name='clientName' render={(data) => {
                            return <span className="text-red-500 p-2 m-3 z-10">{data.message}</span>
                        }} />
                    </div>
                </div>
                <div className="hidden sm:flex sm:h-20 w-5 border-l-gray-500 border-l-2"></div>
                <div className="sm:text-center space-y-3 w-full">
                    <span className=" prose prose-md text-white">{creator == ContractCreator.IndividualServiceProvider ? 'Client Email ' : 'Contractor Email'}</span>
                    <input type="text" id="client-email" {...formMethods.register('clientEmail', {
                        required: 'This field is required', pattern: {
                            value: ValidationPatterns.emailValidationPattern,
                            message: 'Not a valid email ID '
                        }
                    })}
                        className=" bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-full h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " placeholder="e.g : businessman@business.biz" required />
                    <div className="w-full h-10 mt-3 text-left">
                        <ErrorMessage errors={errors} name='clientEmail' render={(data) => {
                            return <span className="text-red-500 p-2 m-3 z-10">{data.message}</span>
                        }} />
                    </div>
                </div>

            </div>
            <label htmlFor="simple-search" className="sr-only">Search through contacts</label>

            <hr className="w-full mt-5 border-solid border-gray-500"></hr>

            <h2 className="prose prose-lg mt-3 text-white"> Basic Details </h2>
            <div className="relative w-auto mt-2 mb-5 sm:mt-5 sm:mb-5 flex flex-col ">
                <input type="text" id="project-name"  {...formMethods.register('projectName', { required: 'This field is required', pattern:{value:/^[a-z A-Z]+$/, message:'Project name cannot contain numbers'} })} className=" bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-auto h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " placeholder="Project Name" required />

                <div className="flex items-end mt-5 flex-col space-y-3 sm:space-x-3 sm:flex-row w-full">
                    <div className="sm:text-center space-y-3 w-full">
                        <span className=" prose prose-md text-white">Contract Start Date</span>
                        <input  {...formMethods.register('startDate', { required: 'This field is required' })} type="date" min={minStartDate()} placeholder="Contract Start Date" className=" bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-full h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " />
                        <div className="w-full h-10 mt-3 text-left">
                            <ErrorMessage errors={errors} name='startDate' render={(data) => {
                                return <span className="text-red-500 p-2 m-3 z-10">{data.message}</span>
                            }} />
                        </div>
                    </div>

                    <div className="sm:text-center space-y-3 w-full">
                        <span className=" prose prose-md text-white">Contract End Date</span>
                        <input {...formMethods.register('endDate', { required: 'This field is required' })} type="date" min={minEndDate()} placeholder="Contract Start Date" className=" bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-full h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " />
                        <div className="w-full h-10 mt-3 text-left">
                            <ErrorMessage errors={errors} name='endDate' render={(data) => {
                                return <span className="text-red-500 p-2 m-3 z-10">{data.message}</span>
                            }} />
                        </div>
                    </div>
                    <div className="hidden sm:flex h-20 w-5 border-l-gray-500 border-l-2"></div>

                    <div className="text-left space-y-3 w-full">
                        <span className=" prose prose-md text-white">Redressal Window</span>
                        <input {...formMethods.register('redressalWindow')} type="number" min="0" max="30" value={redressalWindow} defaultValue="14" placeholder="Contract Start Date" className=" bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-auto h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " />
                        <div className="w-full h-10 mt-3 text-left">
                            <ErrorMessage errors={errors} name='redressalWindow' render={(data) => {
                                return <span className="text-red-500 p-2 m-3 z-10">{data.message}</span>
                            }} />
                        </div>
                    </div>
                </div>

            </div>
            <FormButton onClick={() => {
                ContractDataStore.update(s => {
                    s.stage = ContractCreationStages.ScopeOfWork;
                    s.clientName = formMethods.getValues('clientName');
                    s.projectName = formMethods.getValues('projectName');
                    s.startDate = formMethods.getValues('startDate');
                    s.endDate = formMethods.getValues('endDate');
                    s.redressalWindow = formMethods.getValues('redressalWindow');
                });
            }} text="Create Contract"></FormButton>
        </div>);
}