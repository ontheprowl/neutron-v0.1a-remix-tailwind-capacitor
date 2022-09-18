import { UIStore } from "~/stores/UIStore";
import { secondaryGradient } from "~/utils/neutron-theme-extensions";
import { formatDateToReadableString } from "~/utils/utils";
import HomeButton from '~/components/HomeButton'
import WalletButton from '~/components/WalletButton'
import CalendarButton from '~/components/CalendarButton'
import ContractsButton from '~/components/ContractsButton'



import { useNavigate } from "@remix-run/react";
import { useMemo } from 'react'
import CreateContractMobileButton from "../inputs/CreateContractMobileButton";



export default function BottomNav() {


    let tab = UIStore.useState((s) => s.selectedTab);
    const date = useMemo(formatDateToReadableString, []);

    console.log(tab);

    let navigate = useNavigate();
    return (
        <div className=" flex flex-row min-w-fit h-auto justify-between w-full bg-[#202020]   shadow-lg sm:hidden">

            <div
                className={`rounded-xl p-2 transition-all hover:opacity-80  hover:ring-1 hover:ring-accent-dark`}

            >
                <HomeButton selected={tab === "Home"} />
            </div>


            <div>
                <CreateContractMobileButton className={`rounded-xl p-2 m-2 hover:opacity-80 transition-all hover:ring-1 hover:ring-accent-dark`}
                ></CreateContractMobileButton>
            </div>

            <div
                className={`rounded-xl p-2 transition-all m-2 ${tab == "Contracts" ? secondaryGradient : 'hover:opacity-80 transition-all hover:ring-1 hover:ring-accent-dark rounded-lg'}`}

            >
                <ContractsButton />
            </div>

        </div >
    )
}