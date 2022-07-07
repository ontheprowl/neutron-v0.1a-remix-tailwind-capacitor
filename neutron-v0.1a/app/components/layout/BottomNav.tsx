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
        <div className="m-5 flex flex-row min-w-fit justify-between rounded-2xl w-auto bg-[#202020]   shadow-lg sm:hidden">

            <div
                className={`rounded-full transition-all m-2 ${tab == "Home"? secondaryGradient: ``}`
                }
            >
                <HomeButton />
            </div>

            <div
                className={`rounded-lg transition-all m-2 ${tab == "Wallet"? secondaryGradient: ``}`
            }
            >
                <WalletButton />
            </div>
            <div>
                <CreateContractMobileButton className="transition-all m-2 hover:scale-105 active:scale-105"></CreateContractMobileButton>
            </div>

            <div
                 className={`rounded-lg transition-all m-2 ${tab == "Contracts"? secondaryGradient: ``}`
                }
            >
                <ContractsButton />
            </div>

            <div
                 className={`rounded-lg transition-all m-2 ${tab == "Calendar"? secondaryGradient: ``}`
                }
            >
                <CalendarButton />
            </div>

        </div>
    )
}