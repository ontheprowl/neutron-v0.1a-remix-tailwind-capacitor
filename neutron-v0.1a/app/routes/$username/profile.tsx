import { useFetcher, useLoaderData } from '@remix-run/react';
import type { ActionFunction, LoaderFunction } from '@remix-run/server-runtime';
import { json, redirect } from '@remix-run/server-runtime';
import { getStream, ref } from 'firebase/storage';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import PlaceholderDP from '~/assets/images/kartik.png'
import MobileNavbarPadding from '~/components/layout/MobileNavbarPadding';
import ProfileAccountInformationForm from '~/components/profile/ProfileAccountInformationForm';
import ProfileBasicDetailsForm from '~/components/profile/ProfileBasicDetailsForm';
import ProfileProfInformationForm from '~/components/profile/ProfileProfInformationForm';
import { ToastContainer } from "react-toastify";

import { downloadGooglePhotosImage } from '~/firebase/gapis-config.server';
import { storage } from '~/firebase/neutron-config.server';
import { deleteFirestoreDoc, getFirebaseDocs, setFirestoreDocFromData, updateFirestoreDocFromData } from '~/firebase/queries.server';
import { requireUser } from '~/session.server';
import { injectStyle } from 'react-toastify/dist/inject-style';
import ProfileMobileUI from '~/components/pages/ProfileMobileUI';
import NeutronModal from '~/components/layout/NeutronModal';
import { UIStore } from '../../stores/UIStore';
import { juneClient, trackJuneEvent } from '~/analytics/june-config.server';
import DefaultSpinner from '~/components/layout/DefaultSpinner';



export const loader: LoaderFunction = async ({ request }) => {
    const session = await requireUser(request, true);

    if (session) {
        const photoURL: string = session.metadata?.photoURL;

        if (photoURL && photoURL != "undefined") {
            if (photoURL.includes("firebasestorage")) {
                const dpStream = getStream(ref(storage, session?.metadata?.photoURL))
                const result = dpStream.read();
                session.metadata.profilePicture = result;

            }
            else {
                let buffer = Buffer.alloc(10000);
                let resultString = '';
                downloadGooglePhotosImage(photoURL, buffer, resultString);
            }

        }
        const usernames = await getFirebaseDocs('userUIDS', true);
        return json({ metadata: session.metadata, usernames: usernames });
    }

}

export const action: ActionFunction = async ({ request }) => {
    const session = await requireUser(request, true);

    if (!session) {
        return redirect('/login')
    }

    const dataString = (await request.formData()).get('payload')?.toString();
    const data = JSON.parse(dataString);

    if (session?.metadata?.displayName && data.displayName && data.displayName != session.metadata.displayName) {
        await deleteFirestoreDoc('userUIDS', `${session.metadata.displayName}`)
        const userUIDRef = await setFirestoreDocFromData({ uid: session.metadata.id, email: session?.metadata.email, profileComplete: true }, 'userUIDS', `${data.displayName}`)

    } else {
        const userUIDRef = await updateFirestoreDocFromData({ uid: session?.metadata?.id, email: session?.metadata?.email, profileComplete: true }, 'userUIDS', `${session?.metadata?.displayName}`);
    }

    const metadataRef = await setFirestoreDocFromData({ ...session.metadata, ...data, profileComplete: true }, `metadata`, session?.metadata?.id);
    console.log("Logging relevant event to June")
    trackJuneEvent(session?.metadata?.id, 'Profile Updated', {
        ...data
    }, 'profileEvents');

    console.log("Finished logging relevant event to June")

    return json({ status: "success", message: `details updated successfully for user ${session.metadata?.id} ` })
}

const profileForms: JSX.Element[] = [<ProfileBasicDetailsForm key={0}></ProfileBasicDetailsForm>, <ProfileAccountInformationForm key={1}></ProfileAccountInformationForm>, <ProfileProfInformationForm key={2}></ProfileProfInformationForm>]

