import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion';
import { Form, useNavigate } from '@remix-run/react';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { formatDateToReadableString, getRandomInt } from '~/utils/utils';
import { ContractDataStore } from '~/stores/ContractStores';
import ContractTemplateSelection from '~/components/contracts/ContractTemplateSelection';
import ContractClientInformation from '~/components/contracts/ContractClientInformation';
import ContractBasicInformation from '~/components/contracts/ContractBasicInformation';
import ContractScopeOfWork from '~/components/contracts/ContractScopeOfWork';
import ContractPaymentDetails from '~/components/contracts/ContractPaymentDetails';
import ContractEditScreen from '~/components/contracts/ContractEditScreen';
import { firestore, storage, auth } from '~/firebase/neutron-config';
import { addDoc, } from 'firebase/firestore';
import { collection } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage'
import GenericContractTemplate from '~/components/contracts/GenericContractTemplate';
import { Contract } from '~/types/contracts';
import { useAuthState } from 'react-firebase-hooks/auth';
import { primaryGradientDark } from '~/utils/neutron-theme-extensions';
import ContractProcessStepper from '~/components/contracts/ContractProcessStepper';


const stages = [<ContractClientInformation key={0}></ContractClientInformation>, <ContractScopeOfWork key={1}></ContractScopeOfWork>, <ContractPaymentDetails key={3}></ContractPaymentDetails>, <ContractEditScreen key={4}></ContractEditScreen>];


export default function ContractCreation() {

    const [user, loading, error] = useAuthState(auth);

    let navigate = useNavigate();
    const data = ContractDataStore.useState();
    const methods = useForm();

    return (
        <div className='flex flex-col space-y-8 bg-bg-primary-dark h-full'>
            <div className=" flex flex-col justify-between w-full">
                <div className='flex flex-row m-6 justify-between'>
                    <div className="flex flex-col">
                        <article className="prose">
                            <h2 className="text-white prose prose-lg">Welcome {user?.email}</h2>
                            <p className="text-white prose prose-sm">{formatDateToReadableString()}</p>
                        </article>
                    </div>
                    <div id="user-action-buttons">
                        <div>
                            {/**Add profile buttons here */}
                        </div>
                    </div>
                </div>

                <ContractProcessStepper/>
            </div>
            <div className={`bg-[#2A2A2A] p-3 rounded-lg border-2 border-solid border-accent-dark  h-auto m-6`}>
                <FormProvider {...methods}>
                    <form onSubmit={(event) => {
                        console.log('the data received for this form is :')
                        console.log(data);
                    }

                        // methods.handleSubmit(async (data) => {
                        //     data = { ...data, providerName: auth.name }
                        //     console.log(data);
                        //     for (const [key, value] of Object.entries(data)) {
                        //         if (key.includes('document')) {
                        //             const file = value.item(0);
                        //             const snapshot = await uploadBytes(ref(storage, `/documents/${file.name}`), file);
                        //             console.log('Contract document uploaded to storage....');
                        //             data[key] = snapshot.ref.fullPath
                        //         }
                        //     }
                        //     const docRef = await addDoc(collection(firestore, 'contracts'), data);
                        //     console.log(`Contract added to firestore with id ${docRef}`);
                        //     navigate(-1);
                        // })
                    }>
                        <AnimatePresence exitBeforeEnter>
                            <motion.div
                                key={data.stage}
                                animate={{ opacity: 1, x: 0 }}
                                initial={{ opacity: 0, x: 500 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.5 }}
                                className="m-8"
                            >
                                {stages[data.stage]}
                            </motion.div>
                        </AnimatePresence>
                    </form>
                </FormProvider>
            </div>
        </div>
    )
}