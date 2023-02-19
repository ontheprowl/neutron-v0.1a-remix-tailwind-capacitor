import { Outlet, useLocation, useSubmit } from "@remix-run/react";
import { ActionFunction, LoaderFunction, json, redirect } from "@remix-run/server-runtime";
import { getAuth } from "firebase/auth";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import OnboardingSidePanel from '~/assets/images/OnboardingSidePanel.svg'

import Icon from "~/assets/images/icon_black.svg"
import OnboardingStepper from "~/components/onboarding/OnboardingStepper";
import { setFirestoreDocFromData } from "~/firebase/queries.server";
import { NeutronError } from "~/logging/NeutronError";
import { requireUser } from "~/session.server";



export const action: ActionFunction = async ({ request, params }) => {
    try {
        console.dir("ONBOARDING DATA RECEIVED .... ")

        const dataString = (await request.formData()).get('payload')?.toString();
        const data = JSON.parse(dataString);
        console.log(data)
        return json({ data: data })
        // const metadataRef = await setFirestoreDocFromData({ ...session.metadata, ...data }, `metadata`, session?.metadata?.id);

    } catch (e) {
        console.log(e)
        const neutronError = new NeutronError(e);
        return json({ type: neutronError.type, message: neutronError.message });
    }

}



export const loader: LoaderFunction = async ({ request, params }) => {


    const session = await requireUser(request);

    if (session && getAuth().currentUser?.emailVerified) {

        return redirect(`/${session?.metadata?.displayName}/dashboard`)
    }

    return null;
}



const stageURLS: { [x: string]: any } = { "/onboarding/industry": 0, "/onboarding/business": 1, "/onboarding/integrations": 2, "/onboarding/team": 3, "/onboarding/welcome": 4 }


export default function OnboardingLayout() {


    const { pathname } = useLocation();

    const submit = useSubmit()

    const methods = useForm();

    return (
        <div className="h-screen w-full justify-start flex flex-row bg-white align-middle">

            <div className="flex flex-col  h-full bg-no-repeat bg-center bg-cover w-3/12 bg-[url('/OnboardingSidePanel.svg')]">
                <div className="flex flex-col items-center  space-y-16  m-5 mt-10 p-2 h-auto">
                    <img alt="neutronIcon" className=" w-32" src={Icon} />
                    <div id="onboarding_stepper" className=" w-full  pl-4 h-auto">
                        <OnboardingStepper stage={stageURLS[pathname]}></OnboardingStepper>
                    </div>
                </div>

            </div>
            <div className="w-9/12 flex flex-row justify-center">
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