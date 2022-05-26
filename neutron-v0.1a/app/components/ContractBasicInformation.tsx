import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { ContractStageStore } from "~/stores/ContractStageStore";
import { CountrySelect } from "~/utils/utils";




export default function ContractBasicInformation() {

    const individual = useWatch({ name: 'individual' });

    const formMethods = useFormContext();

    return (
        <>
            <h2 className="prose prose-md text-black"> Basic Information </h2>

            <p> I am a contractor based in </p>
            <label htmlFor="country-select" className="sr-only">Please select your country</label>
            <CountrySelect id="country-select" className="w-40 text-white bg-bg-primary-dark border-solid border-white border-2 rounded-lg p-5"></CountrySelect>
            <label htmlFor="simple-search" className="sr-only">Do you work for a company?</label>
            <div className="relative w-auto ">
                <p>Do you represent an enterprise?</p>
                <input type="checkbox" defaultValue="false" id="client-name" {...formMethods.register('individual')} className="p-5 bg-bg-primary-dark border border-gray-300 text-gray-900 text-sm rounded-lg placeholder-white block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white " required />

            </div>
            {!individual ? '' :
                <>
                    <h2 className="prose prose-md text-black"> Company Details </h2>
                    <label htmlFor="simple-search" className="sr-only">Company Details</label>
                    <div className="relative w-auto ">
                        <input type="text" id="company-name" {...formMethods.register('companyName')} className="p-5 bg-bg-primary-dark border border-gray-300 text-gray-900 text-sm rounded-lg placeholder-white block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white " placeholder="Company Name" required />
                    </div><div>
                    <div className="relative w-auto ">
                        <input type="text" id="job-title" {...formMethods.register('jobTitle')} className="p-5 bg-bg-primary-dark border border-gray-300 text-gray-900 text-sm rounded-lg placeholder-white block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white " placeholder="Job Title" required />
                    </div></div>
                </>}
            <input readOnly value="Continue" className="w-40 rounded-lg bg-accent-dark p-3 text-white transition-all hover:scale-105" onClick={() => {
                ContractStageStore.update(s => {
                    s.stage = 3;
                });
            }} />
        </>);
}