import { useLoaderData, useNavigate } from "@remix-run/react"
import { useFormContext, useWatch } from "react-hook-form";
import NeutronRadioButton from "~/components/inputs/radios/NeutronRadioButton";
import NeutronRadioGroup from "~/components/inputs/radios/NeutronRadioGroup";
import TallyLogo from '~/assets/images/tally_logo.svg'
import ZohoLogo from '~/assets/images/zoho_logo.svg'
import NeutronModal from "~/components/layout/NeutronModal";
import { useEffect, useState } from "react";
import ZohoIntegrationComponent from "~/components/integrations/ZohoIntegrationComponent";
import TallyIntegrationComponent from "~/components/integrations/TallyIntegrationComponent";
import type { ActionFunction, LoaderFunction} from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { OnboardingDataStore } from "~/stores/OnboardingDataStore";

export const action: ActionFunction = async ({ request, params }) => {


    console.log("ACTION REQUEST RECEIVED WITH ZOHO CREDENTIALS...")

    const headers = request.headers
    console.dir(headers)
    try {
        const creds = headers.get("creds");
        if (creds) console.dir(JSON.parse(creds))
    } catch (e) {

    }
    return null

}


export const loader: LoaderFunction = async ({ request, params }) => {

    const searchParams = new URL(request.url).searchParams;
    console.log("LOAD REQUEST RECEIVED WITH ZOHO CREDENTIALS...")

    const data = searchParams.get('data');

    if (data) {
        console.log("CREDS FOUND...")
        const zohoCreds = JSON.parse(data);
        return json({ zohoCreds: zohoCreds })
    }

    return null

}




export default function IntegrationDetails() {

    let navigate = useNavigate()

    const data = useLoaderData();

    const zohoCreds = data?.zohoCreds;

    const { control, setValue } = useFormContext();

    const integrationType = useWatch({ control, name: 'integration', defaultValue: 'tally' });

    const [credentialsModal, setCredentialsModal] = useState(false);

    const credsReceived = OnboardingDataStore.useState((s) => s.credsReceived)

    useEffect(() => {
        if (zohoCreds != null) {
            setValue('zoho_creds', zohoCreds)
            OnboardingDataStore.update((s) => {
                s.credsReceived = true
            })
        }
    }, [zohoCreds])

    return (
        <div className="items-center m-4 p-6 w-8/12">
            <div>
                <h1 className="font-gilroy-bold text-[24px]">Select Platforms to Integrate</h1>
                <span>If you need more info, please check out our <a className="text-primary-base hover:underline hover:decoration-primary-base" href="https://www.neutron.money/support">Help Page</a></span>
            </div>
            <div id="integration_details" className="mt-8 flex flex-col space-y-6 ">
                <div className="sm:text-left space-y-3  w-full">
                    <div id="integration_options" className=" w-10/12 max-w-2xl grid grid-cols-2 gap-4 ">
                        <NeutronRadioGroup>
                            <NeutronRadioButton heading="Zoho Books" name={"integration"} value="zoho" icon={ZohoLogo} no={1}></NeutronRadioButton>
                            <NeutronRadioButton heading="Tally" name={"integration"} value="tally" icon={TallyLogo} no={2}></NeutronRadioButton>
                        </NeutronRadioGroup>
                    </div>
                </div>
                <div className="flex flex-row space-x-6 max-w-xl">
                    <button
                        className="w-3/12 rounded-lg  bg-primary-base p-3 border-2 border-transparent active:bg-primary-dark hover:bg-primary-dark outline-none ring-1 ring-transparent focus:ring-white focus:border-white hover:border-white hover:ring-white text-white font-gilroy-medium font-[18px] transition-all"
                        type="button"
                        onClick={() => {
                            credsReceived ? navigate('../industry') :
                                setCredentialsModal(true)
                        }}
                    >
                        Continue
                    </button>
                </div>
            </div>
            {credentialsModal && <NeutronModal heading={
                <span>Your Credentials</span>
            } body={
                <div className=" h-auto mx-20 flex flex-col">
                    {integrationType == "tally" ?
                        <TallyIntegrationComponent></TallyIntegrationComponent>
                        : <ZohoIntegrationComponent></ZohoIntegrationComponent>
                    }
                </div>
            } toggleModalFunction={setCredentialsModal}></NeutronModal>}

        </div >)
}