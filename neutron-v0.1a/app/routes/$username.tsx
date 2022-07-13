import * as React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { adminAuth, auth } from "../firebase/neutron-config.server";
import { UIStore } from "../stores/UIStore";
import { secondaryGradient } from "../utils/neutron-theme-extensions";
import CalendarButton from "../components/CalendarButton";
import ContractsButton from "../components/ContractsButton";
import HomeButton from "../components/HomeButton";
import WalletButton from "../components/WalletButton";
import { Links, Meta, Outlet, Scripts, useLoaderData, useNavigate } from "@remix-run/react";
import { LoaderFunction, redirect } from "@remix-run/server-runtime";
import { logout } from "~/firebase/firebase-utils";
import { time } from "console";
import { formatDateToReadableString } from "~/utils/utils";
import Icon from '../assets/images/icon.svg';
import PlaceholderDP from '~/assets/images/kartik.png'
import BottomNav from "~/components/layout/BottomNav";
import { getSingleDoc } from "~/firebase/queries.server";
import { json } from "remix-utils";
import { requireUser } from "~/session.server";
import { isViewerOwner } from "~/models/user.server";

export const loader: LoaderFunction = async ({ request, params }) => {

    const session = await requireUser(request);
    const ownerUsername = params.username
    console.log("username is :" + ownerUsername)
    const isOwner = await isViewerOwner(session, ownerUsername);
    console.log(`value of isOwner is ${isOwner}`)
    if (!isOwner) {
        throw new Error("Don't have the privilege to view this page")
    }



    return null;
}



export default function CustomUserPage() {

    const data = useLoaderData();

    console.dir(data)

    let tab = UIStore.useState((s) => s.selectedTab);
    const date = React.useMemo(formatDateToReadableString, []);

    console.log(tab);

    let navigate = useNavigate();

    return (
        <div className="flex h-auto w-full flex-col sm:flex-row font-gilroy-regular bg-bg-primary-dark">
            <aside className="hidden sm:h-screen sm:flex sm:w-auto" aria-label="Sidebar">
                <div className="h-screen rounded ml-4 bg-bg-primary-dark py-4 px-3 dark:bg-gray-800">
                    <a
                        href="https://neutron.money"
                        className="mb-5 flex items-center pl-2.5"
                    >
                        <img
                            src={Icon}
                            className="mr-3 transition-all h-20 w-20"
                            alt="Neutron Logo"
                        />
                    </a>
                    <ul className="mt-20 w-10 shrink-0 space-y-20">
                        <li>
                            <div
                                className={
                                    tab == "Home"
                                        ? `rounded-lg transition-all ${secondaryGradient}`
                                        : ``
                                }
                            >
                                <HomeButton />
                            </div>
                        </li>
                        <li>
                            <div
                                className={
                                    tab == "Wallet"
                                        ? `rounded-lg transition-all ${secondaryGradient}`
                                        : ``
                                }
                            >
                                <WalletButton />
                            </div>
                        </li>
                        <li>
                            <div
                                className={
                                    tab == "Contracts"
                                        ? `rounded-lg transition-all ${secondaryGradient}`
                                        : ``
                                }
                            >
                                <ContractsButton />
                            </div>
                        </li>
                        <li>
                            <div
                                className={
                                    tab == "Calendar"
                                        ? `rounded-lg transition-all ${secondaryGradient}`
                                        : ``
                                }
                            >
                                <CalendarButton />
                            </div>
                        </li>
                    </ul>
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
            <div className="flex flex-col w-full h-screen sm:h-auto relative flex-grow">
                <div className="flex flex-row m-5 mt-8 justify-between items-start sm:hidden">
                    <img
                        src={Icon}
                        className=" transition-all h-8 sm:h-20 w-8 sm:w-20"
                        alt="Neutron Logo"
                    />
                    <div className="flex flex-row items-start">
                        <img alt="profile" src={PlaceholderDP} className="w-8 h-8  bg-[#e5e5e5] border-2 border-solid border-black rounded-full self-center object-contain"></img>

                    </div>

                </div>
                <div
                    id="content-window"
                    className="h-auto sm:h-full w-auto sm:rounded-lg bg-bg-primary-dark "
                >
                    <Outlet></Outlet>
                </div>
                <div className="bottom-0 sm:hidden left-0 fixed w-full h-auto">
                    <BottomNav></BottomNav>
                </div>

            </div>

        </div>
    );
}
