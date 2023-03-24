import { AppStore } from "../stores/UIStore";
import { primaryGradientDark } from "../utils/neutron-theme-extensions";
import HomeButton from "../components/HomeButton";
import { Outlet, useFetcher, useLoaderData, useLocation, useNavigate } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/server-runtime";
import { json, redirect } from "@remix-run/server-runtime";
import { formatDateToReadableString } from "~/utils/utils";
import BackArrow from '~/assets/images/BackArrow.svg'
import ForwardArrow from '~/assets/images/ForwardArrow.svg'



import Icon from '../assets/images/icon_black.svg';
import IconWhite from '../assets/images/iconWhite.svg'
import PlaceholderDP from '~/assets/images/kartik.png'
import BottomNav from "~/components/layout/BottomNav";
import { requireUser } from "~/session.server";
import { isViewerOwner } from "~/models/user.server";
import { AnimatePresence, motion, useCycle } from "framer-motion";
import DisputesButton from "~/components/DisputesButton";
import SupportButton from "~/components/SupportButton";
import SettingsButton from "~/components/SettingsButton";
import LogoutButton from "~/components/LogoutButton";
import { useEffect, useMemo, useState } from "react";
import NeutronModal from "~/components/layout/NeutronModal";
import { ContractDataStore } from "~/stores/ContractStores";
import { DEFAULT_CONTRACT_STATE } from "~/models/contracts";
import { useJune } from "~/utils/use-june";
import AccentedToggle from "~/components/layout/AccentedToggleV1";
import useAsset from "~/hooks/useAsset";
import { useBeams } from "~/utils/use-beams";
import DashboardIcon from "~/components/inputs/DashboardIcon";
import WorkflowIcon from "~/components/inputs/WorkflowIcon";
import InvoicesIcon from "~/components/inputs/InvoicesIcon";
import CustomersIcon from "~/components/inputs/CustomersIcon";
import { getFirebaseDocs, getSingleDoc, setFirestoreDocFromData, updateFirestoreDocFromData } from "~/firebase/queries.server";
import TeamIcon from "~/components/inputs/TeamIcon";

