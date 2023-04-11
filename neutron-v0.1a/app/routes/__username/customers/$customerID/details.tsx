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
import { ValidationPatterns } from "~/utils/utils";




export const action: ActionFunction = async ({ request, params }) => {

    const session = await requireUser(request);

    const customerID = params.customerID;

    const formData = await request.formData();
    const type = formData.get('type')
    const payload = formData.get('payload');
    if (payload && customerID) {
        const payloadParsed = JSON.parse(payload);

        const businessDataRef = await updateFirestoreDocFromData(payloadParsed, 'customers',`business/${session?.metadata?.businessID}/${customerID}`)
        return 1;
    }
    return 0;

}

export default function SettingsScreen() {

    const customerData: { [x: string]: any } = useOutletContext();


    let submit = useSubmit();
    let navigation = useNavigation();

    const settingsUpdateResult = useActionData();

    useEffect(() => {
        if (navigation.state == "loading" && settingsUpdateResult == 1) {
            emitToast(null, <h1>Update Successful</h1>, "success");
        }
    }, [navigation, settingsUpdateResult]);


    const customerSettingsForm = useForm();
    const [customerEditLocked, lockCustomerEdit] = useState(true)



    return (
        <div className="flex flex-col space-y-4 h-full">
            <div id="business_settings" className="flex flex-col h-auto bg-white shadow-lg p-3 rounded-lg">
                <FormProvider {...customerSettingsForm} >
                    <form onSubmit={customerSettingsForm.handleSubmit((data) => {
                        const jsonData = JSON.stringify(data);
                        if (Object.keys(JSON.parse(jsonData)).length > 0) {
                            const formData = new FormData();
                            formData.append('payload', jsonData);
                            submit(formData, { method: 'post' });
                        }
                    })} className="flex flex-col p-4">
                        <div className="flex flex-row justify-between items-center">
                            <h1 className="text-lg">Customer Details</h1>
                            <div className="flex flex-row space-x-4 ">
                                <AnimatePresence exitBeforeEnter>
                                    {!customerEditLocked && <SaveButtonMotion loading={navigation.formData} submit />}
                                </AnimatePresence>
                                <EditButton active={!customerEditLocked} onClick={() => {
                                    lockCustomerEdit(!customerEditLocked)
                                }}></EditButton>
                            </div>
                        </div>
                        <div className="flex flex-row h-full space-x-4 mt-4">
                            <div className="flex flex-col h-full  w-1/2">

                                <NucleiTextInput name="email" label="Email" disabled={customerEditLocked} defaultValue={customerData?.email} placeholder="e.g : customer@gmail.com" />
                            </div>
                            <div className="flex flex-col border-l-2 h-full border-neutral-light">
                            </div>
                            <div className="flex flex-col h-full w-1/2">
                                <NucleiTextInput disabled={customerEditLocked} name="mobile"  defaultValue={customerData?.mobile} label="Whatsapp Mobile No." placeholder="e.g: 839060****" />
                            </div>
                        </div>
                        <div className="flex flex-row h-full space-x-4 mt-4">
                            <div className="flex flex-col h-full  w-1/2">

                                <NucleiTextInput name="first_name" label="First Name"  disabled={customerEditLocked} defaultValue={customerData?.first_name} placeholder="e.g : Gaurav" />
                            </div>
                            <div className="flex flex-col border-l-2 h-full border-neutral-light">
                            </div>
                            <div className="flex flex-col h-full w-1/2">
                                <NucleiTextInput disabled={customerEditLocked} name="last_name" defaultValue={customerData?.last_name} label="Last Name" placeholder="e.g: Rajeev" />
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