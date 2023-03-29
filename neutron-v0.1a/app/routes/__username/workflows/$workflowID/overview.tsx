import { Link, useNavigate, useOutletContext } from "@remix-run/react";
import EditButton from "~/components/inputs/buttons/EditButton";
import EmailIcon from "~/assets/images/emailIcon.svg";
import WorkflowMessageIcon from "~/assets/images/workflowMessageIcon.svg";


export default function WorkflowOverview() {

    const workflow: { [x: string]: any } = useOutletContext();

    const assigned_to: [name: string, email: string] = workflow?.assigned_to?.split(",")

    let navigate = useNavigate();

    console.dir(workflow)

    return (
        <div className=" flex flex-row space-x-4 w-full h-full">
            <div className="flex flex-col w-1/2 space-y-4">
                <div className="min-h-fit h-auto flex flex-col space-y-4 divide-y-2 divide-dashed divide-neutral-light shadow-lg rounded-xl bg-white w-full p-3 ">
                    <div className="flex flex-col space-y-1">
                        <div className="flex flex-row items-center justify-between  border-secondary-text p-3">
                            <h1 className="text-lg">{workflow?.name}</h1>
                            <EditButton onClick={()=>{
                                navigate(`/workflows/edit/${workflow?.id}`)
                            }}></EditButton>
                        </div>
                        <div className="flex flex-row items-center justify-start space-x-4 border-secondary-text px-3">
                            {workflow?.tags?.split(",")?.map((tag) => {
                                return <span className="text-secondary-text border-2 border-secondary-text p-2  flex flex-col justify-center items-center rounded-xl" key={tag}>{tag}</span>
                            })}
                        </div>
                    </div>
                    <div className="flex flex-row justify-between p-3">
                        <div className="flex flex-col space-y-1">
                            <h1>No of Customers</h1>
                            <Link to="../customers" preventScrollReset className="text-secondary-text border-b-2 text-center border-dashed w-4 transition-all border-transparent hover:border-secondary-text">{workflow?.customers?.length}</Link>
                        </div>
                    </div>
                    <div className="flex flex-col space-y-4 p-3">
                        <h1>Assigned To</h1>
                        <div className="w-full bg-[#F5F5F5] rounded-xl flex flex-row justify-between p-6 h-auto">
                            <span>{assigned_to[0]}</span>
                            <div className="flex flex-col space-y-3">
                                <div className="flex flex-row space-x-6">
                                    <img src={EmailIcon} alt="email_icon" />
                                    <span>{assigned_to[1]}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
                <div className="h-auto bg-white rounded-xl shadow-lg p-6">
                    <div className="flex flex-col space-y-4">
                        <div className="flex flex-row items-center justify-between">
                            <h1>Workflow Constraints</h1>
                            <EditButton />
                        </div>

                    </div>

                </div>
            </div>
            <div className="flex flex-col w-1/2 space-y-4">
                <div className="h-full bg-white rounded-xl shadow-lg p-4 w-full">
                    <ul className="h-full w-full overflow-y-scroll max-h-screen flex flex-col space-y-4 p-4">
                        {workflow?.actions?.map((action) => {
                            console.log(action)
                            return (
                                <li key={action.triggerName} className="flex flex-col h-auto rounded-xl shadow-lg">
                                    <div className="bg-primary-light rounded-xl flex flex-row items-center justify-between h-1/3 p-12">
                                        <div className="flex flex-col justify-between">
                                            <h1 className="text-primary-base text-lg">{action?.days} Days</h1>
                                            <span className="font-gilroy-medium">{action?.trigger}</span>
                                        </div>
                                        <EditButton />
                                    </div>
                                    <div className="bg-white flex flex-row w-full px-12 py-3  justify-between items-center rounded-xl h-2/3">
                                        <div className="flex flex-col space-y-2">
                                            <span className="text-lg">Action - {action?.action}</span>
                                            <span className="text-secondary-text font-gilroy-medium">{action?.action_type == "manual" ? `Assigned To - ${action?.assigned_to}` : `Template - ${action?.template}`}</span>
                                        </div>
                                        <div className="flex flex-row items-center justify-end space-x-4 w-2/5">
                                            <img src={WorkflowMessageIcon} alt="workflow_message_icon" />
                                            <div className="p-3 rounded-xl uppercase bg-success-light text-success-dark">
                                                {action?.action_type}
                                            </div>
                                        </div>


                                    </div>

                                </li>)
                        })}
                    </ul>
                </div>

            </div>
        </div>)
}