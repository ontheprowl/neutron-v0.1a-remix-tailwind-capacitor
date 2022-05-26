import { useFormContext } from "react-hook-form";
import { ContractStageStore } from "~/stores/ContractStageStore";




export default function ContractClientInformation() {

    const formMethods = useFormContext();

    return (
        <>
            <h2 className="prose prose-md text-black"> Client</h2>
            <label htmlFor="simple-search" className="sr-only">Client Name</label>
            <div className="relative w-auto ">
                <input type="text" id="client-name" {...formMethods.register('clientName')} className="p-5 bg-bg-primary-dark border border-gray-300 text-gray-900 text-sm rounded-lg placeholder-white block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white " placeholder="Client Name" required />
            </div>
            <label htmlFor="simple-search" className="sr-only">Search through contacts</label>
            <div className="relative w-auto ">
                <input type="text" id="client-email" {...formMethods.register('clientEmail')} className="p-5 bg-bg-primary-dark border border-gray-300 text-gray-900 text-sm rounded-lg placeholder-white block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white " placeholder="Client Email" required />
            </div>
            <br></br>Or <br></br>
            <label htmlFor="simple-search" className="sr-only">Search for an existing client</label>
            <div className="relative w-auto ">
                <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                    <svg className="w-5 h-5 text-white dark:text-black" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path></svg>
                </div>
                <input type="text" id="existing-client" className="p-5 bg-bg-primary-dark border border-gray-300 text-gray-900 text-sm rounded-lg placeholder-white block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white " placeholder="Search for an existing client" required />

            </div>
            <h2 className="prose prose-md text-black"> Project</h2>
            <div className="relative w-auto ">
                <input type="text" id="project-name" {...formMethods.register('projectName')} className="p-5 bg-bg-primary-dark border border-gray-300 text-gray-900 text-sm rounded-lg placeholder-white block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white " placeholder="Project Name" required />
            </div>
            <input readOnly value="Continue" className="w-40 rounded-lg bg-accent-dark p-3 text-white transition-all hover:scale-105" onClick={() => {
                ContractStageStore.update(s => {
                    s.stage = 2;
                });
            }} />
        </>);
}