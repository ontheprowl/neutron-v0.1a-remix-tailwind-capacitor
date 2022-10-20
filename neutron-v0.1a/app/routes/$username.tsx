import * as React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { adminAuth, auth } from "../firebase/neutron-config.server";
import { UIStore } from "../stores/UIStore";
import { primaryGradientDark, secondaryGradient } from "../utils/neutron-theme-extensions";
import CalendarButton from "../components/CalendarButton";
import ContractsButton from "../components/ContractsButton";
import HomeButton from "../components/HomeButton";
import WalletButton from "../components/WalletButton";
import { Links, Meta, Outlet, Scripts, ShouldReloadFunction, useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/server-runtime";
import { time } from "console";
import { formatDateToReadableString } from "~/utils/utils";
import { SendNotification } from "~/utils/client/pwa-utils.client";
import * as PusherPushNotifications from "@pusher/push-notifications-web";


import Icon from '../assets/images/NeutronLogoFull.svg';
import IconWhite from '../assets/images/iconWhite.svg'
import PlaceholderDP from '~/assets/images/kartik.png'
import BottomNav from "~/components/layout/BottomNav";
import { getSingleDoc } from "~/firebase/queries.server";
import { logout, requireUser } from "~/session.server";
import { isViewerOwner } from "~/models/user.server";
import { AnimatePresence, motion, useCycle } from "framer-motion";
import DisputesButton from "~/components/DisputesButton";
import SupportButton from "~/components/SupportButton";
import SettingsButton from "~/components/SettingsButton";
import LogoutButton from "~/components/LogoutButton";
import { useEffect, useMemo, useState } from "react";
import NeutronModal from "~/components/layout/NeutronModal";
import { beamsClient, isSafari } from "~/components/notifications/pusher-config.client";
import { ContractDataStore } from "~/stores/ContractStores";
import { DEFAULT_CONTRACT_STATE } from "~/models/contracts";
import { useJune } from "~/utils/use-june";

export const loader: LoaderFunction = async ({ request, params }) => {

    const session = await requireUser(request);

    if (!session) {
        return redirect('/login')
    }

    const ownerUsername = params.username
    const contractID = params.contractID;


    if (ownerUsername) {
        const isOwner = await isViewerOwner(session, ownerUsername);


        //* The next line exploits the order of execution of loaders to forward the responsibility of testing privilege for viewing a contract to the specific contract page itself.
        if (!isOwner && contractID == undefined) {
            throw new Error("Don't have the privilege to view this page")
        }



        return json({ isOwner: isOwner, metadata: session?.metadata })
    }

    return null;

}



export default function CustomUserPage() {


    // const options = {
    //     body: "Hello, take a break and drink some water! 💧", // required!
    //     silent: false,
    //     badge:"/favicon.ico" ,
    //     icon:"/favicon.ico",
    //     image:"/favicon.ico"
    // }

    // let minutes = 30

    // // executed in several ways
    // React.useEffect(() => {
    //     SendNotification("Neutron", options)
    // })


    const data = useLoaderData();
    const metadata = data.metadata;
    let fetcher = useFetcher();



    const [logoutConfirmationModal, setLogoutConfirmationModal] = useState(false);

    const [statIndex, setStatIndex] = useState(0);


    //* June integration 

    const analytics = useJune("k4JXKbVGZBPoIjPo");

    useEffect(() => {

        if (analytics) {
            console.log("JUNE ANALYTICS active")
            analytics.identify({
                userId: metadata.id,
                traits: {
                    friends: 42
                }
            });
        }

    }, [analytics, metadata])


    // * This effect ensures that the beamsClient is subscribing to all messages for the currently logged-in user

    //* Pusher Beams 
    useEffect(() => {
        if (!isSafari) {
            beamsClient.start().then(() => { beamsClient.addDeviceInterest(metadata.id) });
        }


        return () => {
            if (!isSafari) {
                beamsClient.stop();
            }
        }
    }, [metadata])

    const [rotation, cycleRotation] = useCycle([0, 180, 360]);
    console.dir(data)

    let tab = UIStore.useState((s) => s.selectedTab);

    let navigate = useNavigate();

    // * Artifically stagger the rest of contract state with a timeout 
    useEffect(() => {
        setTimeout(() => {
            ContractDataStore.replace(DEFAULT_CONTRACT_STATE);
        }, 1000);
    }, [navigate]);

    const date = useMemo(formatDateToReadableString, []);


    const currentUserData = data.metadata;


    const fundStats: JSX.Element[] = [
        <div key={0}>
            <motion.h1 className="font-gilroy-bold text-[14px]">Funds In Escrow</motion.h1>
            <motion.h2 className="font-gilroy-black text-[20px]">₹{currentUserData.funds.escrowedFunds ? currentUserData.funds.escrowedFunds : '0'}</motion.h2>
        </div>,
        <div key={1}>
            <motion.h1 className="font-gilroy-bold text-[14px]">Disbursed Funds</motion.h1>
            <motion.h2 className="font-gilroy-black text-[20px]">₹{currentUserData.funds.disbursedFunds ? currentUserData.funds.disbursedFunds : '0'}</motion.h2>
        </div>,
        <div key={2}>
            <motion.h1 className="font-gilroy-bold text-[14px]">Disputed Funds </motion.h1>
            <motion.h2 className="font-gilroy-black text-[20px]">₹{currentUserData.funds.disputedFunds ? currentUserData.funds.disputedFunds : '0'}</motion.h2>
        </div>,
        <div key={3}>
            <motion.h1 className="font-gilroy-bold text-[14px]">Received Funds</motion.h1>
            <motion.h2 className="font-gilroy-black text-[20px]">₹{currentUserData.funds.receivedFunds ? currentUserData.funds.receivedFunds : '0'}</motion.h2>
        </div>];




    const [supportModal, setSupportModal] = useState(false)


    return (
        <div className="flex font-gilroy-bold h-auto w-full flex-col sm:flex-row bg-bg-primary-dark">
            <aside className="hidden sm:h-auto sm:min-h-screen sm:flex sm:w-auto" aria-label="Sidebar">
                <div className=" h-auto flex flex-col items-center justify-between rounded p-3  bg-bg-primary-dark  dark:bg-gray-800">

                    <div className="w-full place-items-center ">
                        <motion.a

                            onClick={() => {
                                navigate('/');
                            }}
                            className=" flex flex-row justify-start pl-2 mt-3  cursor-pointer"
                        >
                            <motion.img

                                src={Icon}
                                className=" h-auto w-40 self-center hover:opacity-70 transition-all"
                                alt="Neutron Logo"
                            />
                        </motion.a>

                        <ul className={`${!data?.isOwner ? 'hidden' : ''} mt-10 w-full shrink-0 space-y-2`}>
                            <li className=" transition-all  rounded-lg w-full">
                                <button
                                    onClick={() => {
                                        UIStore.update((s) => {
                                            s.selectedTab = "Home";
                                        });

                                        navigate('dashboard')



                                    }}
                                    className={`rounded-lg transition-all w-full flex flex-row align-middle p-2 text-gray-100 border-2 border-transparent active:border-accent-dark  hover:bg-bg-secondary-dark  sm:space-x-3 ${tab == "Home" ? 'bg-bg-secondary-dark' : ``}
                                `}
                                >
                                    <HomeButton />
                                    <h1 className="text-[18px]">Home</h1>
                                </button>
                            </li>

                            {/* <li className="hover:opacity-80 transition-all rounded-lg">
                                <button

                                    onClick={() => {
                                        UIStore.update((s) => {
                                            s.selectedTab = "Contracts";
                                        });
                                        navigate("contracts");
                                    }}
                                    className={`rounded-lg transition-all flex flex-row align-middle m-2 p-2 w-36 text-gray-100 hover:ring-1 hover:ring-accent-dark sm:space-x-3 ${tab == "Contracts" ? 'bg-bg-secondary-dark' : ``}
                                 `}
                                >
                                    <ContractsButton />
                                    <h1 className="text-[18px]">Contracts</h1>

                                </button>
                            </li> */}
                            <li className=" transition-all rounded-lg">
                                <button

                                    onClick={() => {
                                        UIStore.update((s) => {
                                            s.selectedTab = "Disputes";
                                        });

                                        // TODO: Add logic on disputes parent layout page to redirect to /disputeID of the first active dispute
                                        navigate('disputes/')


                                    }}
                                    className={`rounded-lg transition-all flex border-2 border-transparent active:border-accent-dark  hover:bg-bg-secondary-dark w-full flex-row align-middle p-2 text-gray-100 sm:space-x-3 ${tab == "Disputes" ? 'bg-bg-secondary-dark' : ``}
                                `}
                                >
                                    <DisputesButton />
                                    <h1 className="text-[18px]">Disputes</h1>

                                </button>
                            </li>


                        </ul>
                    </div>
                    <div className="flex flex-col space-y-6 ">
                        <div id="misc-buttons" className="w-full">
                            <ul className={`${!data?.isOwner ? 'hidden' : ''} mt-20 w-full shrink-0 space-y-2`}>
                                <li className=" transition-all  rounded-lg w-full">
                                    <a
                                        href='https://www.neutron.money/support'
                                        className={`rounded-lg transition-all flex flex-row align-middle p-2 text-gray-100 w-full border-2 border-transparent active:border-accent-dark  hover:bg-bg-secondary-dark sm:space-x-3 ${tab == "Support" ? 'bg-bg-secondary-dark' : ``}
                                `}
                                    >

                                        <SupportButton />
                                        <h1 className="text-[18px]">Support</h1>


                                    </a>
                                </li>
                                {/* <li className="hover:opacity-80 transition-all rounded-lg">
                                <button onClick={() => {
                                    UIStore.update((s) => {
                                        s.selectedTab = "Profile";
                                    });
                                    navigate('profile')

                                }}
                                    className={`rounded-lg transition-all flex flex-row align-middle m-2 p-2 text-gray-100 w-36 hover:ring-1 hover:ring-accent-dark sm:space-x-3 ${tab == "Profile" ? 'bg-bg-secondary-dark' : ``}
                                 `}
                                >
                                    <SettingsButton />
                                    <h1 className="text-[18px]">Profile</h1>

                                </button>
                            </li> */}
                                <li className=" transition-all rounded-lg">
                                    <button onClick={() => {
                                        UIStore.update((s) => {
                                            s.selectedTab = "Profile";
                                        });

                                        navigate('profile');

                                    }}
                                        className={`rounded-lg transition-all flex flex-row align-middle p-2 text-gray-100 w-full border-2 border-transparent active:border-accent-dark  hover:bg-bg-secondary-dark  sm:space-x-3 ${tab == "Profile" ? 'bg-bg-secondary-dark' : ``}
                                 `}
                                    >
                                        <SettingsButton />
                                        <h1 className="text-[18px]">Profile</h1>

                                    </button>
                                </li>
                                {/* <li className="hover:opacity-80 transition-all  rounded-lg w-full">
                                <button
                                    onClick={() => {
                                        UIStore.update((s) => {
                                            s.selectedTab = "Logout";
                                        });
                                        fetcher.submit(null, { method: 'post', action: "/logout" })
                                        UIStore.update((s) => {
                                            s.selectedTab = "Home";
                                        });
                                    }}
                                    className={`rounded-lg transition-all flex flex-row align-middle p-2 text-gray-100 w-full hover:ring-1 hover:ring-accent-dark sm:space-x-3 ${tab == "Logout" ? 'bg-bg-secondary-dark' : ``}
                                `}
                                >
                                    <LogoutButton />
                                    <h1 className="text-[18px]">Logout</h1>
                                </button>
                            </li> */}
                            </ul>
                        </div>
                        <div id="profile-funds-summary" className={`text-white text-left p-4 w-full self-start  rounded-xl ${primaryGradientDark}`}>
                            <div className="flex flex-row justify-between">
                                <AnimatePresence exitBeforeEnter>


                                    <motion.div layout
                                        key={statIndex}
                                        animate={{ opacity: 1, x: 0 }}
                                        initial={{ opacity: 0, x: 100 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        onTap={() => {
                                            statIndex < 3 ? setStatIndex(statIndex + 1) : setStatIndex(0);
                                        }}
                                        transition={{ duration: 0.5 }} className="flex flex-col cursor-pointer hover:opacity-50">
                                        {fundStats[statIndex]}
                                    </motion.div>


                                </AnimatePresence>
                            </div>

                            {/* <div className="flex flex-row justify-between mt-3">
                                    {statIndex > 0 && <button onClick={() => {
                                        setStatIndex(statIndex - 1);
                                    }}>&#8249;
                                    </button>}
                                    {statIndex < 3 && <button onClick={() => {
                                        setStatIndex(statIndex + 1);
                                    }}>&#8250;
                                    </button>}
                                </div> */}


                            <p className="font-gilroy-bold text-[14px] mt-5"> {currentUserData.contracts} Active Contract{currentUserData.contracts != 1 ? 's' : ''}</p>
                        </div>
                        <div className="flex flex-row p-5 pb-0 pt-0 items-center border-t-2 border-gray-300 justify-end space-x-2 ">
                            <img alt="profile" src={currentUserData.photoURL ? currentUserData.photoURL : PlaceholderDP} className="h-10 w-10 mt-16 translate-y-[-30px]  bg-[#e5e5e5]  hover:opacity-50 hover:ring-1 outline-none transition-all hover:ring-[#8364E8] border-solid border-black rounded-full self-start ml-6  object-contain"></img>
                            <div className="flex flex-col">
                                <h1 className="font-gilroy-bold text-[14px] text-white">
                                    {currentUserData.displayName}
                                </h1>
                                <h2 className="font-gilroy-regular text-[14px] text-white">
                                    {currentUserData.email}
                                </h2>
                            </div>
                            <div onClick={() => {
                                setLogoutConfirmationModal(!logoutConfirmationModal);
                            }} className="self-center  rounded-full p-3 cursor-pointer transition-all border-2 border-transparent hover:opacity-50 active:ring-1 active:ring-accent-dark hover:bg-bg-secondary-dark hover:border-accent-dark">
                                <LogoutButton></LogoutButton>
                            </div>
                        </div>
                    </div>

                </div>
            </aside >
            {/* <div className="w-22 pr-10 flex-0" id="Main Tabs">
        <div className="ml-4 flex flex-col pt-6">
          {" "}
          <img src="icon.svg" className="h-20 w-20 snap-center"></img>
          <div className="ml-2 mt-10 w-10 space-y-7">
            <div
              className={
                tab == "Home"
                  ? `rounded-lg transition-all ${secondaryGradient}`
                  : ``
              }
            >
              <HomeButton />
            </div>
            <div
              className={
                tab == "Wallet"
                  ? `rounded-lg transition-all ${secondaryGradient}`
                  : ``
              }
            >
              <WalletButton />
            </div>
            <div
              className={
                tab == "Contracts"
                  ? `rounded-lg transition-all ${secondaryGradient}`
                  : ``
              }
            >
              <ContractsButton />
            </div>
            <div
              className={
                tab == "Calendar"
                  ? `rounded-lg transition-all ${secondaryGradient}`
                  : ``
              }
            >
              <CalendarButton />
            </div>
            <button
              className="mt-10 w-40 rounded-lg bg-accent-dark p-3 text-white transition-all hover:scale-105"
              onClick={() => {
                logout(auth);
                navigate('/');
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div> */}
            <div className={`flex flex-col w-full ${primaryGradientDark} h-full sm:h-auto relative flex-grow`} >
                <div className={` m-5 mt-8 justify-between items-start hidden`}>
                    <motion.a
                        whileHover={{ rotate: rotation }}
                        onTap={() => { cycleRotation() }}
                        whileTap={{ rotate: rotation }}
                        onHoverStart={() => cycleRotation()}
                        href="https://neutron.money"
                        className="mb-5 flex items-center"
                    >
                        <img
                            src={IconWhite}
                            className="transition-all h-10 w-10"
                            alt="Neutron Logo"
                        />
                    </motion.a>
                    {/* <div className="flex flex-col space-y-2">
                        <h1 className="text-white text-[20px] font-gilroy-black"> Welcome, {currentUserData?.displayName} </h1>
                        <h2 className="text-white text-[14px] font-gilroy-medium">{formatDateToReadableString(new Date().getTime(), false, true)}</h2>
                    </div> */}
                    <div className="flex flex-row items-center">
                        <img onClick={() => {
                            navigate(`/${currentUserData.displayName}/profile`)
                        }} alt="profile" src={currentUserData.photoURL ? currentUserData.photoURL : PlaceholderDP} className="h-10 w-10  bg-[#e5e5e5] object-fill cursor-pointer hover:opacity-50 hover:ring-1 outline-none transition-all hover:ring-[#8364E8] border-solid border-black rounded-full self-center"></img>
                    </div>

                </div>
                <div
                    id="content-window"
                    className="h-auto sm:h-full w-auto sm:rounded-sm sm:bg-bg-primary-dark transition-height "
                >
                    <Outlet></Outlet>
                </div>
                <div className="bottom-0 sm:hidden left-0 fixed w-full z-50 h-auto">
                    <BottomNav></BottomNav>
                </div>

            </div >
            {logoutConfirmationModal && <NeutronModal onConfirm={() => {
                UIStore.update((s) => {
                    s.selectedTab = "Logout";
                });
                fetcher.submit(null, { method: 'post', action: "/logout" })
                UIStore.update((s) => {
                    s.selectedTab = "Home";
                });
            }} heading={<h1> You are about to log out of the Neutron app </h1>} body={<p> Are you sure you want to proceed?</p>} toggleModalFunction={setLogoutConfirmationModal}></NeutronModal>}

        </div >
    );
}
