import { useState } from 'react'
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
import { addFirestoreDocFromData, getFirebaseDocs, getSingleDoc, sendEvent, setFirestoreDocFromData, updateFirestoreDocFromData } from '~/firebase/queries.server';
import { requireUser } from '~/session.server';
import { unstable_parseMultipartFormData as parseMultipartFormData } from '@remix-run/server-runtime';
import createFirebaseStorageFileHandler from '~/firebase/FirebaseUploadHandler';
import { generalFilesUploadRoutine } from '~/firebase/firebase-utils';
import { ContractEvent, EventType, NeutronEvent } from '~/models/events';
import { ContractCreator, ContractStatus } from '~/models/contracts';
import { ToastContainer } from 'react-toastify';
import { useEffect } from 'react';
import { injectStyle } from 'react-toastify/dist/inject-style';
import NeutronModal from '~/components/layout/NeutronModal';



const stages = [<ContractClientInformation key={0}></ContractClientInformation>, <ContractScopeOfWork key={1}></ContractScopeOfWork>, <ContractPaymentDetails key={3}></ContractPaymentDetails>, <ContractEditScreen key={4}></ContractEditScreen>];

/**
 * Create Contract - Loader Function 
 * @param param0 
 * @returns 
 */
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

        // TODO : Clean up the milestones processing.  Small workaround for now.

        // * OLD LOGIC - Clean up milestonesProcessed during finalContractData creation.
        // * NEW LOGIC - Clean up milestonesProcessed conditionally only if isPublished is true (Contract is being published)

        data[key] = value;


    }

    // TODO : Check if there is a better way to retrieve counter-party metadata

    if (data?.clientEmail == session?.metadata?.email) {
        const providerMetadata = await getSingleDoc(`metadata/${data?.providerID}`);
        data['providerPAN'] = providerMetadata?.PAN;
        data['providerName'] = providerMetadata?.firstName + " " + providerMetadata?.lastName;
        data['providerAadhaar'] = providerMetadata?.aadhaar;
        data['providerAddress'] = providerMetadata?.address + ", " + providerMetadata?.city + ", " + providerMetadata?.state + " - " + providerMetadata?.pincode
    } else {
        const clientMetadata = await getSingleDoc(`metadata/${data?.clientID}`);
        data['clientPAN'] = clientMetadata?.PAN;
        data['clientAadhaar'] = clientMetadata?.aadhaar;
        data['clientName'] = clientMetadata?.firstName + " " + clientMetadata?.lastName;
        data['clientAddress'] = clientMetadata?.address + ", " + clientMetadata?.city + ", " + clientMetadata?.state + " - " + clientMetadata?.pincode
    }

    const finalContractData = { ...data }
    console.dir(finalContractData)






    if (finalContractData?.isPublished == "true") {

        if (finalContractData?.milestonesProcessed) {
            console.log("MILESTONES BEING TRANSFORMED TO NEW KEY");
            finalContractData['milestones'] = finalContractData?.milestonesProcessed;
            delete finalContractData?.milestonesProcessed;
        }
        const contractRef = await addFirestoreDocFromData({ ...finalContractData, status: ContractStatus.Published }, `contracts`);
        const numberOfContracts = new Number(session?.metadata?.contracts);

        const contractCreationEvent: NeutronEvent = { event: ContractEvent.ContractPublished, type: EventType.ContractEvent, payload: { data: { ...data }, message: 'A contract was created' }, uid: session?.metadata?.id, id: contractRef.id }
        const eventPublished = await sendEvent(contractCreationEvent, finalContractData?.viewers);
        const creatorMetadataRef = await updateFirestoreDocFromData({ contracts: numberOfContracts.valueOf() + 1 }, `metadata`, session?.metadata?.id);
        // const providerMetadata = await updateFirestoreDocFromData({  }, `metadata`, finalContractData?.providerID);

        return redirect(`/${session?.metadata?.displayName}/contracts/${contractRef.id}`)

    } else {


        const contractRef = await addFirestoreDocFromData({ ...finalContractData, status: ContractStatus.Draft }, `contracts`);

        const contractDraftEvent: NeutronEvent = { event: ContractEvent.ContractDrafted, type: EventType.ContractEvent, payload: { data: { ...data }, message: 'A contract was drafted' }, uid: session?.metadata?.id, id: contractRef.id }
        const eventDrafted = await sendEvent(contractDraftEvent, finalContractData?.viewers);
        return redirect(`/${session?.metadata?.displayName}/contracts/${contractRef.id}`)

    }


}


