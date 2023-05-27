import { Link, Outlet, useLocation, useNavigate, useOutletContext } from "@remix-run/react";
import { Key, ReactElement, JSXElementConstructor, ReactFragment, ReactPortal } from "react";
import DeleteButton from "~/components/inputs/buttons/DeleteButton";
import EditButton from "~/components/inputs/buttons/EditButton";






export default function TeamPage() {


    const teamMembers = [{
        name: 'Kunal Sawant',
        email: 'kunal@neutron.money',
        role: 'admin',
        permissions: {

        }
    }]


    let navigate = useNavigate();
    const { metadata, businessData } = useOutletContext();

    console.log(businessData)

    const { pathname } = useLocation();


    return (<div className=" h-full flex flex-col space-y-4">
        <div className="flex flex-row justify-between">
            <div id="page_title" className="flex flex-col">
                <h1 className="text=base">Team Members</h1>
                <span className="text-neutral-base text-sm font-gilroy-medium"> Home - Team Members</span>
            </div>
            <button className="text-white text-sm font-gilroy-medium bg-primary-base hover:bg-primary-dark transition-all p-3 rounded-lg" onClick={() => {
                navigate('invite', { preventScrollReset: true })
            }}>Invite Users</button>
        </div>

        <div id="team_members" className="h-full overflow-y-scroll">
            <ul className="flex flex-col space-y-6">{
                businessData?.team?.filter((member: { email: string, name: string, role: string })=>{
                    return member.email != ''  && member.name != '' 
                }).map((member: { email: string, name: string, role: string }) => {
                    return (
                        <div key={member.email} className="bg-white w-full rounded-xl shadow-lg p-6 ">
                            <div className="flex flex-row  items-center justify-between">
                                <div className="flex flex-col space-y-4">
                                    <h1 className="text-primary-base text-lg">{member.name}</h1>
                                    <span className="text-base font-gilroy-medium">{member.email}</span>
                                </div>
                                <div className="flex flex-row space-x-4 items-center">
                                    <span className="bg-neutral-light uppercase flex flex-row items-center rounded-xl p-2">{member.role}</span>
                                    <EditButton></EditButton>
                                    <DeleteButton></DeleteButton>
                                </div>
                            </div>
                        </div>)
                })}

            </ul>
        </div>


    </div>)

}