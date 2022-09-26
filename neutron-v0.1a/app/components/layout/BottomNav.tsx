import { UIStore } from "~/stores/UIStore";
import { secondaryGradient } from "~/utils/neutron-theme-extensions";
import { formatDateToReadableString } from "~/utils/utils";
import HomeButtonMobile from '~/components/HomeButtonMobile'
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
        <div className="flex flex-row w-full p-2 pl-10 pr-10 justify-between bg-[#202020]   shadow-lg sm:hidden">

            <div
                className={`transition-all flex flex-col align-middle focus:opacity-50  active:opacity-60`}
                onClick={() => {
                    UIStore.update(s => {
                        s.selectedTab = "Home"
                    })
                    navigate("dashboard")

                }}
            >
                <div className=" flex flex-row justify-center">
                    <HomeButtonMobile selected={tab === "Home"} />
                </div>
                <h1 className={`transition-all ${tab === "Home" ? 'text-purple-400' : 'text-white'}`}>Home</h1>
            </div>


            <div
                className="focus:opacity-50  active:opacity-60"
                onClick={() => {
                    UIStore.update(s => {
                        s.selectedTab = "Create Contract"
                    })
                    navigate("contracts/create")

                }}>
                <div className=" flex flex-row justify-center">
                    <CreateContractMobileButton selected={tab === "Create Contract"} className={``}
                    ></CreateContractMobileButton>
                </div>


                <h1 className={`transition-all ${tab === "Create Contract" ? 'text-purple-400' : 'text-white'}`}>Add Contract</h1>

            </div>

            <div
                className={`transition-all flex flex-col align-middle focus:opacity-50  active:opacity-60`}

                onClick={() => {
                    UIStore.update(s => {
                        s.selectedTab = "Contracts"
                    })
                    navigate("contracts")

                }}
            >
                <div className="flex flex-row justify-center">
                    <ContractsButton selected={tab === "Contracts"} />

                </div>

                <h1 className={`transition-all ${tab === "Contracts" ? 'text-purple-400' : 'text-white'}`}>Contracts</h1>

            </div>

        </div >
    )
}