export const loader: LoaderFunction = async ({ request, params }) => {

    console.log("DATA REFRESH FROM USERNAME ROUTE")
    const session = await requireUser(request);

    if (!session) {
        return redirect('/login')
    }

    if (session?.metadata && session?.metadata?.businessID) {
        const businessData = await getSingleDoc(`businesses/${session?.metadata?.businessID}`);
        console.dir(businessData, { depth: null })

        const receivables30d = await getFirebaseDocs('receivables', false, `${session?.metadata?.businessID}/30d`);
        const receivables60d = await getFirebaseDocs('receivables', false, `${session?.metadata?.businessID}/60d`);
        const receivables90d = await getFirebaseDocs('receivables', false, `${session?.metadata?.businessID}/90d`);;
        const receivablesExcess = await getFirebaseDocs('receivables', false, `${session?.metadata?.businessID}/excess`);

        const receivables30Data = receivables30d.map((doc) => doc.data);
        const receivables60Data = receivables60d.map((doc) => doc.data);
        const receivables90Data = receivables90d.map((doc) => doc.data);
        const receivablesExcessData = receivablesExcess.map((doc) => doc.data);


        const customers = await getFirebaseDocs('customers', false, `business/${session?.metadata?.businessID}`);
        const customersData = customers.map((doc) => doc.data);
        const finalBusinessData = { ...businessData, receivables: { '30d': receivables30Data, '60d': receivables60Data, '90d': receivables90Data, 'excess': receivablesExcessData }, cleared: [], customers: customersData };
        return json({ metadata: { ...session?.metadata }, data: finalBusinessData })
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
    const businessData = data.data;


    const metadata = data.metadata;
    let fetcher = useFetcher();
    const toggleUserModeFetcher = useFetcher();


    const [logoutConfirmationModal, setLogoutConfirmationModal] = useState(false);

    const { pathname } = useLocation();
    const [statIndex, setStatIndex] = useState(0);

    const kycComplete = useMemo(() => {
        return metadata?.panVerified && metadata?.bankVerified && metadata?.aadhaarVerified;
    }, [metadata]);


    //* Test Mode state either respects the user's default setting, or reverts to default app-wide setting ( true )

    useEffect(() => {
        console.log(metadata?.defaultTestMode)
    }, [metadata.defaultTestMode])



    const [testMode, setTestMode] = useState(metadata?.defaultTestMode ? metadata?.defaultTestMode : false);

    // ? Need to examine if this is the best way to persist state on the client. Refactor into useLocalStorage hook

    useEffect(() => {
        window.localStorage.setItem('testMode', testMode);
    }, [testMode]);

    useEffect(() => {
        setTestMode(window.localStorage.getItem('testMode') === 'true');
    }, []);


    useEffect(() => {
        if (toggleUserModeFetcher.type == "done") {
            setTestMode(metadata?.defaultTestMode);
        }
    }, [metadata?.defaultTestMode, toggleUserModeFetcher]);



    //* June integration 

    const analytics = useJune("taPBsHKSJL8IG6BG");

    useEffect(() => {

        if (analytics) {

            analytics.page(pathname);
            analytics.identify(metadata.id, {
                ...metadata,
            }, { timestamp: new Date().toISOString() });
        }

    }, [analytics, metadata, pathname])


    // * This effect ensures that the beamsClient is subscribing to all messages for the currently logged-in user

    //* Pusher Beams  doesnt work on Safari.
    // ? Consider repackaging into a useSafariSafeBeams hook
    useBeams(metadata.id)

    const [rotation, cycleRotation] = useCycle([0, 180, 360]);

    let tab = AppStore.useState((s) => s.selectedTab);

    let navigate = useNavigate();

    // * Artifically stagger the rest of contract state with a timeout 
    useEffect(() => {
        setTimeout(() => {
            ContractDataStore.replace(DEFAULT_CONTRACT_STATE);
        }, 1000);
    }, [navigate]);

    const date = useMemo(formatDateToReadableString, []);


    const currentUserData = data.metadata;


    //* Caching for static assets

    const profileImageData = useAsset(currentUserData.photoURL)

    // // * Using Dexie Hooks for easier flow working with IndexedDB
    // useEffect(() => {
    //     db.userImages.get(currentUserData.photoURL).then((result) => {
    //         if (result) {
    //             console.log("ASSET FOUND IN CACHE")
    //             setProfileImageData(result.data)
    //         } else {
    //             console.log("ASSET NOT FOUND IN CACHE")
    //             toDataURL(currentUserData.photoURL, function (data) {
    //                 db.userImages.add({ url: currentUserData.photoURL, data: data }, currentUserData.photoURL).then((result) => {
    //                     setProfileImageData(result)

    //                 })
    //             })
    //         }
    //     })
    // })


    // ? Is Sandbox UX necessary for AR/AP ? If not, scrap, and clean up the container
    return (
        <div className={`flex font-gilroy-bold h-auto w-full flex-col bg-white sm:border-0  ${testMode ? ' border-accent-dark' : 'border-transparent'}`}>

            <div id="top_nav" className="h-16 flex flex-row space-x-10 items-center justify-between p-3 py-12">
                <div className="flex flex-row space-x-20 px-5 w-5/12 max-w-2xl">
                    <img src={Icon} className="w-32" alt="Icon"></img>
                    <div className="flex flex-row bg-[#f5f5f5]  h-10 space-x-4 p-2 w-full  rounded-lg">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.5 17.5L14.5834 14.5833M16.6667 9.58333C16.6667 13.4954 13.4954 16.6667 9.58333 16.6667C5.67132 16.6667 2.5 13.4954 2.5 9.58333C2.5 5.67132 5.67132 2.5 9.58333 2.5C13.4954 2.5 16.6667 5.67132 16.6667 9.58333Z" stroke="#6F6E6E" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>

                        <input type="text" placeholder="Search " className="w-full bg-transparent text-neutral-dark placeholder:text-neutral-dark border-transparent focus:border-transparent outline-none focus:ring-0 ring-0 " />

                    </div>
                </div>
                <div className="flex flex-col space-y-2 text-right">
                    <span>Welcome {businessData?.business_name}</span>
                    <span className="font-gilroy-medium text-neutral-base text-sm">{metadata?.name}</span>
                </div>

            </div>
            <div className="flex flex-row space-x-10 shadow-inner bg-[#FBFAFF] px-4 py-6">
                <aside className=" px-3 hidden shadow-lg bg-white rounded-lg sm:h-screen sm:flex sm:w-52" aria-label="Sidebar">
                    <div className=" h-auto flex flex-col items-center justify-between rounded p-3  bg-bg-primary-dark  dark:bg-gray-800">

                        <div className="w-full place-items-center text-black ">

                            <ul className={`mt-5 w-full  space-y-6`}>
                                <li className=" transition-all  rounded-lg w-full">
                                    <button
                                        onClick={() => {

                                            navigate('dashboard', { preventScrollReset: true })



                                        }}
                                        className={`rounded-lg transition-all w-full flex flex-row align-middle p-2  border-2 border-transparent active:border-primary-base  hover:border-primary-base  sm:space-x-4 ${pathname.includes('dashboard') ? 'bg-primary-base text-white' : `text-black`}
                                `}
                                    >
                                        <DashboardIcon selected={pathname.includes('dashboard')} />

                                        <h1 className="text-[18px]">Dashboard</h1>
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

                                            // TODO: Add logic on disputes parent layout page to redirect to /disputeID of the first active dispute
                                            navigate('workflows', { preventScrollReset: true })


                                        }}
                                        className={`rounded-lg transition-all flex border-2 border-transparent active:border-primary-base  hover:border-primary-base w-full flex-row align-middle p-2  sm:space-x-4 ${pathname.includes('workflows') ? 'bg-primary-base text-white' : `text-black`}
                                `}
                                    >
                                        <WorkflowIcon selected={pathname.includes('workflows')} />
                                        <h1 className="text-[18px]">Workflows</h1>

                                    </button>
                                </li>
                                <li className=" transition-all rounded-lg">
                                    <button

                                        onClick={() => {

                                            // TODO: Add logic on disputes parent layout page to redirect to /disputeID of the first active dispute
                                            navigate('team', { preventScrollReset: true })


                                        }}
                                        className={`rounded-lg transition-all flex border-2 border-transparent active:border-primary-base  hover:border-primary-base w-full flex-row align-middle p-2  sm:space-x-4 ${pathname.includes('team') ? 'bg-primary-base text-white' : `text-black`}
                                `}
                                    >
                                        <TeamIcon selected={pathname.includes('team')} />
                                        <h1 className="text-[18px]">Team</h1>

                                    </button>
                                </li>
                                <li className=" transition-all rounded-lg">
                                    <button

                                        onClick={() => {

                                            // TODO: Add logic on disputes parent layout page to redirect to /disputeID of the first active dispute
                                            navigate('invoices', { preventScrollReset: true })


                                        }}
                                        className={`rounded-lg transition-all flex border-2 border-transparent active:border-primary-base  hover:border-primary-base w-full flex-row align-middle p-2 sm:space-x-4 ${pathname.includes('invoices') ? 'bg-primary-base text-white' : `text-black`}
                                `}
                                    >
                                        <InvoicesIcon selected={pathname.includes('invoices')} />
                                        <h1 className="text-[18px]">Invoices</h1>

                                    </button>
                                </li>
                                <li className=" transition-all rounded-lg">
                                    <button

                                        onClick={() => {

                                            // TODO: Add logic on disputes parent layout page to redirect to /disputeID of the first active dispute
                                            navigate('customers', { preventScrollReset: true })


                                        }}
                                        className={`rounded-lg transition-all flex border-2 border-transparent active:border-primary-base  hover:border-primary-base w-full flex-row align-middle p-2 sm:space-x-4 ${pathname.includes('customers') && !pathname.includes('workflows') ? 'bg-primary-base text-white' : `text-black`}
                                `}
                                    >
                                        <CustomersIcon selected={pathname.includes('customers') && !pathname.includes('workflows')} />
                                        <h1 className="text-[18px]">Customers</h1>

                                    </button>
                                </li>


                            </ul>
                        </div>
                        <div className="flex flex-col space-y-6 ">
                            <ul className={` w-full  space-y-2`}>
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
                                        navigate('settings/basic', { preventScrollReset: true });

                                    }}
                                        className={`rounded-lg transition-all flex flex-row align-middle p-2 w-full border-2 border-transparent active:border-primary-base hover:border-primary-base  sm:space-x-4 ${pathname.includes('settings') ? 'bg-primary-base text-white' : `text-black`}
                                 `}
                                    >
                                        <SettingsButton selected={pathname.includes('settings')} />
                                        <h1 className="text-[18px]">Settings</h1>

                                    </button>
                                </li>
                                <li className=" transition-all rounded-lg">
                                    <button onClick={() => {
                                        setLogoutConfirmationModal(!logoutConfirmationModal);
                                    }}
                                        className={`rounded-lg transition-all flex flex-row align-middle p-2 w-full border-2 border-transparent active:border-primary-base  hover:border-primary-base  sm:space-x-4 ${logoutConfirmationModal ? 'bg-primary-base text-white' : `text-black`}
                                 `}
                                    >
                                        <LogoutButton></LogoutButton>
                                        <h1 className="text-[18px]">Logout</h1>
                                    </button>
                                </li>
                            </ul>
                        </div>


                    </div>
                </aside>
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
                <div className={`flex flex-col w-full  h-full sm:h-auto relative flex-grow`
                } >
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
                            }} alt="profile" src={profileImageData ? profileImageData : PlaceholderDP} className="h-10 w-10  bg-[#e5e5e5] object-fill cursor-pointer hover:opacity-50 hover:ring-1 outline-none transition-all hover:ring-[#8364E8] border-solid border-black rounded-full self-center"></img>
                        </div>

                    </div>
                    <div
                        id="content-window"
                        className="h-screen overflow-y-scroll  w-auto sm:rounded-sm  transition-height "
                    >
                        <Outlet context={{ metadata: metadata, businessData: businessData }}></Outlet>
                    </div>
                    <div className="bottom-0 sm:hidden left-0 fixed w-full z-50 h-auto">
                        <BottomNav></BottomNav>
                    </div>

                </div >


            </div>
            {logoutConfirmationModal && <NeutronModal onConfirm={() => {
                AppStore.update((s) => {
                    s.selectedTab = "Logout";
                });
                fetcher.submit(null, { method: 'post', action: "/logout" })
                AppStore.update((s) => {
                    s.selectedTab = "Home";
                });
            }} heading={<h1> You are about to log out of the Neutron app </h1>} body={<p> Are you sure you want to proceed?</p>} toggleModalFunction={setLogoutConfirmationModal}></NeutronModal>}
        </div >
    );
}
