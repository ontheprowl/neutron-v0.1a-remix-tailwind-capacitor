import { Outlet, useLocation, useSubmit } from "@remix-run/react";
import { ActionFunction, LoaderFunction, json, redirect } from "@remix-run/server-runtime";
import { serverAuth } from "~/firebase/firebase-exports.server";
import { FormProvider, useForm } from "react-hook-form";
import OnboardingSidePanel from '~/assets/images/OnboardingSidePanel.svg'

import Icon from "~/assets/images/icon_black.svg"
import OnboardingStepper from "~/components/onboarding/OnboardingStepper";
import { setFirestoreDocFromData, updateFirestoreDocFromData } from "~/firebase/queries.server";
import { NeutronError } from "~/logging/NeutronError";
import { requireUser } from "~/session.server";
import { NeutronToastContainer } from "~/utils/toasts/NeutronToastContainer";
import  crypto  from "crypto";


export const action: ActionFunction = async ({ request, params }) => {
    try {

        const session = await requireUser(request);

        console.dir("ONBOARDING DATA RECEIVED .... ")

        const dataString = (await request.formData()).get('payload')?.toString();
        const data: { business_name: string } = JSON.parse(dataString);

        console.log("payload")
        console.log(data)

        // ** business queries to be identified by business_id

        const businessID = crypto.randomUUID();
        const businessUIDRef = await setFirestoreDocFromData(data, 'businesses', `${businessID}`)

        const updateUserMetadataRef = await updateFirestoreDocFromData({ firstLogin: true, businessID: businessID, ...data }, 'metadata', `${session?.metadata?.id}`);

        return redirect(`/dashboard`)

    } catch (e) {
        console.log(e)
        const neutronError = new NeutronError(e);
        return json({ type: neutronError.type, message: neutronError.message });
    }

}



export const loader: LoaderFunction = async ({ request, params }) => {


    const session = await requireUser(request);


    if (!session) {
        return redirect('/login')
    }

    if (serverAuth.getAuth().currentUser?.emailVerified && session?.metadata?.businessID) {

        return redirect(`/dashboard`)
    }

    return null;
}



const stageURLS: { [x: string]: any } = { "/onboarding/industry": 1, "/onboarding/business": 2, "/onboarding/integrations": 0, "/onboarding/team": 3, "/onboarding/welcome": 4 }


export default function OnboardingLayout() {


    const { pathname } = useLocation();

    const submit = useSubmit()

    const methods = useForm();

    return (
        <div className="h-screen w-full justify-start flex flex-row bg-white align-middle">

            <div className="flex flex-col  h-screen bg-no-repeat bg-center bg-cover w-3/12 bg-[url('/OnboardingSidePanel.svg')]">
                <div className="flex flex-col items-center  space-y-16  m-5 mt-10 p-2 h-auto">
                    <img alt="neutronIcon" className=" w-32" src={Icon} />
                    <div id="onboarding_stepper" className=" w-full  min-w-fit max-w-fit  pl-4 h-auto">
                        <OnboardingStepper stage={stageURLS[pathname]}></OnboardingStepper>
                    </div>
                </div>

            </div>
            <div className="w-9/12 h-screen overflow-y-scroll flex flex-row justify-center">
                <FormProvider {...methods}>
                    <form className="w-full" onSubmit={methods.handleSubmit((data) => {
                        const formdata = new FormData();
                        formdata.append('payload', JSON.stringify(data));

                        submit(formdata, { method: "post" });

                    })
                    }>
                        <Outlet></Outlet>
                    </form>

                </FormProvider>


            </div>
        </div>
    )

}