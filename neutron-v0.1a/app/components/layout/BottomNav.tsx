import { UIStore } from "~/stores/UIStore";
import { secondaryGradient } from "~/utils/neutron-theme-extensions";
import { formatDateToReadableString } from "~/utils/utils";
import HomeButton from '~/components/HomeButton'
import WalletButton from '~/components/WalletButton'
import CalendarButton from '~/components/CalendarButton'
import ContractsButton from '~/components/ContractsButton'



import { useNavigate } from "@remix-run/react";
import {useMemo} from 'react'



export default function BottomNav() {


    let tab = UIStore.useState((s) => s.selectedTab);
    const date = useMemo(formatDateToReadableString, []);

    console.log(tab);

    let navigate = useNavigate();
    return (
        <div className="inline-flex rounded-md shadow-sm sticky" role="group">
            <ul className="rounded-lg inline-flex ">
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
    )
}