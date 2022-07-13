import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion';
import { Form, useActionData, useLoaderData, useNavigate, useSubmit } from '@remix-run/react';
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
import { ActionFunction, LoaderFunction, redirect } from '@remix-run/server-runtime';
import { json } from '@remix-run/server-runtime';
import { getDownloadURL, ref, uploadBytes, uploadBytesResumable, uploadString, UploadTaskSnapshot } from 'firebase/storage';
import { addDoc, collection } from 'firebase/firestore';
import { EventEmitter } from 'stream';
import MobileNavbarPadding from '~/components/layout/MobileNavbarPadding';
import { addFirestoreDocFromData } from '~/firebase/queries.server';
import { requireUser } from '~/session.server';
import { parseMultipartFormData } from '@remix-run/server-runtime/formData';
import createFirebaseStorageFileHandler from '~/firebase/FirebaseUploadHandler';



const stages = [<ContractClientInformation key={0}></ContractClientInformation>, <ContractScopeOfWork key={1}></ContractScopeOfWork>, <ContractPaymentDetails key={3}></ContractPaymentDetails>, <ContractEditScreen key={4}></ContractEditScreen>];

export const loader: LoaderFunction = async ({ request }) => {
    const session = await requireUser(request, true);

    // const result = await getFirebaseDocs(`users/contracts/${session?.metadata?.id}`)
    return json(session?.metadata);

}

// TODO -
export const action: ActionFunction = async ({ request }) => {
    const session = await requireUser(request, true);

    console.log(`from the Action Function`);
    const formData = await parseMultipartFormData(request, createFirebaseStorageFileHandler({
        async uploadRoutine(buffer, session, filename) {
            console.log("Entered upload Routine")
            const storageRef = ref(storage, `users/documents/${session.metadata?.id}/${filename}`)
            console.log("ref generated")

            const snapshot: UploadTaskSnapshot = await uploadBytesResumable(storageRef, buffer.buffer);
            console.log(snapshot.metadata)
            console.log('Contract document uploaded to storage....');
            while (snapshot.state != "success") {
                console.log("Still running")
            }
            return getDownloadURL(snapshot.ref)

        }, session: session
    }));

    console.log("contract payload")
    const data = {}
    for (const key of formData.keys()) {
        let value = formData.get(key);
        console.log(`Key : ${key}`)
        if (value?.toString().includes('[')) {
            value = JSON.parse(value)
        }
        console.dir(`Value : ${value}`)
        data[key] = value;
    }

    // const finalContractData = { ...data, }

    await addFirestoreDocFromData(data, `users/contracts`, session?.metadata?.id);

    return redirect(`/${session?.metadata?.displayName}/contracts`)
}


export default function ContractCreation() {

    const submit = useSubmit();

    const user = useLoaderData();
    const data1 = useActionData();

    console.log(data1);


    let navigate = useNavigate();
    const stage = ContractDataStore.useState(s => s.stage);
    ContractDataStore.update(s => {
        s.providerName = user ? user.email : 'anon';
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
                            console.log("This is the contract creation data")
                            console.dir(data);
                            const formdata = new FormData();
                            data = { ...data, providerName: user?.email }
                            for (const [key, value] of Object.entries(data)) {

                                if (key.includes('attachment')) {
                                    data[key] = value.item(0)
                                }

                                if(key.includes('deliverable')){
                                    data[key]=JSON.stringify(value)
                                }

                                if (key.includes('milestone')) {
                                    for (const milestone of value) {
                                        milestone.attachment = milestone.attachment.item(0);
                                    }
                                    data[key]=JSON.stringify(value)

                                }
                                formdata.append(key, data[key]);
                            }

                            console.log("This is the contract creation data ( after pre-processing ) ")
                            console.dir(data);


                            submit(formdata, { method: "post", encType: 'multipart/form-data' });

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
            <MobileNavbarPadding />

        </div >
    )
}