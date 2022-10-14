import { useFetcher, useLoaderData } from '@remix-run/react';
import type { ActionFunction, LoaderFunction} from '@remix-run/server-runtime';
import { json, redirect } from '@remix-run/server-runtime';
import { getStream, ref } from 'firebase/storage';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import PlaceholderDP from '~/assets/images/kartik.png'
import MobileNavbarPadding from '~/components/layout/MobileNavbarPadding';
import ProfileAccountInformationForm from '~/components/profile/ProfileAccountInformationForm';
import ProfileBasicDetailsForm from '~/components/profile/ProfileBasicDetailsForm';
import ProfileProfInformationForm from '~/components/profile/ProfileProfInformationForm';
import {  ToastContainer } from "react-toastify";

import { downloadGooglePhotosImage } from '~/firebase/gapis-config.server';
import { storage } from '~/firebase/neutron-config.server';
import { deleteFirestoreDoc, getFirebaseDocs, setFirestoreDocFromData, updateFirestoreDocFromData } from '~/firebase/queries.server';
import { requireUser } from '~/session.server';
import { injectStyle } from 'react-toastify/dist/inject-style';
import ProfileMobileUI from '~/components/pages/ProfileMobileUI';
import NeutronModal from '~/components/layout/NeutronModal';



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


    return json({ status: "success", message: `details updated successfully for user ${session.metadata?.id} ` })
}

const profileForms: JSX.Element[] = [<ProfileBasicDetailsForm key={0}></ProfileBasicDetailsForm>, <ProfileProfInformationForm key={1}></ProfileProfInformationForm>, <ProfileAccountInformationForm key={3}></ProfileAccountInformationForm>]

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

    const [tab, setTab] = useState(0);
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
                                <img alt="profile" src={profilePicture ? profilePicture : PlaceholderDP} className="h-32 w-32 mt-8 translate-y-[-50px] bg-[#e5e5e5] border-8 cursor-pointer hover:opacity-50 hover:ring-1 outline-none transition-all hover:ring-[#8364E8] border-solid border-black rounded-full self-center  object-contain"></img>
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
                        <div className="flex p-2 flex-row sm:flex-col m-3 justify-evenly sm:space-y-5 space-x-4 sm:space-x-0">
                            <button onClick={() => {
                                setTab(0)
                            }} className={`transition-all p-3 border-2 text-left text-white prose prose-md rounded-lg ${tab == 0 ? ' border-transparent    bg-bg-primary-dark' : "active:bg-bg-secondary-dark active:border-accent-dark border-transparent hover:border-2 bg-bg-secondary-dark hover:bg-bg-primary-dark"}`}>Basic Details</button>
                            <button onClick={() => {
                                setTab(1)
                            }} className={`transition-all p-3 border-2  whitespace-nowrap text-left text-white prose prose-md rounded-lg ${tab == 1 ? '   border-transparent bg-bg-primary-dark' : "active:bg-bg-secondary-dark active:border-accent-dark border-transparent hover:border-2 bg-bg-secondary-dark hover:bg-bg-primary-dark"}`}>Professional Information</button>
                            <button onClick={() => {
                                setTab(2)
                            }} className={`transition-all p-3 border-2 text-left text-white prose prose-md rounded-lg ${tab == 2 ? '   border-transparent bg-bg-primary-dark' : "active:bg-bg-secondary-dark active:border-accent-dark border-transparent hover:border-2 bg-bg-secondary-dark hover:bg-bg-primary-dark"}`}>Account Information </button>
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