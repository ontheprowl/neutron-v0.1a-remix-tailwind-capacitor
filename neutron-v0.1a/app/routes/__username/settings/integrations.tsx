import { FormProvider, useForm, useWatch } from "react-hook-form";
import TallyLogo from '~/assets/images/tally_logo.svg';
import ZohoLogo from '~/assets/images/zoho_logo.svg';
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import NucleiTextInput from "~/components/inputs/fields/NucleiTextInput";
import { useFetcher, useOutletContext } from "@remix-run/react";
import DefaultSpinner from "~/components/layout/DefaultSpinner";
import { emitToast } from "~/utils/toasts/NeutronToastContainer";
import type { LoaderFunction } from "@remix-run/server-runtime";
import { requireUser } from "~/session.server";
import { updateFirestoreDocFromData } from "~/firebase/queries.server";
import DisconnectButton from "~/components/inputs/buttons/DisconnectButton";
import ConnectButton from "~/components/inputs/buttons/ConnectButton";



export const loader: LoaderFunction = async ({ request, params }) => {

    const session = await requireUser(request);
    const searchParams = new URL(request.url).searchParams;

    const data = searchParams.get('data');

    if (data) {
        console.log("LOAD REQUEST RECEIVED WITH ZOHO CREDENTIALS...")
        const zohoCreds = JSON.parse(data);
        const businessDetailsUpdateRef = await updateFirestoreDocFromData({ integration: 'zoho', creds: zohoCreds }, 'businesses', session?.metadata?.businessID)
    }

    return null
}

