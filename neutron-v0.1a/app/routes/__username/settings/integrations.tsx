import { FormProvider, useForm, useWatch } from "react-hook-form";
import EditButton from "~/components/inputs/buttons/EditButton";
import NeutronRadioButton from "~/components/inputs/radios/NeutronRadioButton";
import NeutronRadioGroup from "~/components/inputs/radios/NeutronRadioGroup";
import AccentedToggle from "~/components/layout/AccentedToggleV1";
import TallyLogo from '~/assets/images/tally_logo.svg';
import ZohoLogo from '~/assets/images/zoho_logo.svg';
import NucleiToggle from "~/components/inputs/NucleiToggle";
import { useEffect, useState } from "react";
import { AnimatePresence, m, motion } from "framer-motion";
import NucleiTextInput from "~/components/inputs/fields/NucleiTextInput";
import { useFetcher, useOutletContext } from "@remix-run/react";
import DefaultSpinner from "~/components/layout/DefaultSpinner";
import { emitToast } from "~/utils/toasts/NeutronToastContainer";
import { LoaderFunction } from "@remix-run/server-runtime";
import { requireUser } from "~/session.server";
import { updateFirestoreDocFromData } from "~/firebase/queries.server";



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
                    emitToast("Zoho Data sync successful", null, "success")
                }
            }
        }
    }, [zohoFetcher])

    const [settingsOpen, setSettingsOpen] = useState('')

    return (
        <div className="flex flex-col space-y-4 h-full">
            <div id="business_settings" className="flex flex-col h-auto bg-white shadow-lg p-3 rounded-lg">
                <FormProvider {...integrationsForm} >
                    <form onSubmit={integrationsForm.handleSubmit(() => {

                    })} className="flex flex-col p-4">
                        <div className="flex flex-row justify-between items-center">
                            <h1 className="text-lg">Integrations</h1>
                        </div>
                        <ul className="flex flex-col w-full h-full divide-y-2 mt-6 ">
                            <li className="flex flex-row h-auto p-4">
                                <div className="flex flex-col space-y-4 w-full">
                                    <div className=" w-full flex flex-row items-center justify-between">
                                        <div className={`flex flex-row transition-all items-center justify-between ${settingsOpen == "tally" ? 'border-primary-dark bg-primary-light' : ''} py-10 px-5 w-1/2 max-w-3xl border-2 border-dashed rounded-xl`}>
                                            <div className="flex flex-row items-center space-x-2">
                                                <img className="h-8" src={TallyLogo} alt="Tally Logo" />
                                                <span className="text-lg">Tally</span>
                                            </div>
                                            {
                                                businessData?.integration && businessData?.integration == "tally" &&
                                                <div className="flex flex-row space-x-4 justify-between max-w-fit">
                                                    <div className="text-success-dark font-gilroy-medium items-center flex flex-row bg-success-light rounded-xl p-2 max-h-fit">
                                                        ACTIVE
                                                    </div>
                                                </div>
                                            }
                                            <NucleiToggle control={settingsOpen == "tally"} onToggle={() => { setSettingsOpen(settingsOpen == 'tally' ? '' : 'tally') }} />
                                        </div>
                                        {businessData?.integration && businessData?.integration == "tally" &&
                                            <button onClick={() => {
                                                tallyFetcher.submit(null, { method: 'post', action: '/integrations/tally/sync' })
                                            }} className="p-3 px-5 text-white font- bg-primary-base hover:bg-primary-dark active:bg-primary-dark focus:bg-primary-dark transition-all rounded-xl">
                                                {tallyFetcher.state != "idle" ? <DefaultSpinner></DefaultSpinner> : 'Sync'}
                                            </button>
                                        }


                                    </div>

                                    <AnimatePresence exitBeforeEnter>
                                        {settingsOpen == "tally" &&
                                            <motion.div initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }} id="tally_settings" className=" max-h-fit w-full flex flex-row items-center space-x-10">
                                                <NucleiTextInput name="tally_port" defaultValue={businessData?.creds?.port ? businessData?.creds?.port : ''} label="Port" placeholder='By default, Tally uses port 9000 to talk to other applications' type="text"></NucleiTextInput>
                                                <NucleiTextInput name="tally_host" defaultValue={businessData?.creds?.hostname ? businessData?.creds?.hostname : ''} label="Hostname" placeholder='Please enter your public IP Address here' type="text"></NucleiTextInput>
                                                <button onClick={() => {
                                                    const formData = new FormData();
                                                    formData.set('tally_port', tallyPort);
                                                    formData.set('tally_host', tallyHostname);
                                                    tallyFetcher.submit(formData, { method: 'post', action: '/integrations/tally/test' })
                                                }} className="p-3 px-5 text-white font- bg-primary-base hover:bg-primary-dark active:bg-primary-dark focus:bg-primary-dark transition-all rounded-xl">
                                                    {tallyFetcher.state != "idle" ? <DefaultSpinner></DefaultSpinner> : 'Test'}
                                                </button>
                                            </motion.div>}
                                    </AnimatePresence>

                                </div>

                            </li>
                            <li className="flex flex-row h-auto p-4">
                                <div className="flex flex-col space-y-4 w-full">
                                    <div className="max-h-fit w-full flex flex-row items-center justify-between">
                                        <div className={`flex flex-row transition-all items-center justify-between ${settingsOpen == "zoho" ? 'border-primary-dark bg-primary-light' : ''} py-10 px-5 w-1/2 max-w-3xl border-2 border-dashed rounded-xl`}>
                                            <div className="flex flex-row items-center space-x-4">
                                                <img className="h-8" src={ZohoLogo} alt="Zoho Logo" />
                                                <span className="text-lg">Zoho Books</span>
                                            </div>
                                            {
                                                businessData?.integration && businessData?.integration == "zoho" &&
                                                <div className="flex flex-row space-x-4 justify-between max-w-fit">
                                                    <div className="text-success-dark font-gilroy-medium items-center flex flex-row bg-success-light rounded-xl p-2 max-h-fit">
                                                        ACTIVE
                                                    </div>
                                                </div>
                                            }
                                            <NucleiToggle control={settingsOpen == "zoho"} onToggle={() => { setSettingsOpen(settingsOpen == 'zoho' ? '' : 'zoho') }} />
                                        </div>
                                        {businessData?.integration && businessData?.integration == "zoho" &&
                                            <button onClick={() => {
                                                const formData = new FormData();
                                                formData.set('business_id', metadata?.businessID)
                                                zohoFetcher.submit(formData, { method: 'post', action: '/integrations/zoho/sync' })
                                            }} className="p-3 px-5 text-white font- bg-primary-base hover:bg-primary-dark active:bg-primary-dark focus:bg-primary-dark transition-all rounded-xl">
                                                {zohoFetcher.state != "idle" ? <DefaultSpinner></DefaultSpinner> : 'Sync'}
                                            </button>
                                        }

                                    </div>
                                    <AnimatePresence exitBeforeEnter>
                                        {settingsOpen == "zoho" &&
                                            <motion.div initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }} id="zoho_settings" className=" max-h-fit w-full">
                                                <div className="flex flex-col items-center space-y-4 m-5">
                                                    <h1 className="font-gilroy-bold text-lg">The Zoho Integration requires you to log-in to your Zoho account and grant permissions to Neutron to access your data</h1>
                                                    <button type="button" className="w-auto max-w-fit bg-primary-base hover:bg-primary-dark transition-all p-2 rounded-xl" onClick={() => {
                                                        const form = new FormData();
                                                        form.append('redirect_uri', '/settings/integrations')
                                                        zohoFetcher.submit(form, { method: 'post', action: '/integrations/zoho/consent' })
                                                    }}>
                                                        <div className="flex flex-row items-center space-x-5 ">
                                                            <img src={ZohoLogo} className="h-5" alt="Zoho Logo" />
                                                            <h1 className="text-white">Authorize Zoho</h1>
                                                        </div>
                                                    </button>
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