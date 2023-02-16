import { useNavigate } from "@remix-run/react"
import { useForm, useFormContext } from "react-hook-form";
import NeutronRadioButton from "~/components/inputs/radios/NeutronRadioButton";
import NeutronRadioGroup from "~/components/inputs/radios/NeutronRadioGroup";
import { OnboardingDataStore } from "~/stores/OnboardingDataStore"





export default function IndustryDetails() {

    let navigate = useNavigate()

    const { register } = useFormContext();

    return (
        <div className=" items-center m-4 p-6 w-8/12">
            <div>
                <h1 className="font-gilroy-bold text-[24px]">Let us know more about your organization</h1>
                <span>If you need more info, please check out our <a className="text-primary-base hover:underline hover:decoration-primary-base" href="https://www.neutron.money/support">Help Page</a></span>
            </div>
            <div id="industry_details" className="mt-8 flex flex-col space-y-6">
                <div className="sm:text-left space-y-3  w-full">
                    <span className=" prose prose-md text-black font-gilroy-bold text-[14px]">Name of the Business</span>
                    <input  {...register('business_name')} type="text" placeholder="e.g: Neutron Money Pvt. Ltd." className=" transition-all bg-[#FFFFFF] pt-3 pb-3 pl-4 pr-4 border-2 border-[#DCDCDC] caret-bg-accent-dark focus:outline-none  text-[#BCBDBD] active:caret-yellow-400 text-sm rounded-lg placeholder-[#BCBDBD] block w-full h-12 font-gilroy-medium font-[18px] " />
                </div>
                <div className="sm:text-left space-y-3  w-full">
                    <span className=" prose prose-md text-black font-gilroy-bold text-[14px]">Industry</span>
                    <div id="industry_options" className="grid grid-cols-2 gap-4">
                        <NeutronRadioGroup>
                            <NeutronRadioButton name={"industryType"} no={1}></NeutronRadioButton>
                            <NeutronRadioButton name={"industryType"} no={2}></NeutronRadioButton>
                            <NeutronRadioButton name={"industryType"} no={3}></NeutronRadioButton>
                            <NeutronRadioButton name={"industryType"} no={4}></NeutronRadioButton>
                        </NeutronRadioGroup>

                    </div>
                </div>
                <div className="sm:text-left space-y-3  w-full">
                    <span className=" prose prose-md text-black font-gilroy-bold text-[14px]">Others</span>
                    <input  {...register('others')} type="text" placeholder="e.g: Neutron Money Pvt. Ltd." className=" transition-all bg-[#FFFFFF] pt-3 pb-3 pl-4 pr-4 border-2 border-[#DCDCDC] caret-bg-accent-dark focus:outline-none  text-[#BCBDBD] active:caret-yellow-400 text-sm rounded-lg placeholder-[#BCBDBD] block w-full h-12 font-gilroy-medium font-[18px] " />
                </div>
                <button
                    className="w-3/12 rounded-lg  bg-primary-base p-3 border-2 border-transparent active:bg-primary-dark hover:bg-primary-dark outline-none ring-1 ring-transparent focus:ring-white focus:border-white hover:border-white hover:ring-white text-white font-gilroy-medium font-[18px] transition-all"
                    onClick={()=>{
                        navigate("../business")
                    }}
                >
                    Continue 
                </button>
            </div>
        </div >)
}