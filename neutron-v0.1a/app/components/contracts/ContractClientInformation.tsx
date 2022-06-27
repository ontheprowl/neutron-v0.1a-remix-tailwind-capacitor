import { useFormContext } from "react-hook-form";
import { ContractDataStore } from "~/stores/ContractStores";
import { ContractCreationStages } from "~/types/contracts";
import FormButton from "../inputs/FormButton";
import TransparentButton from "../inputs/TransparentButton";




export default function ContractClientInformation() {

    const formMethods = useFormContext();

    const { startDate, endDate, redressalWindow } = ContractDataStore.useState();

    return (
        <>
            <h2 className="prose prose-lg mt-5 text-white"> Client Details </h2>
            <label htmlFor="simple-search" className="sr-only">Client Name</label>
            <div className="flex flex-row relative w-auto items-end space-x-10 justify-start align-middle">
                {/* <div className="relative w-auto ">
                    <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                        <svg className="w-5 h-5 text-white dark:text-black" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path></svg>
                    </div>
                    <input type="text" id="existing-client" className=" bg-[#4A4A4A] pt-3 pb-3 pl-10 pr-4 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-auto h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " placeholder="Search for an existing client" required />

                </div> */}
                <input type="text" id="client-name" {...formMethods.register('clientName')} className=" bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-auto h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " placeholder="Client Name" required />
                <div className="flex h-20 w-5 border-l-gray-500 border-l-2"></div>
                <input type="text" id="client-email" {...formMethods.register('clientEmail')}
                    className=" bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-auto h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " placeholder="Client Email" required />

            </div>
            <label htmlFor="simple-search" className="sr-only">Search through contacts</label>

            <hr className="w-full mt-3 border-solid border-gray-500"></hr>

            <h2 className="prose prose-lg mt-5 text-white"> Basic Details </h2>
            <div className="relative w-auto mt-5 mb-5 flex flex-col ">
                <input type="text" id="project-name"  {...formMethods.register('projectName')}  className=" bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-auto h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " placeholder="Project Name" required />
                <div className="flex items-end mt-5 space-x-3 flex-row w-full">
                    <div className="text-center space-y-3 w-full">
                        <span className=" prose prose-md text-white">Contract Start Date</span>
                        <input  {...formMethods.register('startDate')} type="date" placeholder="Contract Start Date" className=" bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-full h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " />
                    </div>

                    <div className="text-center space-y-3 w-full">
                        <span className=" prose prose-md text-white">Contract End Date</span>
                        <input {...formMethods.register('endDate')} type="date" placeholder="Contract Start Date" className=" bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-full h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " />
                    </div>
                    <div className="flex h-20 w-5 border-l-gray-500 border-l-2"></div>

                    <div className="text-left space-y-3 w-full">
                        <span className=" prose prose-md text-white">Redressal Window</span>
                        <input {...formMethods.register('redressalWindow')} type="number" min="0" max="30" value={redressalWindow} defaultValue="14" placeholder="Contract Start Date" className=" bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-auto h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " />
                    </div>
                </div>

            </div>
            <FormButton onClick={() => {
                ContractDataStore.update(s => {
                    s.stage = ContractCreationStages.ScopeOfWork;
                    s.clientName=formMethods.getValues('clientName');
                    s.projectName=formMethods.getValues('projectName');
                    s.startDate=formMethods.getValues('startDate');
                    s.endDate=formMethods.getValues('endDate');
                    s.redressalWindow=formMethods.getValues('redressalWindow');
                });
            }} text="Create Contract"></FormButton>
        </>);
}