export default function Profile() {

    const data = useLoaderData();
    const fetcher = useFetcher();
    const userMetadata = data.metadata;
    const profilePicture = userMetadata.photoURL;

    useEffect(() => {
        injectStyle();
    })



    const kycComplete = () => {
        return userMetadata?.panVerified && userMetadata?.bankVerified && userMetadata?.aadhaarVerified;
    };

    const tab = UIStore.useState(s => s.profileTab);
    const [profileModal, setProfileModal] = useState(!kycComplete());

    return (
        <>
            <div className="hidden sm:flex sm:flex-row h-full sm:ml-3 ">
                <div id="user-profile-panel" className="w-full sm:w-96 flex flex-col bg-bg-primary-dark h-auto sm:bg-bg-secondary-dark justify-start rounded-l-3xl ">
                    <div className="w-full sm:w-full sm:p-7 sm:flex sm:flex-col justify-between sm:space-y-4">
                        {/* <img alt="cover" className="w-auto h-auto min-h-48 object-cover rounded-bl-[50px] rounded-br-[50px] rounded-tl-[50px] " src={PlaceholderCover}></img> */}

                        <div className="flex flex-row justify-center">
                            <button onClick={() => {
                                const dpInput = document.getElementById("dp-input");
                                dpInput?.click()
                            }}>

                                <div className="h-32 -z-10 w-32 mt-8 translate-y-[-50px] bg-[#e5e5e5] border-4 cursor-pointer hover:opacity-50 hover:ring-1 outline-none transition-all hover:ring-[#8364E8] border-solid border-black rounded-full self-center  object-contain" id="dp-overlay">
                                    {fetcher.state == "submitting" ?
                                        <svg role="status" className={`inline w-20 h-20 mt-5 self-center text-gray-200 animate-spin dark:text-gray-600 fill-purple-600`} viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                                        </svg> : <img alt="profile" src={profilePicture ? profilePicture : PlaceholderDP} ></img>}
                                </div>


                                <input type="file" name="dp-input" id="dp-input" onChange={(e) => {
                                    if (e?.currentTarget?.files) {
                                        const file = e.currentTarget.files[0];
                                        const form = new FormData();
                                        form.append('dpFile', file)
                                        fetcher.submit(form, { method: "post", action: `/${userMetadata.displayName}/profile/uploadDP`, encType: 'multipart/form-data' })
                                    }


                                }} className="hidden"></input>
                            </button>

                        </div>
                        <div className='flex flex-col space-y-3 translate-y-[-35px]'>
                            <h1 className="prose prose-lg text-white self-center font-gilroy-black text-[30px]">{userMetadata?.firstName && userMetadata?.lastName ? userMetadata?.firstName + " " + userMetadata?.lastName : 'Your name'}</h1>
                            <h1 className="prose prose-lg text-[#CDC1F6] self-center font-gilroy-black text-[22px] translate-y-[-20px]">@{userMetadata.displayName}</h1>
                            {userMetadata.designation && userMetadata.designation.length > 1 && <p className="prose prose-lg text-black text-center w-auto min-w-[101px] font-gilroy-bold self-center bg-white p-2 rounded-full text-[18px] translate-y-[-25px]"> {userMetadata.designation} </p>}
                            <p className="prose prose-lg text-white self-center text-center font-gilroy-medium text-[18px]"> <u className='text-center'>Registered Email</u> <br></br> {userMetadata?.email} </p>
                        </div>
                        { /* Create a stats page for summary*/}

                        {/* <div id="funds-summary" className='flex flex-col space-y-2 font-gilroy-regular text-[12px] text-white text-center'>
                            <span> Funds in Escrow: {userMetadata?.funds?.escrowedFunds}</span>
                            <span> Disbursed Funds: {userMetadata?.funds?.disbursedFunds}</span>
                            <span> Disputed Funds: {userMetadata?.funds?.disputedFunds}</span>
                            <span> Received Funds: {userMetadata?.funds?.receivedFunds}</span>

                        </div> */}
                        <div className="flex p-2 flex-row sm:flex-col m-3 justify-evenly sm:space-y-5 space-x-4 sm:space-x-0">
                            <button onClick={() => {
                                UIStore.update(s => {
                                    s.profileTab = 0
                                })
                            }} className={`transition-all p-3 border-2 text-left text-white prose prose-md rounded-lg ${tab == 0 ? ' border-transparent    bg-bg-primary-dark' : "active:bg-bg-secondary-dark active:border-accent-dark border-transparent hover:border-2 bg-bg-secondary-dark hover:bg-bg-primary-dark"}`}>Basic Details</button>
                            <button onClick={() => {
                                UIStore.update(s => {
                                    s.profileTab = 1
                                })
                            }} className={`transition-all p-3 border-2  whitespace-nowrap text-left text-white prose prose-md rounded-lg ${tab == 1 ? '   border-transparent bg-bg-primary-dark' : "active:bg-bg-secondary-dark active:border-accent-dark border-transparent hover:border-2 bg-bg-secondary-dark hover:bg-bg-primary-dark"}`}>Account Information</button>
                            <button onClick={() => {
                                UIStore.update(s => {
                                    s.profileTab = 2
                                })
                            }} className={`transition-all p-3 border-2 text-left text-white prose prose-md rounded-lg ${tab == 2 ? '   border-transparent bg-bg-primary-dark' : "active:bg-bg-secondary-dark active:border-accent-dark border-transparent hover:border-2 bg-bg-secondary-dark hover:bg-bg-primary-dark"}`}>Professional Information</button>
                        </div>
                    </div>

                </div>
                <div id="profile-forms-container" className="flex flex-col w-auto sm:w-full bg-bg-secondary-dark border-2 rounded-xl m-5 mt-2 p-5 pt-1 border-purple-400">
                    <AnimatePresence exitBeforeEnter>
                        <motion.div
                            key={tab}
                            animate={{ opacity: 1, x: 0 }}
                            initial={{ opacity: 0, x: 500 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.3 }}
                            className="m-2"
                        >
                            {profileForms[tab]}
                        </motion.div>
                    </AnimatePresence>

                </div>
                <ToastContainer position="top-right"
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    theme="dark"
                    limit={1}

                    pauseOnFocusLoss
                    draggable
                    pauseOnHover></ToastContainer>
                <MobileNavbarPadding size="large"></MobileNavbarPadding>
            </div>
            <ProfileMobileUI></ProfileMobileUI>
            {profileModal && <NeutronModal onConfirm={() => { setProfileModal(false) }} heading={<p>Please complete your profile information</p>} body={<p>Your KYC verification needs to be complete before you begin transacting on Neutron</p>} toggleModalFunction={setProfileModal}></NeutronModal>}
        </>

    );

}