import { useNavigate } from "@remix-run/react";
import { useState } from "react";
import { useFormContext } from "react-hook-form"



export default function WelcomeToNeutron() {


    let navigate = useNavigate();

    const { register } = useFormContext();


    const [tutorialSection, setTutorialSection] = useState<number>(0)

    return (
        <div className=" items-center m-4 p-6 w-8/12">
            <div>
                <h1 className="font-gilroy-bold text-[24px]">Explore Neutron</h1>
                <span>If you need more info, please check out our <a className="text-primary-base hover:underline hover:decoration-primary-base" href="https://www.neutron.money/support">Help Page</a></span>
            </div>
            <div id="industry_details" className="mt-8 flex flex-col space-y-6">
                <div id="promo_container" className="h-[400px] overflow-y-scroll bg-neutral-light rounded-xl flex flex-col space-y-6">

                </div>
                <div className="h-auto font-bold text-secondary-text flex flex-col space-y-4 border-black w-full">
                    <span onClick={() => {
                        setTutorialSection(0)
                    }} className={` cursor-pointer ${tutorialSection == 0 ? 'text-primary-base' : ''}`}>Overview</span>
                    <span onClick={() => {
                        setTutorialSection(1)
                    }} className={` cursor-pointer ${tutorialSection == 1 ? 'text-primary-base' : ''}`}>How it works</span>
                    <span onClick={() => {
                        setTutorialSection(2)
                    }} className={` cursor-pointer ${tutorialSection == 2 ? 'text-primary-base' : ''}`}>Create your first contract</span>
                    <span onClick={() => {
                        setTutorialSection(3)
                    }} className={` cursor-pointer ${tutorialSection == 3 ? 'text-primary-base' : ''}`}>Sign contract</span>
                    <span onClick={() => {
                        setTutorialSection(4)
                    }} className={` cursor-pointer ${tutorialSection == 4 ? 'text-primary-base' : ''}`}> Submit Deliverables</span>
                    <span onClick={() => {
                        setTutorialSection(5)
                    }} className={` cursor-pointer ${tutorialSection == 5 ? 'text-primary-base' : ''}`}>Make Payment</span>
                </div>
                <div className="flex flex-row space-x-6">
                    <button
                        className="w-3/12 rounded-lg  bg-primary-light p-3 border-2 border-transparent hover:active:focus:opacity-80 outline-none ring-1 ring-transparent focus:ring-white focus:border-white hover:border-white hover:ring-white text-primary-base font-gilroy-medium font-[18px] transition-all"
                        type="button"
                        onClick={() => {
                            navigate("../team")
                        }}
                    >
                        Go Back
                    </button>
                    <button
                        className="w-3/12 rounded-lg  bg-primary-base p-3 border-2 border-transparent active:bg-primary-dark hover:bg-primary-dark outline-none ring-1 ring-transparent focus:ring-white focus:border-white hover:border-white hover:ring-white text-white font-gilroy-medium font-[18px] transition-all"
                        type="submit"
                    >
                        Finish Onboarding
                    </button>
                </div>

            </div>
        </div >
    )
}