import { useNavigate } from "@remix-run/react"
import { useState } from "react";
import { useFormContext } from "react-hook-form";





export default function TeamDetails() {

    let navigate = useNavigate()

    const [teamSize, setTeamSize] = useState<number>(2);

    const { register } = useFormContext();

    return (
        <div className=" items-center m-4 p-6 w-8/12">
            <div>
                <h1 className="font-gilroy-bold text-[24px]">Team Setup</h1>
                <span>Add your team members</span>
            </div>
            <div id="industry_details" className="mt-8 flex flex-col space-y-6">
                <div className="h-[400px] overflow-y-scroll flex flex-col space-y-6">
                    {[...Array(teamSize)].map((value, index) => {
                        return (
                            <div key={value} className="w-full flex flex-row space-x-4">
                                <div className="sm:text-left space-y-3  w-1/2">
                                    <span className=" prose prose-md text-black font-gilroy-bold text-[14px]">Name</span>
                                    <input  {...register(`team.${index}.memberName`)} type="text" placeholder="e.g: Neutron Money Pvt. Ltd." className=" transition-all bg-[#FFFFFF] pt-3 pb-3 pl-4 pr-4 border-2 border-[#DCDCDC] caret-bg-accent-dark focus:outline-none  text-[#BCBDBD] active:caret-yellow-400 text-sm rounded-lg placeholder-[#BCBDBD] block w-full h-12 font-gilroy-medium font-[18px] " />
                                </div>
                                <div className="sm:text-left space-y-3  w-1/2">
                                    <span className=" prose prose-md text-black font-gilroy-bold text-[14px]">Role</span>
                                    <input  {...register(`team.${index}.memberRole`)} type="text" placeholder="e.g: Neutron Money Pvt. Ltd." className=" transition-all bg-[#FFFFFF] pt-3 pb-3 pl-4 pr-4 border-2 border-[#DCDCDC] caret-bg-accent-dark focus:outline-none  text-[#BCBDBD] active:caret-yellow-400 text-sm rounded-lg placeholder-[#BCBDBD] block w-full h-12 font-gilroy-medium font-[18px] " />
                                </div>
                            </div>
                        )
                    })}
                </div>
                <button onClick={() => {
                    setTeamSize(teamSize + 1)
                }} className="w-3/12 rounded-lg self-center  bg-white p-3 border-2 border-neutral-light outline-none ring-1 ring-transparent text-primary-base font-gilroy-medium font-[18px] transition-all">
                    Add More
                </button>
                <button
                    className="w-3/12 rounded-lg  bg-primary-base p-3 border-2 border-transparent active:bg-primary-dark hover:bg-primary-dark outline-none ring-1 ring-transparent focus:ring-white focus:border-white hover:border-white hover:ring-white text-white font-gilroy-medium font-[18px] transition-all"
                    type="button"
                    onClick={() => {
                        navigate("../welcome")
                    }}
                >
                    Continue
                </button>
            </div>
        </div >)
}