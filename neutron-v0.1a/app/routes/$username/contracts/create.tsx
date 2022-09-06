import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion';
import { Form, useActionData, useLoaderData, useNavigate, useSubmit } from '@remix-run/react';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { formatDateToReadableString, getRandomInt, returnUserUIDAndUsername } from '~/utils/utils';
import { ContractDataStore } from '~/stores/ContractStores';
import ContractTemplateSelection from '~/components/contracts/ContractTemplateSelection';
import ContractClientInformation from '~/components/contracts/ContractClientInformation';
import ContractBasicInformation from '~/components/contracts/ContractBasicInformation';
import ContractScopeOfWork from '~/components/contracts/ContractScopeOfWork';
import ContractPaymentDetails from '~/components/contracts/ContractPaymentDetails';
import ContractEditScreen from '~/components/contracts/ContractEditScreen';
import { adminAuth, auth, firestore, storage } from '~/firebase/neutron-config.server';
import { useAuthState } from 'react-firebase-hooks/auth';
import ContractProcessStepper from '~/components/contracts/ContractProcessStepper';
import { ActionFunction, LoaderFunction, redirect } from '@remix-run/server-runtime';
import { json } from '@remix-run/server-runtime';
import { getDownloadURL, ref, uploadBytes, uploadBytesResumable, uploadString, UploadTaskSnapshot } from 'firebase/storage';
import { addDoc, collection } from 'firebase/firestore';
import { EventEmitter } from 'stream';
import MobileNavbarPadding from '~/components/layout/MobileNavbarPadding';
import { addFirestoreDocFromData, getFirebaseDocs, sendEvent, setFirestoreDocFromData } from '~/firebase/queries.server';
import { requireUser } from '~/session.server';
import { unstable_parseMultipartFormData as parseMultipartFormData } from '@remix-run/server-runtime';
import createFirebaseStorageFileHandler from '~/firebase/FirebaseUploadHandler';
import { generalFilesUploadRoutine } from '~/firebase/firebase-utils';
import { ContractEvent, EventType, NeutronEvent } from '~/models/events';
import { ContractCreator, ContractStatus } from '~/models/contracts';
import { ToastContainer } from 'react-toastify';
import { useEffect } from 'react';
import { injectStyle } from 'react-toastify/dist/inject-style';



const stages = [<ContractClientInformation key={0}></ContractClientInformation>, <ContractScopeOfWork key={1}></ContractScopeOfWork>, <ContractPaymentDetails key={3}></ContractPaymentDetails>, <ContractEditScreen key={4}></ContractEditScreen>];

export const loader: LoaderFunction = async ({ request }) => {
    const session = await requireUser(request, true);
    const users = await getFirebaseDocs('userUIDS');
    console.dir(users)
    // const result = await getFirebaseDocs(`users/contracts/${session?.metadata?.id}`)
    return json({ metadata: session?.metadata, validEmails: users.map((value) => (value.data.email)), users: users });

}

/**
 * 
 * @param param0 
 * @returns 
 */
export const action: ActionFunction = async ({ request }) => {
    const session = await requireUser(request, true);

    const formData = await parseMultipartFormData(request, createFirebaseStorageFileHandler({
        uploadRoutine: generalFilesUploadRoutine, session: session
    }));

    const data = {}
    for (const key of formData.keys()) {
        let value = formData.get(key);
        if (value?.toString().includes('[') || value?.toString().includes('{')) {
            value = JSON.parse(value)
        }
        data[key] = value;
    }

    const finalContractData = { ...data, }

    if (finalContractData?.isPublished == "true") {
        const contractRef = await addFirestoreDocFromData({ ...data, status: ContractStatus.Published }, `users/contracts`, session?.metadata?.id);
        const numberOfContracts = new Number(session?.metadata?.contracts);

        const contractCreationEvent: NeutronEvent = { event: ContractEvent.ContractPublished, type: EventType.ContractEvent, payload: { data: { ...data }, message: 'A contract was created' }, uid: session?.metadata?.id, id: contractRef.id }
        const eventPublished = await sendEvent(contractCreationEvent);
        const metadataRef = await setFirestoreDocFromData({ ...session?.metadata, contracts: numberOfContracts.valueOf() + 1 }, `metadata`, session?.metadata?.id);
    }
    else {
        const contractRef = await addFirestoreDocFromData({ ...data, status: ContractStatus.Draft }, `users/contracts`, session?.metadata?.id);

        const contractDraftEvent: NeutronEvent = { event: ContractEvent.ContractDrafted, type: EventType.ContractEvent, payload: { data: { ...data }, message: 'A contract was drafted' }, uid: session?.metadata?.id, id: contractRef.id }
        const eventDrafted = await sendEvent(contractDraftEvent);
    }


    return redirect(`/${session?.metadata?.displayName}/contracts`)
}


