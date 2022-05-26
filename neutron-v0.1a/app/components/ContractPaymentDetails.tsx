import { useFormContext } from "react-hook-form";
import { ContractStageStore } from "~/stores/ContractStageStore";





export default function ContractPaymentDetails() {

    const formMethods = useFormContext();

    return (
        <>
            <h1 className="prose prose-lg text-black"> Payment </h1>

            <h2 className="prose prose-md text-black"> The client will pay </h2>
            <label htmlFor="country-select" className="sr-only">The client will pay</label>
            <select id="country-select" {...formMethods.register('contractValue')} className="w-40 text-white bg-bg-primary-dark border-solid border-white border-2 rounded-lg p-5">
                <option value="one-time">A flat fee</option>
                <option value="recurring">A recurring fee</option>
            </select>
            <h2 className="prose prose-md text-black"> The contract is valid from </h2>

            <label htmlFor="simple-search" className="sr-only">Contract validity</label>
            <div className="relative w-auto ">
                <input type="date" placeholder="Start Date" id="start-date" {...formMethods.register('startDate')} className="p-5 bg-bg-primary-dark border border-gray-300 text-gray-900 text-sm rounded-lg placeholder-white block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white " required />
                <input type="date" placeholder="End Date" id="end-date" {...formMethods.register('endDate')} className="p-5 bg-bg-primary-dark border border-gray-300 text-gray-900 text-sm rounded-lg placeholder-white block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white " required />
            </div>
            <h2 className="prose prose-md text-black"> In case of premature termination, the Client will pay </h2>
            <label htmlFor="country-select" className="sr-only">The client will pay</label>
            <select id="country-select" {...formMethods.register('contractPenalty')} className="w-40 text-white bg-bg-primary-dark border-solid border-white border-2 rounded-lg p-5">
                <option value="one-time">A flat fee</option>
                <option value="recurring">A recurring fee</option>
            </select>
            <input readOnly value="Finalize" className="w-40 rounded-lg bg-accent-dark p-3 text-white transition-all hover:scale-105" onClick={() => {
                ContractStageStore.update(s => {
                    s.stage = 5;
                });
            }} />
        </>);
}