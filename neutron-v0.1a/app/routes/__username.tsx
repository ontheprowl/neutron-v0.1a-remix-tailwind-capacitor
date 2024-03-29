import { AppStore } from "../stores/UIStore";
import { Link, Outlet, useFetcher, useLoaderData, useLocation, useNavigate, useNavigation } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/server-runtime";
import { json, redirect } from "@remix-run/server-runtime";
import { formatDateToReadableString } from "~/utils/utils";



import Icon from '../assets/images/icon_black.svg';
import IconWhite from '../assets/images/iconWhite.svg'
import BottomNav from "~/components/layout/BottomNav";
import { logout, queuePeriodicSync, requireUser } from "~/session.server";
import { motion, useCycle } from "framer-motion";
import SettingsButton from "~/components/SettingsButton";
import LogoutButton from "~/components/LogoutButton";
import { useEffect, useMemo, useState } from "react";
import NeutronModal from "~/components/layout/NeutronModal";
import { useJune } from "~/utils/use-june";
import { useBeams } from "~/utils/use-beams";
import DashboardIcon from "~/components/inputs/DashboardIcon";
import WorkflowIcon from "~/components/inputs/WorkflowIcon";
import InvoicesIcon from "~/components/inputs/InvoicesIcon";
import CustomersIcon from "~/components/inputs/CustomersIcon";
import { getFirebaseDocs, getSingleDoc } from "~/firebase/queries.server";
import TeamIcon from "~/components/inputs/TeamIcon";
import DefaultSpinner from "~/components/layout/DefaultSpinner";

export const loader: LoaderFunction = async ({ request, params }) => {

    const session = await requireUser(request);



    if (!session) {
        return redirect('/login')
    }

    if (session?.metadata && session?.metadata?.businessID) {

        const businessData = await getSingleDoc(`businesses/${session?.metadata?.businessID}`);


        const integration = businessData?.integration;
        if (integration === "zoho") {
            queuePeriodicSync(session)
        }
        const indexes: { [id: string]: { indexes: { id: string, index: string, type: string } } } = await getSingleDoc(`indexes/${session?.metadata?.businessID}`);
        let indexesArray = []
        if (indexes) {
            indexesArray = [...Object.values(indexes)];
        }
        const receivables30d = await getFirebaseDocs('receivables', false, `${session?.metadata?.businessID}/30d`);
        const receivables60d = await getFirebaseDocs('receivables', false, `${session?.metadata?.businessID}/60d`);
        const receivables90d = await getFirebaseDocs('receivables', false, `${session?.metadata?.businessID}/90d`);;
        const receivablesExcess = await getFirebaseDocs('receivables', false, `${session?.metadata?.businessID}/excess`);

        const receivables30Data = receivables30d.map((doc) => doc.data);
        const receivables60Data = receivables60d.map((doc) => doc.data);
        const receivables90Data = receivables90d.map((doc) => doc.data);
        const receivablesExcessData = receivablesExcess.map((doc) => doc.data);

        const paid30d = await getFirebaseDocs('paid', false, `${session?.metadata?.businessID}/30d`);
        const paid60d = await getFirebaseDocs('paid', false, `${session?.metadata?.businessID}/60d`);
        const paid90d = await getFirebaseDocs('paid', false, `${session?.metadata?.businessID}/90d`);;
        const paidExcess = await getFirebaseDocs('paid', false, `${session?.metadata?.businessID}/excess`);

        const paid30dData = paid30d.map((doc) => doc.data);
        const paid60dData = paid60d.map((doc) => doc.data);
        const paid90dData = paid90d.map((doc) => doc.data);
        const paidExcessData = paidExcess.map((doc) => doc.data);


        const customers = await getFirebaseDocs('customers', false, `business/${session?.metadata?.businessID}`);
        const customersData = customers.map((doc) => doc.data);
        const finalBusinessData = { ...businessData, receivables: { '30d': receivables30Data, '60d': receivables60Data, '90d': receivables90Data, 'excess': receivablesExcessData }, paid: { '30d': paid30dData, '60d': paid60dData, '90d': paid90dData, 'excess': paidExcessData }, customers: customersData };
        return json({ metadata: { ...session?.metadata }, data: finalBusinessData, indexes: indexesArray })
    }

    return null;

}



