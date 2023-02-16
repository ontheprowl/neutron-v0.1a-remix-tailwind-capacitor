import { useNavigate } from "@remix-run/react"
import { useFormContext } from "react-hook-form";
import NeutronRadioButton from "~/components/inputs/radios/NeutronRadioButton";
import NeutronRadioGroup from "~/components/inputs/radios/NeutronRadioGroup";
import { OnboardingDataStore } from "~/stores/OnboardingDataStore"
import TallyLogo from '~/assets/images/tally_logo.svg'
import ZohoLogo from '~/assets/images/zoho_logo.svg'
import XeroLogo from '~/assets/images/xero_logo.svg'





export default function IntegrationDetails() {

    let navigate = useNavigate()

    return (
        <div className="items-center m-4 p-6 w-8/12">
            <div>
                <h1 className="font-gilroy-bold text-[24px]">Select Platforms to Integrate</h1>
                <span>If you need more info, please check out our <a className="text-primary-base hover:underline hover:decoration-primary-base" href="https://www.neutron.money/support">Help Page</a></span>
            </div>
            <div id="integration_details" className="mt-8 flex flex-col space-y-6">
                <div className="sm:text-left space-y-3  w-full">
                    <div id="industry_options" className=" w-8/12 grid grid-cols-2 gap-4">
                        <NeutronRadioGroup>
                            <NeutronRadioButton heading="Zoho Books" name={"integration"} icon={ZohoLogo} no={1}></NeutronRadioButton>
                            <NeutronRadioButton heading="Xero" name={"integration"} icon={XeroLogo} no={2}></NeutronRadioButton>
                            <NeutronRadioButton heading="Tally" name={"integration"} icon={TallyLogo} no={3}></NeutronRadioButton>
                        </NeutronRadioGroup>
                    </div>
                </div>
                <button
                    className="w-3/12 rounded-lg  bg-primary-base p-3 border-2 border-transparent active:bg-primary-dark hover:bg-primary-dark outline-none ring-1 ring-transparent focus:ring-white focus:border-white hover:border-white hover:ring-white text-white font-gilroy-medium font-[18px] transition-all"
                    onClick={() => {
                        navigate("../team")
                    }}
                >
                    Continue
                </button>
            </div>
        </div >)
}