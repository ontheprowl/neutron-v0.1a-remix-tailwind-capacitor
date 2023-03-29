import { useNavigation, useActionData, useOutletContext, useSubmit } from "@remix-run/react";
import type { ActionFunction } from "@remix-run/server-runtime";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import EditButton from "~/components/inputs/buttons/EditButtonv2";
import SaveButtonMotion from "~/components/inputs/buttons/SaveButtonV2";
import NucleiDropdownInput from "~/components/inputs/fields/NucleiDropdownInput";
import NucleiTextInput from "~/components/inputs/fields/NucleiTextInput";
import DefaultSpinner from "~/components/layout/DefaultSpinner";
import { adminAuth } from "~/firebase/neutron-config.server";
import { updateFirestoreDocFromData } from "~/firebase/queries.server";
import { requireUser } from "~/session.server";
import { emitToast } from "~/utils/toasts/NeutronToastContainer";




export const action: ActionFunction = async ({ request, params }) => {

    const session = await requireUser(request);
    const formData = await request.formData();
    const type = formData.get('type')
    const payload = formData.get('payload');
    if (payload) {
        const payloadParsed = JSON.parse(payload);
        console.dir(payloadParsed)
        switch (type) {
            case 'business':
                const businessDataRef = await updateFirestoreDocFromData(payloadParsed, 'businesses', `${session?.metadata?.businessID}`)
                return 1;
            case 'user':
                await adminAuth.updateUser(session?.metadata?.id, {
                    email: payloadParsed?.email,
                    displayName: payloadParsed?.name,
                    emailVerified: true,
                });
                const userUpdateRef = await updateFirestoreDocFromData(payloadParsed, 'metadata', `${session?.metadata?.id}`)
                return 1;
            default:
                break;
        }
    }
    return 0;

}