export default function IntegrationsScreen() {


    const { metadata, businessData } = useOutletContext();

    const integrationsForm = useForm();

    const control = integrationsForm.control;

    const tallyPort = useWatch({ control, name: 'tally_port' });
    const tallyHostname = useWatch({ control, name: 'tally_host' });

    const tallyFetcher = useFetcher();
    const zohoFetcher = useFetcher();

    useEffect(() => {
        if (tallyFetcher.data && tallyFetcher.state == "loading") {
            if (tallyFetcher.data['status'] == '1') {
                if (tallyFetcher.formAction?.includes("sync")) {
                    emitToast("Tally data sync successful", null, "success")
                } else {
                    emitToast("Tally Connection successful", null, "success")
                }
            } else {
                emitToast("Tally Connection unsuccessful", "Please check the values entered for the Hostname and Port", "error")
            }

        }
    }, [tallyFetcher])

    useEffect(() => {
        if (zohoFetcher.data && zohoFetcher.state == "loading") {
            if (zohoFetcher.data['status'] == '1') {
                if (zohoFetcher.formAction?.includes("sync")) {
                    emitToast("Your Zoho Books data is being synced", "It may take upto 30 minutes for all your data to reflect on the platform ", "success")
                }
            }
        }
    }, [zohoFetcher])

    const [settingsOpen, setSettingsOpen] = useState('')

    return (
        <div className="flex flex-col space-y-4 h-full">
            <div id="business_settings" className="flex flex-col h-auto bg-white shadow-lg p-2 rounded-lg">
                <FormProvider {...integrationsForm} >
                    <form onSubmit={integrationsForm.handleSubmit(() => {

                    })} className="flex flex-col p-4">
                        <div className="flex flex-row justify-between items-center">
                            <h1 className="text-base">Integrations</h1>
                        </div>
                        <ul className="flex flex-col w-full h-full divide-y-2 mt-6 ">
                            <li className="flex flex-row h-auto p-4">
                                <div className="flex flex-col space-y-4 w-full">
                                    <div className=" w-full flex flex-row items-center justify-between">
                                        <div className={`flex flex-row transition-all items-center justify-between ${businessData?.integration && businessData?.integration == "tally" ? 'border-primary-dark bg-primary-light' : ''} py-10 px-5 w-1/2 max-w-3xl border-2 border-dashed rounded-xl`}>
                                            <div className="flex flex-row items-center space-x-2">
                                                <img className="h-14" src={TallyLogo} alt="Tally Logo" />
                                                <div className="text-warning-dark align-super font-gilroy-medium self-start text-xs items-center flex flex-row bg-warning-light rounded-xl p-2 max-h-fit">
                                                    BETA
                                                </div>
                                            </div>
                                            {businessData?.integration && businessData?.integration == "tally" &&
                                                <div className="flex flex-row space-x-4 justify-between max-w-fit">
                                                    <div className="text-success-dark font-gilroy-medium text-sm items-center flex flex-row bg-success-light rounded-xl p-2 max-h-fit">
                                                        CONNECTED
                                                    </div>
                                                </div>
                                            }
                                            {
                                                businessData?.integration && businessData?.integration == "tally" ?
                                                    <div className="flex flex-row space-x-4 justify-between max-w-fit">
                                                        <DisconnectButton onClick={() => {
                                                            tallyFetcher.submit(null, { method: 'post', action: '/integrations/tally/revoke' });
                                                        }} />
                                                    </div> :
                                                    <button className="bg-primary-light font-gilroy-medium rounded-xl text-sm hover:opacity-80 text-primary-base p-3" onClick={() => { setSettingsOpen(settingsOpen == 'tally' ? '' : 'tally') }}>Configure</button>
                                            }
                                        </div>
                                        {businessData?.integration && businessData?.integration == "tally" &&
                                            <div className="flex flex-row space-x-4 justify-between max-w-fit">
                                                <button onClick={() => {
                                                    tallyFetcher.submit(null, { method: 'post', action: '/integrations/tally/sync' })
                                                }} className="p-3 px-5 text-white text-sm font-gilroy-medium bg-primary-base hover:bg-primary-dark active:bg-primary-dark focus:bg-primary-dark transition-all rounded-xl">
                                                    {tallyFetcher.state != "idle" ? <DefaultSpinner></DefaultSpinner> : 'Sync Data'}
                                                </button>
                                                <button className="bg-primary-light text-sm font-gilroy-medium rounded-xl hover:opacity-80 text-primary-base p-3" onClick={() => { setSettingsOpen(settingsOpen == 'tally' ? '' : 'tally') }}>Edit Configuration</button>
                                            </div>

                                        }


                                    </div>

                                    <AnimatePresence exitBeforeEnter>
                                        {settingsOpen == "tally" &&
                                            <motion.div initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }} id="zoho_settings" className=" max-h-fit w-full">
                                                <div className="flex flex-col items-center space-y-4 m-5">
                                                    <h1 className="font-gilroy-bold text-md">To integrate your Tally data, download the Neutron Desktop App</h1>
                                                    <a href="https://firebasestorage.googleapis.com/v0/b/neutron-expo.appspot.com/o/public%2FNeutron%20-%20Tally%20App_0.1.0_x64_en-US.msi?alt=media&token=cbba3f98-32db-4afc-9734-921bdf65b072" className="bg-primary-light text-sm font-gilroy-medium rounded-xl hover:opacity-80 text-primary-base p-3" >Get Neutron Desktop App</a>

                                                </div>
                                            </motion.div>}
                                    </AnimatePresence>

                                </div>

                            </li>
                            <li className="flex flex-row h-auto p-4">
                                <div className="flex flex-col space-y-4 w-full">
                                    <div className="max-h-fit w-full flex flex-row items-center justify-between">
                                        <div className={`flex flex-row transition-all items-center justify-between ${businessData?.integration && businessData?.integration == "zoho" ? 'border-primary-dark bg-primary-light' : ''} py-10 px-5 w-1/2 max-w-3xl border-2 border-dashed rounded-xl`}>
                                            <div className="flex flex-row items-center space-x-4">
                                                <img className="h-14" src={ZohoLogo} alt="Zoho Logo" />
                                            </div>

                                            {businessData?.integration && businessData?.integration == "zoho" &&
                                                <div className="flex flex-row space-x-4 justify-between max-w-fit">
                                                    <div className="text-success-dark text-sm font-gilroy-medium items-center flex flex-row bg-success-light rounded-xl p-2 max-h-fit">
                                                        CONNECTED
                                                    </div>
                                                </div>
                                            }
                                            {
                                                businessData?.integration && businessData?.integration == "zoho" ?
                                                    <div className="flex flex-row space-x-4 justify-between max-w-fit">
                                                        <DisconnectButton onClick={() => {
                                                            zohoFetcher.submit(null, { method: 'post', action: `/integrations/zoho/revoke?business_id=${metadata?.businessID}` });
                                                        }} />
                                                    </div> :
                                                    <button className="bg-primary-light font-gilroy-medium rounded-xl hover:opacity-80 text-primary-base p-3" onClick={() => { setSettingsOpen(settingsOpen == 'zoho' ? '' : 'zoho') }}>Configure</button>
                                            }
                                        </div>
                                        {businessData?.integration && businessData?.integration == "zoho" &&
                                            <div className="flex flex-row space-x-4 justify-between max-w-fit">
                                                <button onClick={() => {
                                                    const formData = new FormData();
                                                    formData.set('business_id', metadata?.businessID)
                                                    zohoFetcher.submit(formData, { method: 'post', action: '/integrations/zoho/sync' })
                                                }} className="p-3 px-5 text-white text-sm font-gilroy-medium bg-primary-base hover:bg-primary-dark active:bg-primary-dark focus:bg-primary-dark transition-all rounded-xl">
                                                    {zohoFetcher.state != "idle" ? <DefaultSpinner></DefaultSpinner> : 'Sync Data'}
                                                </button>
                                                <button onClick={() => { setSettingsOpen(settingsOpen == 'zoho' ? '' : 'zoho') }} className="bg-primary-light text-sm font-gilroy-medium rounded-xl hover:opacity-80 text-primary-base p-3">Edit Configuration</button>

                                            </div>
                                        }

                                    </div>
                                    <AnimatePresence exitBeforeEnter>
                                        {settingsOpen == "zoho" &&
                                            <motion.div initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }} id="zoho_settings" className=" max-h-fit w-full">
                                                <div className="flex flex-col items-center space-y-4 m-5">
                                                    <h1 className="font-gilroy-bold text-md">The Zoho Integration requires you to log-in to your Zoho account and grant permissions to Neutron to access your data</h1>
                                                    <ConnectButton text="Authorize Zoho" onClick={() => {
                                                        const form = new FormData();
                                                        form.append('redirect_uri', '/settings/integrations')
                                                        zohoFetcher.submit(form, { method: 'post', action: '/integrations/zoho/consent' })
                                                    }} />
                                                </div>
                                            </motion.div>}
                                    </AnimatePresence>


                                </div>

                            </li>
                        </ul>
                    </form>
                </FormProvider>

            </div>

        </div >)
}