export default function CustomUserPage() {


    const [filter, setFilter] = useState('');


    const data = useLoaderData();
    const businessData = data.data;
    const indexes: Array<{ id: string, index: string, type: string }> = data.indexes;



    const currView = useMemo(() => { return indexes?.filter((indexedItem) => indexedItem.index.toLowerCase().includes(filter.toLowerCase())) }, [indexes, filter]);


    const metadata = data.metadata;
    let fetcher = useFetcher();


    const [logoutConfirmationModal, setLogoutConfirmationModal] = useState(false);

    const { pathname } = useLocation();

    // ? Need to examine if this is the best way to persist state on the client. Refactor into useLocalStorage hook

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

    let navigation = useNavigation();


    // ? Is Sandbox UX necessary for AR/AP ? If not, scrap, and clean up the container
    return (
        <>
            {navigation.state != "idle" && <div className={`fixed bg-black bg-opacity-20 top-0 left-0 right-0 z-50 flex flex-col   w-full p-4 items-center justify-center overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-0px)] max-h-full`}>
                <div className=" flex flex-col space-y-4">
                    <DefaultSpinner size="regular" />
                    <span className="text-white font-gilroy-bold text-xl">Please Wait</span>
                </div>
            </div>}
            <div className={`flex font-gilroy-bold h-auto w-full flex-col bg-white sm:border-0 border-transparent`}>

                <div id="top_nav" className="h-16 flex flex-row space-x-10 items-center justify-between p-3 py-12">
                    <div className="flex flex-row space-x-20 px-5 w-6/12 max-w-3xl">
                        <img src={Icon} className="w-32" alt="Icon" />
                        <div className="flex flex-row bg-[#f5f5f5]  h-10 space-x-4 p-2 w-full  rounded-lg">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17.5 17.5L14.5834 14.5833M16.6667 9.58333C16.6667 13.4954 13.4954 16.6667 9.58333 16.6667C5.67132 16.6667 2.5 13.4954 2.5 9.58333C2.5 5.67132 5.67132 2.5 9.58333 2.5C13.4954 2.5 16.6667 5.67132 16.6667 9.58333Z" stroke="#6F6E6E" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>

                            <input type="text" onChange={(e) => {
                                setFilter(e.currentTarget.value);
                            }} placeholder="Search across all your data" className="w-full bg-transparent text-sm text-neutral-dark placeholder:text-neutral-dark border-transparent focus:border-transparent outline-none focus:ring-0 ring-0 " />
                            {filter != '' && currView?.length > 0 &&
                                <ul className="bg-white z-40 shadow-md snap-y snap-mandatory transition-all absolute top-20 left-56 w-full max-w-md max-h-72 h-auto overflow-y-scroll rounded-lg">
                                    {currView?.map((indexedItem) => {
                                        return (
                                            <li className="h-1/12 transition-all border-b snap-start border-neutral-light hover:border-primary-dark rounded-b-lg overflow-y-scroll p-3" key={indexedItem.id}>
                                                <Link onClick={() => {
                                                    setFilter('');
                                                }} to={`/${indexedItem.type == "Workflow" ? 'workflows' : 'customers'}/${indexedItem.id}/overview`}>
                                                    <div className="flex flex-col space-y-4">
                                                        <span className="font-gilroy-medium text-md">{indexedItem.index}</span>
                                                        <span className="font-gilroy-regular text-xs text-primary-base ">{indexedItem.type}</span>
                                                    </div>
                                                </Link>
                                            </li>)
                                    })}
                                </ul>
                            }
                        </div>
                    </div>
                    <div className="flex flex-col space-y-2 text-right">
                        <span className=" text-base">Welcome {businessData?.business_name}</span>
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

                                            <h1 className="text-[16px]">Dashboard</h1>
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
                        <h1 className="text-[16px]">Contracts</h1>

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
                                            <h1 className="text-[16px]">Workflows</h1>

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
                                            <h1 className="text-[16px]">Team</h1>

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
                                            <h1 className="text-[16px]">Invoices</h1>

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
                                            <h1 className="text-[16px]">Customers</h1>

                                        </button>
                                    </li>
                                    <li className=" transition-all rounded-lg">
                                        <button onClick={() => {
                                            navigate('settings/basic', { preventScrollReset: true });

                                        }}
                                            className={`rounded-lg transition-all flex flex-row align-middle p-2 w-full border-2 border-transparent active:border-primary-base hover:border-primary-base  sm:space-x-4 ${pathname.includes('settings') ? 'bg-primary-base text-white' : `text-black`}
                     `}
                                        >
                                            <SettingsButton selected={pathname.includes('settings')} />
                                            <h1 className="text-[16px]">Settings</h1>

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
                                            <h1 className="text-[16px]">Logout</h1>
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
                        <h1 className="text-[16px]">Profile</h1>

                    </button>
                </li> */}
                                    
                                </ul>
                            </div>


                        </div>
                    </aside>
                    <div className={`flex flex-col w-full  h-full sm:h-auto relative flex-grow`} >
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
                            </div>

                        </div>
                        <div
                            id="content-window"
                            className="h-screen overflow-y-scroll w-auto sm:rounded-sm  transition-height "
                        >
                            <Outlet context={{ metadata: metadata, businessData: businessData }}></Outlet>
                        </div>
                        {/* <div className="bottom-0 sm:hidden left-0 fixed w-full z-50 h-auto">
            <BottomNav></BottomNav>
        </div> */}

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
        </>

    );
}
