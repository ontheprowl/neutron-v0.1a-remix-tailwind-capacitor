import * as React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { adminAuth, auth } from "../firebase/neutron-config.server";
import { UIStore } from "../stores/UIStore";
import { secondaryGradient } from "../utils/neutron-theme-extensions";
import CalendarButton from "../components/CalendarButton";
import ContractsButton from "../components/ContractsButton";
import HomeButton from "../components/HomeButton";
import WalletButton from "../components/WalletButton";
import { Links, Meta, Outlet, Scripts, ShouldReloadFunction, useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/server-runtime";
import { time } from "console";
import { formatDateToReadableString } from "~/utils/utils";
import Icon from '../assets/images/icon.svg';
import PlaceholderDP from '~/assets/images/kartik.png'
import BottomNav from "~/components/layout/BottomNav";
import { getSingleDoc } from "~/firebase/queries.server";
import { logout, requireUser } from "~/session.server";
import { isViewerOwner } from "~/models/user.server";
import { motion, useCycle } from "framer-motion";
import DisputesButton from "~/components/DisputesButton";
import SupportButton from "~/components/SupportButton";
import SettingsButton from "~/components/SettingsButton";
import LogoutButton from "~/components/LogoutButton";

export const loader: LoaderFunction = async ({ request, params }) => {

    const session = await requireUser(request);

    if (!session) {
        return redirect('/login')
    }

    const ownerUsername = params.username
    const contractID = params.contractID;
    console.log(`The contract ID in params is ${contractID}`)
    console.log("username is :" + ownerUsername)
    const isOwner = await isViewerOwner(session, ownerUsername);
    console.log(`value of isOwner is ${isOwner}`)
    if (!isOwner && contractID == undefined) {
        throw new Error("Don't have the privilege to view this page")
    }



    return json({ isOwner: isOwner, metadata: session?.metadata })
}



export default function CustomUserPage() {

    const data = useLoaderData();
    let fetcher = useFetcher();

    const [rotation, cycleRotation] = useCycle([0, 180, 360]);
    console.dir(data)

    let tab = UIStore.useState((s) => s.selectedTab);
    const date = React.useMemo(formatDateToReadableString, []);

    console.log(tab);
    const currentUserData = data.metadata;

    let navigate = useNavigate();

    return (
        <div className="flex font-gilroy-bold h-auto w-full flex-col sm:flex-row bg-bg-primary-dark">
            <aside className="hidden sm:h-auto sm:flex sm:w-auto" aria-label="Sidebar">
                <div className=" h-screen flex flex-col items-center justify-between rounded bg-bg-primary-dark py-4 px-3 dark:bg-gray-800">

                    <div className="w-full place-items-center">
                        <motion.a

                            onClick={() => {
                                navigate('/');
                            }}
                            className="mb-5 flex flex-row justify-center cursor-pointer"
                        >
                            <motion.img
                                whileHover={{ rotate: rotation }}
                                onHoverStart={() => cycleRotation()}
                                src={Icon}
                                className=" h-20 w-20 self-center"
                                alt="Neutron Logo"
                            />
                        </motion.a>
                        <ul className={`${!data?.isOwner ? 'hidden' : ''} mt-20 w-auto shrink-0 space-y-2`}>
                            <li className="hover:opacity-80 transition-all  rounded-lg w-full">
                                <button
                                    onClick={() => {
                                        UIStore.update((s) => {
                                            s.selectedTab = "Home";
                                        });
                                        navigate('dashboard')


                                    }}
                                    className={`rounded-lg transition-all flex flex-row align-middle m-2 p-2 w-36 text-gray-100 hover:ring-1 hover:ring-accent-dark sm:space-x-3 ${tab == "Home" ? 'bg-bg-secondary-dark' : ``}
                                `}
                                >
                                    <HomeButton />
                                    <h1 className="text-[18px]">Home</h1>
                                </button>
                            </li>
                            <li className="hover:opacity-80 transition-all rounded-lg">
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
                            </li>
                            <li className="hover:opacity-80 transition-all rounded-lg">
                                <button

                                    onClick={() => {
                                        UIStore.update((s) => {
                                            s.selectedTab = "Disputes";
                                        });
                                        // TODO: Add logic on disputes parent layout page to redirect to /disputeID of the first active dispute
                                        navigate('disputes/')

                                    }}
                                    className={`rounded-lg transition-all flex hover:ring-1 hover:ring-accent-dark w-36 flex-row align-middle m-2 p-2 text-gray-100 sm:space-x-3 ${tab == "Disputes" ? 'bg-bg-secondary-dark' : ``}
                                `}
                                >
                                    <DisputesButton />
                                    <h1 className="text-[18px]">Disputes</h1>

                                </button>
                            </li>

                        </ul>
                    </div>
                    <div id="misc-buttons" className="w-full">
                        <ul className={`${!data?.isOwner ? 'hidden' : ''} mt-20 w-auto shrink-0 space-y-2`}>
                            <li className="hover:opacity-80 transition-all  rounded-lg w-full">
                                <button
                                    onClick={() => {
                                        UIStore.update((s) => {
                                            s.selectedTab = "Support";
                                        });
                                        navigate('dashboard')


                                    }}
                                    className={`rounded-lg transition-all flex flex-row align-middle m-2 p-2 text-gray-100 w-36 hover:ring-1 hover:ring-accent-dark sm:space-x-3 ${tab == "Support" ? 'bg-bg-secondary-dark' : ``}
                                `}
                                >

                                    <SupportButton />
                                    <h1 className="text-[18px]">Support</h1>


                                </button>
                            </li>
                            <li className="hover:opacity-80 transition-all rounded-lg">
                                <button onClick={() => {
                                    UIStore.update((s) => {
                                        s.selectedTab = "Settings";
                                    });
                                    navigate('dashboard')

                                }}
                                    className={`rounded-lg transition-all flex flex-row align-middle m-2 p-2 text-gray-100 w-36 hover:ring-1 hover:ring-accent-dark sm:space-x-3 ${tab == "Settings" ? 'bg-bg-secondary-dark' : ``}
                                 `}
                                >
                                    <SettingsButton />
                                    <h1 className="text-[18px]">Settings</h1>

                                </button>
                            </li>
                            <li className="hover:opacity-80 transition-all  rounded-lg w-full">
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
                                    className={`rounded-lg transition-all flex flex-row align-middle m-2 ml-3 p-2 text-gray-100 w-36 hover:ring-1 hover:ring-accent-dark sm:space-x-3 ${tab == "Logout" ? 'bg-bg-secondary-dark' : ``}
                                `}
                                >
                                    <LogoutButton />
                                    <h1 className="text-[18px]">Logout</h1>
                                </button>
                            </li>
                        </ul>
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
            <div className="flex flex-col w-full h-screen sm:h-auto relative flex-grow" >
                <div className="flex flex-row m-5 mt-8 justify-between items-start sm:hidden">
                    <motion.a
                        whileHover={{ rotate: rotation }}
                        onTap={() => { cycleRotation() }}
                        whileTap={{ rotate: rotation }}
                        onHoverStart={() => cycleRotation()}
                        href="https://neutron.money"
                        className="mb-5 flex items-center"
                    >
                        <img
                            src={Icon}
                            className="transition-all h-10 w-10"
                            alt="Neutron Logo"
                        />
                    </motion.a>
                    <div className="flex flex-row items-start">
                        <img onClick={() => {
                            navigate(`/${currentUserData.displayName}/profile`)
                        }} alt="profile" src={currentUserData.photoURL ? currentUserData.photoURL : PlaceholderDP} className="h-10 w-10  bg-[#e5e5e5] border-2 cursor-pointer hover:opacity-50 hover:ring-1 outline-none transition-all hover:ring-[#8364E8] border-solid border-black rounded-full self-center  object-contain"></img>
                    </div>

                </div>
                <div
                    id="content-window"
                    className="h-auto sm:h-full w-auto sm:rounded-lg bg-bg-primary-dark transition-height "
                >
                    <Outlet></Outlet>
                </div>
                <div className="bottom-0 transition-all sm:hidden left-0 fixed w-full h-auto">
                    <BottomNav></BottomNav>
                </div>

            </div >

        </div >
    );
}
