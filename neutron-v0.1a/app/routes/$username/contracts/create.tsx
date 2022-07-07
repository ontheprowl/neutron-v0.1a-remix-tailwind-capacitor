import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion';
import { Form, useActionData, useNavigate, useSubmit } from '@remix-run/react';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { formatDateToReadableString, getRandomInt } from '~/utils/utils';
import { ContractDataStore } from '~/stores/ContractStores';
import ContractTemplateSelection from '~/components/contracts/ContractTemplateSelection';
import ContractClientInformation from '~/components/contracts/ContractClientInformation';
import ContractBasicInformation from '~/components/contracts/ContractBasicInformation';
import ContractScopeOfWork from '~/components/contracts/ContractScopeOfWork';
import ContractPaymentDetails from '~/components/contracts/ContractPaymentDetails';
import ContractEditScreen from '~/components/contracts/ContractEditScreen';
import { auth, firestore, storage } from '~/firebase/neutron-config.server';
import { useAuthState } from 'react-firebase-hooks/auth';
import ContractProcessStepper from '~/components/contracts/ContractProcessStepper';
import { ActionFunction, redirect } from '@remix-run/server-runtime';
import { json } from '@remix-run/server-runtime';
import { ref, uploadBytes } from 'firebase/storage';
import { addDoc, collection } from 'firebase/firestore';
import { EventEmitter } from 'stream';
import MobileNavbarPadding from '~/components/layout/MobileNavbarPadding';
import { addFirestoreDocFromData } from '~/firebase/queries.server';



const stages = [<ContractClientInformation key={0}></ContractClientInformation>, <ContractScopeOfWork key={1}></ContractScopeOfWork>, <ContractPaymentDetails key={3}></ContractPaymentDetails>, <ContractEditScreen key={4}></ContractEditScreen>];


export const action: ActionFunction = async ({ request }) => {

    console.log(`from the Action Function`);
    const dataString = (await request.formData()).get('payload')?.toString();
    if (dataString != undefined) {
        const data = JSON.parse(dataString);
        return await addFirestoreDocFromData(data);
    }
}


export default function ContractCreation() {

    const [user, loading, error] = useAuthState(auth);

    const submit = useSubmit();

    const data1 = useActionData();

    console.log(data1);


    let navigate = useNavigate();
    const stage = ContractDataStore.useState(s => s.stage);
    ContractDataStore.update(s=>{
        s.providerName=user?user.email:'anon';
    })
    const methods = useForm();

    return (
        <div className='flex flex-col space-y-8 bg-bg-primary-dark h-auto'>
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

                <ContractProcessStepper />
            </div>
            <div className={`bg-[#2A2A2A] p-3 rounded-lg border-2 border-solid border-accent-dark h-50 sm:h-auto m-6`}>
                <FormProvider {...methods}>
                    <form onSubmit={
                        methods.handleSubmit(async (data) => {
                            console.log(data);
                            const formdata = new FormData();
                            data = { ...data, providerName: user?.email }
                            for (const [key, value] of Object.entries(data)) {
                                if (key.includes('attachment')) {
                                    const file = value.item(0);
                                    const snapshot = await uploadBytes(ref(storage, `/documents/${file.name}`), file);
                                    console.log('Contract document uploaded to storage....');
                                    data[key] = snapshot.ref.fullPath
                                }

                                if(key.includes('milestone')){
                                    for (const milestone of value){
                                        const file = milestone.attachment.item(0);
                                        const snapshot = await uploadBytes(ref(storage, `/documents/${file.name}`), file);
                                        console.log('Contract document uploaded to storage....');
                                        milestone.attachment= snapshot.ref.fullPath
                                    }
                                }
                            }

                            console.log('FULL CONTRACT BEING ADDED (client-side) \n');
                            console.dir(data);
                            formdata.append('payload', JSON.stringify(data));

                            submit(formdata, { method: "post" });

                        })
                    }>
                        <AnimatePresence exitBeforeEnter>
                            <motion.div
                                key={stage}
                                animate={{ opacity: 1, x: 0 }}
                                initial={{ opacity: 0, x: 500 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.3 }}
                                className="m-2"
                            >
                                {stages[stage]}
                            </motion.div>
                        </AnimatePresence>
                    </form>
                </FormProvider>
            </div>
            <MobileNavbarPadding/>

        </div >
    )
}