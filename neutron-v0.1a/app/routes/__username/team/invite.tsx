import { Link, Outlet, useLocation, useNavigate, useOutletContext } from "@remix-run/react";
import { ActionFunction } from "@remix-run/server-runtime";
import { useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import DeleteButton from "~/components/inputs/buttons/DeleteButton";
import EditButton from "~/components/inputs/buttons/EditButton";
import SaveButton from "~/components/inputs/buttons/SaveButton";
import NucleiDropdownInput from "~/components/inputs/fields/NucleiDropdownInput";
import NucleiTextInput from "~/components/inputs/fields/NucleiTextInput";
import { requireUser } from "~/session.server";


export const action: ActionFunction = async ({ request, params }) => {
    const session = await requireUser(request);

}




export default function InviteUsers() {


    const [invitesSize, setInvitesSize] = useState<number>(2);

    const inviteTeamMembersForm = useForm();
    const control = inviteTeamMembersForm.control;

    const invites: Array<{ [x: string]: any }> = useWatch({ control, name: 'invites' });


    let navigate = useNavigate();

    const { pathname } = useLocation();

    const inviteIndexes = Array<number>(invitesSize);

    return (<div className=" h-full flex flex-col space-y-4">
        <div className="flex flex-row justify-between">
            <div id="page_title" className="flex flex-col">
                <h1 className="text-base">Team Members</h1>
                <span className="text-neutral-base text-sm font-gilroy-medium"> Home - Team Members - Invite</span>
            </div>
            <button className="text-white text-sm font-gilroy-medium bg-primary-base hover:bg-primary-dark transition-all p-3 rounded-lg" onClick={() => {
                navigate('/team', { preventScrollReset: true })
            }}>Back to Team</button>
        </div>

        <div id="invite_team_members" className="bg-white w-full rounded-xl shadow-lg p-6 ">
            <div>
                <h1 className="font-gilroy-bold text-md">Invite Team Members</h1>
                <span className="font-gilroy-medium text-sm">Assign roles and permissions</span>
            </div>
            <div id="team_details">

                <FormProvider {...inviteTeamMembersForm}>
                    <form className="mt-8 flex flex-col space-y-2 w-full" onSubmit={inviteTeamMembersForm.handleSubmit(() => {

                    })}>
                        <div className="h-auto max-h-[400px] overflow-y-scroll snap-y flex flex-col space-y-3">
                            {[...inviteIndexes].map((value, index) => {
                                return (
                                    <div key={index} id={`invite_form_${index}`} className="w-full snap-start flex flex-row space-x-4">
                                        <div className="flex flex-row items-center space-x-4">
                                            <input {...inviteTeamMembersForm.register(`invites.${index}.delete`)} type="checkbox" />
                                        </div>
                                        <br></br>
                                        <NucleiTextInput name={`invites.${index}.name`} label="Name" placeholder="Name of the Member" />
                                        <NucleiDropdownInput name={`invites.${index}.role`} label={"Role"} placeholder={"Role in your organization"}>
                                            <option value="Admin">Admin</option>
                                            <option value="Manager">Manager</option>
                                            <option value="Technician">Technician</option>
                                        </NucleiDropdownInput>
                                        <NucleiTextInput name={`invites.${index}.email`} label="Email" placeholder="Email of the Member"></NucleiTextInput>
                                    </div>
                                )
                            })}
                        </div>
                        <button onClick={() => {
                            setInvitesSize(invitesSize + 1)
                            console.log(invites)
                        }} type="button" className="w-2/12 rounded-lg self-center  bg-white p-3 border-2 border-neutral-light outline-none ring-1 ring-transparent text-primary-base font-gilroy-medium font-[18px] transition-all">
                            Add More
                        </button>
                        <div className="flex flex-row space-x-6 justify-end">
                            <SaveButton submit />
                            <DeleteButton onClick={() => {
                                for (let i = 0; i < invites.length; i++) {
                                    console.log(invites[i]);
                                    if (invites[i].delete) {
                                        document.getElementById(`invite_form_${i}`)?.remove();
                                        delete invites[i];
                                        inviteTeamMembersForm.resetField(`invites.${i}`);
                                        inviteTeamMembersForm.unregister(`invites.${i}`);
                                    }
                                }
                            }} />
                        </div>
                    </form>
                </FormProvider>

            </div>
        </div>


    </div>)

}