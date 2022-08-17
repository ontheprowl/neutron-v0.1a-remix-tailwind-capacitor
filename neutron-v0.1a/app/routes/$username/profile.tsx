

import { useFetcher, useLoaderData, useTransition } from '@remix-run/react';
import { ActionFunction, json, LoaderFunction, redirect } from '@remix-run/server-runtime';
import { collection, query } from 'firebase/firestore';
import { getStream, ref } from 'firebase/storage';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import PlaceholderDP from '~/assets/images/kartik.png'
import FormButton from '~/components/inputs/FormButton';
import MobileNavbarPadding from '~/components/layout/MobileNavbarPadding';
import ProfileAccountInformationForm from '~/components/profile/ProfileAccountInformationForm';
import ProfileBasicDetailsForm from '~/components/profile/ProfileBasicDetailsForm';
import ProfileProfInformationForm from '~/components/profile/ProfileProfInformationForm';
import { toast, ToastContainer } from "react-toastify";

import { downloadGooglePhotosImage } from '~/firebase/gapis-config.server';
import { storage } from '~/firebase/neutron-config.server';
import { deleteFirestoreDoc, getFirebaseDocs, setFirestoreDocFromData } from '~/firebase/queries.server';
import { requireUser } from '~/session.server';
import { injectStyle } from 'react-toastify/dist/inject-style';



export const loader: LoaderFunction = async ({ request }) => {
    const session = await requireUser(request, true);

    if (session) {
        console.log(session.metadata)
        const photoURL: string = session.metadata?.photoURL;

        if (photoURL && photoURL != "undefined") {
            if (photoURL.includes("https://")) {
                let buffer = Buffer.alloc(10000);
                let resultString = '';
                downloadGooglePhotosImage(photoURL, buffer, resultString);
                console.log("result string is :" + resultString);
            }
            else {
                console.log('dp is present')
                const dpStream = getStream(ref(storage, session?.metadata?.photoURL))
                const result = dpStream.read();
                console.log(result)
                session.metadata.profilePicture = result;
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
        const userUIDRef = await setFirestoreDocFromData({ uid: session.metadata.id }, 'userUIDS', `${data.displayName}`)

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
    console.dir("PROFILE PICTURE IS : " + profilePicture)

    useEffect(() => {
        injectStyle();
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }

        // if (transition.type === "actionReload") {
        //     toast(<div><h2>Details saved!</h2></div>, { theme: "dark", type: "success" })

        // }

        return () => {
            if ('scrollRestoration' in window.history) {
                window.history.scrollRestoration = 'auto';
            }
        }

    })

    const [tab, setTab] = useState(0)

    return (
        <div className="flex flex-col sm:flex-row h-full ">
            <div id="user-profile-panel" className="w-full sm:w-96 flex flex-col bg-bg-primary-dark sm:bg-bg-secondary-dark justify-evenly rounded-l-3xl ">
                <div className="w-full sm:w-full sm:p-7 sm:flex sm:flex-col justify-between sm:space-y-10">
                    {/* <img alt="cover" className="w-auto h-auto min-h-48 object-cover rounded-bl-[50px] rounded-br-[50px] rounded-tl-[50px] " src={PlaceholderCover}></img> */}
                    <div className="flex flex-row justify-center">
                        <button onClick={() => {
                            const dpInput = document.getElementById("dp-input");
                            console.log(`PP input element is  : ${dpInput}`)
                            dpInput?.click()
                        }}>
                            <img alt="profile" src={profilePicture ? profilePicture : PlaceholderDP} className="h-32 w-32 mt-16 translate-y-[-50px] bg-[#e5e5e5] border-8 cursor-pointer hover:opacity-50 hover:ring-1 outline-none transition-all hover:ring-[#8364E8] border-solid border-black rounded-full self-center  object-contain"></img>
                            <input type="file" name="dp-input" id="dp-input" onChange={(e) => {
                                if (e?.currentTarget?.files) {
                                    const file = e.currentTarget.files[0];
                                    console.log(file)
                                    const form = new FormData();
                                    form.append('dpFile', file)
                                    fetcher.submit(form, { method: "post", action: `/${userMetadata.displayName}/profile/uploadDP`, encType: 'multipart/form-data' })
                                }


                            }} className="hidden"></input>
                        </button>

                    </div>
                    <div className='flex flex-col space-y-5 translate-y-[-28px]'>
                        <h1 className="prose prose-lg text-white self-center font-gilroy-black text-[25px]">{userMetadata.displayName}</h1>
                        <p className="prose prose-lg text-white self-center font-gilroy-medium text-[18px]"> {userMetadata?.designation} </p>
                    </div>
                    <div className="flex p-2 flex-row sm:flex-col m-3 justify-evenly sm:space-y-5 space-x-4 sm:space-x-0">
                        <button onClick={() => {
                            setTab(0)
                        }} className={`transition-all p-3 border-2 text-left text-white prose prose-md rounded-lg ${tab == 0 ? ' border-accent-dark   bg-bg-secondary-dark' : "active:bg-bg-secondary-dark active:border-accent-dark border-transparent hover:border-2 bg-bg-primary-dark hover:border-accent-dark"}`}>Basic Details</button>
                        <button onClick={() => {
                            setTab(1)
                        }} className={`transition-all p-3 border-2 text-left text-white prose prose-md rounded-lg ${tab == 1 ? ' border-accent-dark   bg-bg-secondary-dark' : "active:bg-bg-secondary-dark active:border-accent-dark border-transparent hover:border-2 bg-bg-primary-dark hover:border-accent-dark"}`}>Professional Information</button>
                        <button onClick={() => {
                            setTab(2)
                        }} className={`transition-all p-3 border-2 text-left text-white prose prose-md rounded-lg ${tab == 2 ? ' border-accent-dark   bg-bg-secondary-dark' : "active:bg-bg-secondary-dark active:border-accent-dark border-transparent hover:border-2 bg-bg-primary-dark hover:border-accent-dark"}`}>Account Information </button>
                    </div>
                </div>

            </div>
            <div id="profile-forms-container" className="flex flex-col w-auto sm:w-full bg-bg-secondary-dark border-2 rounded-xl m-5 p-5 border-accent-dark">
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
            <MobileNavbarPadding size="large"></MobileNavbarPadding>
        </div>);

}