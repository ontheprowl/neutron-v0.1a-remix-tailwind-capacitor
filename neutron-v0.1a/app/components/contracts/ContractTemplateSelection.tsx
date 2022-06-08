
import * as React from "react";
import { useFormContext } from "react-hook-form";
import { ContractDataStore } from "~/stores/ContractStores";


const templateTypes = ['Design', 'Development', 'Videography', 'Consulting', 'Marketing', 'Photography', 'Writing', 'Others'];

export default function ContractTemplateSelection() {

    const template = ContractDataStore.useState(s => s.template);

    const formMethods = useFormContext();
    return (
        <div className="flex flex-col space-y-4 h-full ">
            <input type="text" value={template} className="hidden" {...formMethods.register('template')}></input>
            {templateTypes.map((templateType) => {
                return (<input key={templateType} type="button" value={templateType} onClick={() => {
                    formMethods.setValue('template', templateType);
                }} className="relative max-w-lg bg-bg-primary-dark border-solid transition-all hover:scale-105 border-white border-2 text-white text-sm rounded-lg placeholder-white block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white ">
                </input>)
            })}
            <input readOnly type="button" className="w-40 rounded-lg bg-accent-dark p-3 text-white transition-all hover:scale-105" onClick={() => {
                ContractDataStore.update(s => {
                    s.stage = 1;
                });
            }} value="Continue" placeholder="Continue"/>

        </div >);
}