export default function SettingsScreen() {

    let submit = useSubmit();
    let navigation = useNavigation();

    const settingsUpdateResult = useActionData();

    useEffect(() => {
        if (navigation.state == "loading" && settingsUpdateResult == 1) {
            emitToast(null, <h1>Update Successful</h1>, "success");
        }
    }, [navigation, settingsUpdateResult]);

    const { metadata, businessData } = useOutletContext();

    const businessSettingsForm = useForm();
    const [businessEditLocked, lockBusinessEdit] = useState(true)

    const accountSettingsForm = useForm();
    const [accountEditLocked, lockAccountEdit] = useState(true)


    return (
        <div className="flex flex-col space-y-4 h-full">
            <div id="business_settings" className="flex flex-col h-auto bg-white shadow-lg p-3 rounded-lg">
                <FormProvider {...businessSettingsForm} >
                    <form onSubmit={businessSettingsForm.handleSubmit((data) => {
                        const jsonData = JSON.stringify(data);
                        if (Object.keys(JSON.parse(jsonData)).length > 0) {
                            const formData = new FormData();
                            formData.append('payload', jsonData);
                            formData.append('type', 'business');
                            submit(formData, { method: 'post' });
                        }
                    })} className="flex flex-col p-4">
                        <div className="flex flex-row justify-between items-center">
                            <h1 className="text-lg">Business Settings</h1>
                            <div className="flex flex-row space-x-4 ">
                                <AnimatePresence exitBeforeEnter>
                                    {!businessEditLocked && <SaveButtonMotion loading={navigation.formData?.get('type') == "business"} submit />}
                                </AnimatePresence>
                                <EditButton active={!businessEditLocked} onClick={() => {
                                    lockBusinessEdit(!businessEditLocked)
                                }}></EditButton>
                            </div>
                        </div>
                        <div className="flex flex-row h-full space-x-4 mt-4">
                            <div className="flex flex-col h-full  w-1/2">
                                <NucleiTextInput name="business_name" disabled={businessEditLocked} defaultValue={businessData?.business_name} label="Name of the Business" placeholder="E.g: Neutron Money Pvt Ltd"></NucleiTextInput>
                                <NucleiTextInput name="industryType" disabled={businessEditLocked} label="Description" defaultValue={businessData?.description} placeholder="E.g: Put your AR on autopilot"></NucleiTextInput>
                                <NucleiTextInput name="pan" label="Business PAN" disabled={businessEditLocked} defaultValue={businessData?.pan} placeholder="E.g: Chakan Cluster"></NucleiTextInput>
                                <NucleiTextInput name="website" label="Website" disabled={businessEditLocked} defaultValue={businessData?.website} placeholder="e.g : https://neutron.money" />
                            </div>
                            <div className="flex flex-col border-l-2 h-full border-neutral-light">
                            </div>
                            <div className="flex flex-col h-full w-1/2">
                                <NucleiTextInput name="address_line_1" disabled={businessEditLocked} defaultValue={businessData?.address_line_1} label="Address Line 1" placeholder="e.g: 103, Raheja Arbor" />
                                <NucleiTextInput name="address_line_2" disabled={businessEditLocked} defaultValue={businessData?.address_line_2} label="Address Line 2" placeholder="e.g: Sivanchetti Gardens, Bangalore - 560042" optional />
                                <div className="sm:text-left space-x-2 flex flex-row w-full">
                                    <NucleiTextInput name="city" disabled={businessEditLocked} defaultValue={businessData?.city} label="City" placeholder="e.g: Bangalore" />
                                    <NucleiDropdownInput disabled={businessEditLocked} defaultValue={businessData?.state} name={"state"} label={"State"} placeholder={"State"}>
                                        <option value="Andhra Pradesh">Andhra Pradesh</option>
                                        <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                                        <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                                        <option value="Assam">Assam</option>
                                        <option value="Bihar">Bihar</option>
                                        <option value="Chandigarh">Chandigarh</option>
                                        <option value="Chhattisgarh">Chhattisgarh</option>
                                        <option value="Dadar and Nagar Haveli">Dadar and Nagar Haveli</option>
                                        <option value="Daman and Diu">Daman and Diu</option>
                                        <option value="Delhi">Delhi</option>
                                        <option value="Lakshadweep">Lakshadweep</option>
                                        <option value="Puducherry">Puducherry</option>
                                        <option value="Goa">Goa</option>
                                        <option value="Gujarat">Gujarat</option>
                                        <option value="Haryana">Haryana</option>
                                        <option value="Himachal Pradesh">Himachal Pradesh</option>
                                        <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                                        <option value="Jharkhand">Jharkhand</option>
                                        <option value="Karnataka">Karnataka</option>
                                        <option value="Kerala">Kerala</option>
                                        <option value="Madhya Pradesh">Madhya Pradesh</option>
                                        <option value="Maharashtra">Maharashtra</option>
                                        <option value="Manipur">Manipur</option>
                                        <option value="Meghalaya">Meghalaya</option>
                                        <option value="Mizoram">Mizoram</option>
                                        <option value="Nagaland">Nagaland</option>
                                        <option value="Odisha">Odisha</option>
                                        <option value="Punjab">Punjab</option>
                                        <option value="Rajasthan">Rajasthan</option>
                                        <option value="Sikkim">Sikkim</option>
                                        <option value="Tamil Nadu">Tamil Nadu</option>
                                        <option value="Telangana">Telangana</option>
                                        <option value="Tripura">Tripura</option>
                                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                                        <option value="Uttarakhand">Uttarakhand</option>
                                        <option value="West Bengal">West Bengal</option>
                                    </NucleiDropdownInput>
                                    <NucleiTextInput disabled={businessEditLocked} name="pincode" defaultValue={businessData?.pincode} label="Pincode" placeholder="e.g: 560042" />
                                </div>
                            </div>
                        </div>
                    </form>
                </FormProvider>

            </div>
            <div id="account_settings" className="flex flex-col h-auto p-3 shadow-lg bg-white rounded-lg">
                <FormProvider {...accountSettingsForm} >
                    <form onSubmit={accountSettingsForm.handleSubmit((data) => {
                        const jsonData = JSON.stringify(data);
                        if (Object.keys(JSON.parse(jsonData)).length > 0) {
                            const formData = new FormData();
                            formData.append('payload', jsonData);
                            formData.append('type', 'user');
                            submit(formData, { method: 'post' });
                        }
                    })} className="flex flex-col p-4">
                        <div className="flex flex-row justify-between items-center">
                            <h1 className="text-lg">Account Settings</h1>
                            <div className="flex flex-row space-x-4 ">
                                <AnimatePresence exitBeforeEnter>
                                    {!accountEditLocked && <SaveButtonMotion loading={navigation.formData?.get('type') == "user"} submit />}
                                </AnimatePresence>
                                <EditButton active={!accountEditLocked} onClick={() => {
                                    lockAccountEdit(!accountEditLocked)
                                }}></EditButton>


                            </div>
                        </div>
                        <div className="flex flex-row h-full space-x-4 mt-4">
                            <div className="flex flex-col h-full  w-1/2">
                                <NucleiTextInput disabled={accountEditLocked} name="email" defaultValue={metadata?.email} label="Email" placeholder="E.g: kartik@neutron.money"></NucleiTextInput>
                            </div>
                            <div className="flex flex-col border-l-2 h-full border-neutral-light">
                            </div>
                            <div className="flex flex-col h-full w-1/2">
                                <NucleiTextInput disabled={accountEditLocked} name="name" label="Name" defaultValue={metadata?.name} placeholder="E.g: Kartik Pande"></NucleiTextInput>
                            </div>
                        </div>
                    </form>
                </FormProvider>
            </div>
            <div id="account_settings" className="flex flex-col h-auto py-2">

            </div>
        </div>
    )
}