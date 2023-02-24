import { useNavigate } from "@remix-run/react"
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import NucleiDropdownInput from "~/components/inputs/fields/NucleiDropdownInput";
import NucleiTextInput from "~/components/inputs/fields/NucleiTextInput";





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
            <div id="team_details" className="mt-8 flex flex-col space-y-6 max-w-2xl">
                <div className="h-[400px] overflow-y-scroll flex flex-col space-y-3">
                    {[...Array(teamSize)].map((value, index) => {
                        return (
                            <div key={index} className="w-full flex flex-row space-x-4">
                                <NucleiTextInput name={`team.${index}.name`} label="Name" placeholder="Name of the Member"/>
                                <NucleiDropdownInput name={`team.${index}.role`} label={"Role"} placeholder={"Role in your organization"}>
                                    <option value="Admin">Admin</option>
                                    <option value="Manager">Manager</option>
                                    <option value="Technician">Technician</option>
                                </NucleiDropdownInput>
                                <NucleiTextInput name={`team.${index}.email`} label="Email" placeholder="Email of the Member"></NucleiTextInput>
                            </div>
                        )
                    })}
                </div>
                <button onClick={() => {
                    setTeamSize(teamSize + 1)
                }} type="button" className="w-3/12 rounded-lg self-center  bg-white p-3 border-2 border-neutral-light outline-none ring-1 ring-transparent text-primary-base font-gilroy-medium font-[18px] transition-all">
                    Add More
                </button>
                <div className="flex flex-row space-x-6">
                    <button
                        className="w-3/12 rounded-lg  bg-primary-light p-3 border-2 border-transparent hover:active:focus:opacity-80 outline-none ring-1 ring-transparent focus:ring-white focus:border-white hover:border-white hover:ring-white text-primary-base font-gilroy-medium font-[18px] transition-all"
                        type="button"
                        onClick={() => {
                            navigate("../integrations")
                        }}
                    >
                        Go Back
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
            </div>
        </div >)
}