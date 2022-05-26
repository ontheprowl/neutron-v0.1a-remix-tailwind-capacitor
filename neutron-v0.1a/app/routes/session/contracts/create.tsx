import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion';
import { Form, useNavigate } from '@remix-run/react';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { getRandomInt } from '~/utils/utils';
import { ContractStageStore } from '~/stores/ContractStageStore';
import ContractTemplateSelection from '~/components/ContractTemplateSelection';
import ContractClientInformation from '~/components/ContractClientInformation';
import ContractBasicInformation from '~/components/ContractBasicInformation';
import ContractScopeOfWork from '~/components/ContractScopeOfWork';
import ContractPaymentDetails from '~/components/ContractPaymentDetails';
import ContractEditScreen from '~/components/ContractEditScreen';
import { firestore, storage, auth } from '~/firebase/neutron-config';
import { addDoc, } from 'firebase/firestore';
import { collection } from 'firebase/firestore';
import {ref, uploadBytes } from 'firebase/storage'


const stages = [<ContractTemplateSelection key={0}></ContractTemplateSelection>, <ContractClientInformation key={1}></ContractClientInformation>, <ContractBasicInformation key={2}></ContractBasicInformation>, <ContractScopeOfWork key={3}></ContractScopeOfWork>, <ContractPaymentDetails key={4}></ContractPaymentDetails>, <ContractEditScreen key={5}></ContractEditScreen>];


export default function ContractCreation() {

    let navigate = useNavigate();
    const stage = ContractStageStore.useState(s => s.stage);
    const methods = useForm();

    return (
        <div className='flex flex-col space-y-8 m-4'>
            <div className=" flex flex-row justify-between">
                <div className="flex items-center w-[692px]">
                    <label htmlFor="simple-search" className="sr-only">Search through contacts</label>
                    <div className="relative w-auto ">
                        <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                            <svg className="w-5 h-5 text-white dark:text-black" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path></svg>
                        </div>
                        <input type="text" id="simple-search" className="p-5 bg-bg-primary-dark border border-gray-300 text-gray-900 text-sm rounded-lg placeholder-white block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white " placeholder="Search through contracts" required />

                    </div>
                </div>
                <div className='justify-end'>
                    <button
                        className="w-40 rounded-lg bg-accent-dark p-3 text-white transition-all hover:scale-105"
                    >
                        Save as Draft
                    </button>
                </div>
            </div>
            <div className='bg-secondary-dark rounded-lg h-[60vh] flex flex-col space-y-4 h-auto'>
                <FormProvider {...methods}>
                    <form onSubmit={methods.handleSubmit(async (data) => {
                        data = {...data,providerName: auth.name}
                        console.log(data);
                        for (const [key, value] of Object.entries(data) ){
                            if(key.includes('document')){
                                const file = value.item(0);
                                const snapshot = await uploadBytes( ref(storage,`/documents/${file.name}`), file);
                                console.log('Contract document uploaded to storage....');
                                data[key]=snapshot.ref.fullPath
                            }
                        }
                        const docRef= await addDoc(collection(firestore,'contracts'), data);
                        console.log(`Contract added to firestore with id ${docRef}`);
                        navigate(-1);
                    })}>
                        <AnimatePresence exitBeforeEnter>
                            <motion.div
                                key={stage}
                                animate={{ opacity: 1, x: 0 }}
                                initial={{ opacity: 0, x: 500 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.5 }}
                            >
                                {stages[stage]}
                            </motion.div>
                        </AnimatePresence>
                    </form>
                </FormProvider>

            </div>
        </div >);

}