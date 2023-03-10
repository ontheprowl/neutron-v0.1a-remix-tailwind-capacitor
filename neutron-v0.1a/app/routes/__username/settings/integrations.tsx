import { FormProvider, useForm } from "react-hook-form";
import EditButton from "~/components/inputs/buttons/EditButton";
import NeutronRadioButton from "~/components/inputs/radios/NeutronRadioButton";
import NeutronRadioGroup from "~/components/inputs/radios/NeutronRadioGroup";
import AccentedToggle from "~/components/layout/AccentedToggleV1";
import TallyLogo from '~/assets/images/tally_logo.svg';
import ZohoLogo from '~/assets/images/zoho_logo.svg';
import NucleiToggle from "~/components/inputs/NucleiToggle";
import { useState } from "react";
import { AnimatePresence, m, motion } from "framer-motion";
import NucleiTextInput from "~/components/inputs/fields/NucleiTextInput";
import { useFetcher, useOutletContext } from "@remix-run/react";



export default function IntegrationsScreen() {


    const context = useOutletContext();

    const integrationsForm = useForm();

    const fetcher = useFetcher();

    const [settingsOpen, setSettingsOpen] = useState('')

    return (
        <div className="flex flex-col space-y-4 h-full">
            <div id="business_settings" className="flex flex-col h-auto bg-white shadow-lg p-3 rounded-lg">
                <FormProvider {...integrationsForm} >
                    <form onSubmit={integrationsForm.handleSubmit(() => {

                    })} className="flex flex-col p-4">
                        <div className="flex flex-row justify-between items-center">
                            <h1 className="text-lg">Integrations</h1>
                            <EditButton></EditButton>
                        </div>
                        <ul className="flex flex-col w-full h-full divide-y-2 mt-6 ">
                            <li className="flex flex-row h-auto p-4">
                                <div className="flex flex-col space-y-4 w-full">
                                    <div className="max-h-fit w-full flex flex-row items-center justify-between">
                                        <div className={`flex flex-row transition-all items-center justify-between ${settingsOpen == "tally" ? 'border-primary-dark bg-primary-light' : ''} py-10 px-5 w-1/2 max-w-3xl border-2 border-dashed rounded-xl`}>
                                            <div className="flex flex-row items-center space-x-2">
                                                <img className="h-8" src={TallyLogo} alt="Tally Logo" />
                                                <span className="text-lg">Tally</span>
                                            </div>
                                            <NucleiToggle control={settingsOpen == "tally"} onToggle={() => { setSettingsOpen(settingsOpen == 'tally' ? '' : 'tally') }} />
                                        </div>
                                        <div className="flex flex-row space-x-4 justify-between max-w-fit">
                                            <button className="p-3 bg-primary-base hover:bg-primary-dark active:bg-primary-dark focus:bg-primary-dark transition-all rounded-xl">
                                                Sync
                                            </button>
                                            <div className="text-success-dark items-center flex flex-row bg-success-light rounded-xl p-2 max-h-fit">
                                                ACTIVE
                                            </div>
                                        </div>

                                    </div>

                                    <AnimatePresence exitBeforeEnter>
                                        {settingsOpen == "tally" && <motion.div initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }} id="tally_settings" className=" max-h-fit w-full flex flex-row space-x-10">
                                            <NucleiTextInput name="tally_port" label="Port" placeholder='By default, Tally uses port 9000 to talk to other applications' type="text"></NucleiTextInput>
                                            <NucleiTextInput name="tally_host" label="Hostname" placeholder='Please enter your public IP Address here' type="text"></NucleiTextInput>
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
                                            <NucleiToggle control={settingsOpen == "zoho"} onToggle={() => { setSettingsOpen(settingsOpen == 'zoho' ? '' : 'zoho') }} />
                                        </div>
                                        <div className="flex flex-row space-x-4 justify-between max-w-fit">
                                            <button className="p-3 bg-primary-base hover:bg-primary-dark active:bg-primary-dark focus:bg-primary-dark transition-all rounded-xl">
                                                Sync
                                            </button>
                                            <div className="text-success-dark font-gilroy-medium items-center flex flex-row bg-success-light rounded-xl p-2 max-h-fit">
                                                ACTIVE
                                            </div>
                                        </div>
                                    </div>
                                    <AnimatePresence exitBeforeEnter>
                                        {settingsOpen == "zoho" &&
                                            <motion.div initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }} id="zoho_settings" className=" max-h-fit w-full">
                                                <div className="flex flex-col items-center space-y-4 m-5">
                                                    <h1 className="font-gilroy-bold text-lg">The Zoho Integration requires you to log-in to your Zoho account and grant permissions to Neutron to access your data</h1>
                                                    <button type="button" className="w-auto max-w-fit bg-primary-base hover:bg-primary-dark transition-all p-2 rounded-xl" onClick={() => {
                                                        fetcher.submit(null, { method: 'get', action: '/integrations/zoho/consent' })
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

        </div>)
}