export default function ContractCreation() {

    const submit = useSubmit();

    const data = useLoaderData();

    const metadata = data.metadata;

    const data1 = useActionData();

    const users = data.users;



    const creator = ContractDataStore.useState(s => s.creator);

    useEffect(() => {
        injectStyle();
    })

    const stage = ContractDataStore.useState(s => s.stage);
    const methods = useForm();

    return (
        <div className='flex flex-col space-y-3 bg-bg-primary-dark h-auto transition-height'>
            <div className=" flex flex-col justify-between w-full">
                <div className='flex flex-row m-6 mb-2 justify-between'>
                    <div className="flex flex-col">
                        <article className="prose">
                            <h2 className="text-white prose prose-lg font-gilroy-bold text-[24px]">Welcome {metadata?.email}</h2>
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
                            console.log("HANDLE SUBMIT HAS BEEN INVOKED")
                            console.log("This is the contract creation data")
                            console.dir(data);
                            data = { ...data, isPublished: true }
                            const formdata = new FormData();

                            //TODO: Creator specific contract 
                            if (creator == ContractCreator.IndividualServiceProvider) {
                                console.log("Creator is the service Provider ");

                                data = { ...data, providerEmail: metadata?.email, providerName: metadata?.firstName + ' ' + metadata?.lastName, creator: creator }
                                console.dir(data)

                            }
                            else {
                                console.log("The creator is the client ");
                                data = { ...data, clientEmail: metadata?.email, clientName: metadata?.firstName + ' ' + metadata?.lastName, creator: creator }
                                console.dir(data)


                            }
                            const clientAdditionalDetails = returnUserUIDAndUsername(data.clientEmail, users);
                            const providerAdditionalDetails = returnUserUIDAndUsername(data.providerEmail, users);
                            data = { ...data, clientID: clientAdditionalDetails.uid, providerID: providerAdditionalDetails.uid, clientUsername: clientAdditionalDetails.username, providerUsername: providerAdditionalDetails.username, externalDeliverables: data.externalDeliverables == "true" ? true : false };
                            for (const [key, value] of Object.entries(data)) {

                                if (key.includes('attachment')) {
                                    data[key] = value.item(0)
                                }
                                if (key.includes('deliverable')) {
                                    // for (const [milestoneKey, milestone] of Object.entries(value.workMilestones)) {
                                    //     console.
                                    // }
                                    data[key] = JSON.stringify(value)

                                }
                                if (key.includes('milestone')) {
                                    // for (const [milestoneKey, milestone] of Object.entries(value.workMilestones)) {
                                    //     console.
                                    // }
                                    data[key] = JSON.stringify(value)

                                }

                                formdata.append(key, data[key]);

                            }

                            console.log("This is the contract creation data ( after pre-processing ) [ SUBMIT EVENT] ")
                            console.dir(data);


                            submit(formdata, { method: "post", encType: 'multipart/form-data' });

                        }, (errors) => {
                            console.log(errors)
                        })
                    }>
                        <AnimatePresence exitBeforeEnter>
                            <motion.div
                                key={stage}
                                animate={{ opacity: 1, x: 0 }}
                                initial={{ opacity: 0, x: 500 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                                className="m-2"
                            >
                                {stages[stage]}
                            </motion.div>
                        </AnimatePresence>
                    </form>
                </FormProvider>
            </div>
            <ToastContainer position="bottom-center"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                theme="dark"
                limit={1}

                pauseOnFocusLoss
                draggable
                pauseOnHover></ToastContainer>
            <MobileNavbarPadding />

        </div >
    )
}