import * as React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase/neutron-config";
import { UIStore } from "../stores/UIStore";
import { secondaryGradient } from "../utils/neutron-theme-extensions";
import CalendarButton from "../components/CalendarButton";
import ContractsButton from "../components/ContractsButton";
import HomeButton from "../components/HomeButton";
import WalletButton from "../components/WalletButton";
import { Outlet, useLoaderData, useNavigate } from "@remix-run/react";
import { LoaderFunction, redirect } from "@remix-run/server-runtime";
import { logout } from "~/firebase/firebase-utils";
import { time } from "console";
import { formatDateToReadableString } from "~/utils/utils";
import Icon from '../assets/images/icon.svg';

export default function SessionPage() {
  let tab = UIStore.useState((s) => s.selectedTab);
  const date = React.useMemo(formatDateToReadableString, []);

  console.log(tab);

  let navigate = useNavigate();

  return (
    <div className="flex h-auto w-full flex-row bg-bg-primary-dark">
      <aside className="h-screen w-auto" aria-label="Sidebar">
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
      <div className="flex flex-col w-full h-auto">
        <div
          id="content-window"
          className="h-full w-auto rounded-lg bg-bg-secondary-light"
        >
          <Outlet></Outlet>
        </div>

      </div>
    </div>
  );
}
