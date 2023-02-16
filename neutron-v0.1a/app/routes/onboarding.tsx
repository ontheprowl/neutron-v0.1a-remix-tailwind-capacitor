import { Outlet, useLocation } from "@remix-run/react";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import OnboardingSidePanel from '~/assets/images/OnboardingSidePanel.svg'

import Icon from "~/assets/images/icon_black.svg"
import OnboardingStepper from "~/components/onboarding/OnboardingStepper";




const stageURLS: { [x: string]: any } = { "/onboarding/industry": 0, "/onboarding/business": 1, "/onboarding/integrations": 2, "/onboarding/team": 3, "/onboarding/welcome": 4 }


export default function OnboardingLayout() {


    const { pathname } = useLocation();

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
                    <Outlet></Outlet>
                </FormProvider>


            </div>

        </div>
    )

}