export default function ContractCreation() {

    const submit = useSubmit();

    const data = useLoaderData();

    const metadata = data.metadata;

    const data1 = useActionData();

    const users = data.users;



    const creator = ContractDataStore.useState(s => s.creator);
    const [showModal, setShowModal] = useState(true);


    useEffect(() => {
        injectStyle();
    })

    const stage = ContractDataStore.useState(s => s.stage);
    const methods = useForm();

    return (
        <div className='flex flex-col space-y-3 bg-bg-primary-dark h-auto transition-height'>
            <div className=" flex flex-col justify-between w-full">
                {/* <div className='flex flex-row m-6 mb-2 justify-between'>
                    <div className="flex flex-col">
                        <article className="prose">
                            <h2 className="text-white prose prose-lg font-gilroy-bold text-[24px]">Welcome {metadata?.displayName}</h2>
                        </article>
                    </div>
                    <div id="user-action-buttons">
                        <div>
                        </div>
                    </div>
                </div> */}

                <ContractProcessStepper />
            </div>
            <div className={`sm:bg-[#2A2A2A] p-3 rounded-lg sm:border-2 sm:border-solid sm:border-purple-400 h-50 sm:h-auto sm:m-6`}>
                <FormProvider {...methods}>
                    <form onSubmit={
                        methods.handleSubmit(async (data) => {


                            console.dir(data);
                            data = { ...data, isPublished: true }
                            const formdata = new FormData();

                            //TODO: Creator specific contract 
                            // if (creator == ContractCreator.IndividualServiceProvider) {
                            //     

                            //     data = { ...data, providerEmail: metadata?.email, providerName: metadata?.firstName + ' ' + metadata?.lastName, creator: metadata?.email }
                            //     console.dir(data)

                            // }
                            // else {
                            //     
                            //     data = { ...data, clientEmail: metadata?.email, clientName: metadata?.firstName + ' ' + metadata?.lastName, creator: metadata?.email }
                            //     console.dir(data)


                            // }
                            const clientAdditionalDetails = returnUserUIDAndUsername(data.clientEmail, users);
                            const providerAdditionalDetails = returnUserUIDAndUsername(data.providerEmail, users);
                            data = { ...data, clientID: clientAdditionalDetails.uid, providerID: providerAdditionalDetails.uid, clientUsername: clientAdditionalDetails.username, providerUsername: providerAdditionalDetails.username, externalDeliverables: data.externalDeliverables == "true" ? true : false, viewers: JSON.stringify([providerAdditionalDetails.uid, clientAdditionalDetails.uid]) };
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

                                if (key === 'milestones') {

                                    continue;
                                }

                                if (key == "contractValue") {

                                    formdata.append('contractNumericValue', value.replace('₹', '').replace(',', ''));

                                }

                                if (key == "basePay") {

                                    formdata.append('basePayValue', value.replace('₹', '').replace(',', ''));
                                }


                                if (key.includes('milestonesProcessed')) {
                                    // for (const [milestoneKey, milestone] of Object.entries(value.workMilestones)) {
                                    //     console.
                                    // }
                                    data[key] = JSON.stringify(value)

                                }

                                formdata.append(key, data[key]);

                            }


                            console.dir(data);


                            submit(formdata, { method: "post", encType: 'multipart/form-data' });

                        }, (errors) => {

                        })
                    }>
                        <AnimatePresence exitBeforeEnter>
                            <motion.div
                                key={stage}
                                animate={{ opacity: 1, x: 0 }}
                                initial={{ opacity: 0, x: 500 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                                className="sm:m-2"
                            >
                                {stages[stage]}
                            </motion.div>
                        </AnimatePresence>
                    </form>
                </FormProvider>
            </div>
            <ToastContainer position="bottom-center"
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
            {showModal && <NeutronModal onConfirm={() => { setShowModal(false) }} heading={<p>Important Notice</p>} body={<p>This is a generic contract, which may not contain clauses as required by your country of residence<br></br><br></br> You can use and modify the contracts as you like, but their legal validity is restricted to Indian jurisdictions <br></br> <br></br><span className="text-purple-500 break-normal">Please note - Contracts can only be created between two Neutron users whose profiles and KYC have been completed</span> </p>} toggleModalFunction={setShowModal}></NeutronModal>}


        </div >
    )
}