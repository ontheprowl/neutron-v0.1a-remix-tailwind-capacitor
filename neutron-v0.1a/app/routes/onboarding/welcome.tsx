

import { useNavigate } from "@remix-run/react"
import { OnboardingDataStore } from "~/stores/OnboardingDataStore"





export default function WelcomeToNeutron(){

    let navigate = useNavigate()

    return <div className="border-2 border-black items-center m-8 p-10 w-8/12">
        <h1>Dis the end</h1>
    </div>
}