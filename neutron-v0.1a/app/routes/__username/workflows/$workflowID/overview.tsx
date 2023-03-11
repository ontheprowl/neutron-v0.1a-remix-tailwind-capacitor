import EditButton from "~/components/inputs/buttons/EditButton";



export default function WorkflowOverview() {


    return (
        <div className="border-2 border-black flex flex-row space-x-4 w-full h-full">
            <div className="flex flex-col w-1/2 space-y-4">
                <div className="h-1/2 bg-white w-full ">
                    <div className="flex flex-row justify-between border-b-2 border-secondary-text p-3">
                        <h1>Pune MSMEs</h1>
                        <EditButton></EditButton>
                    </div>
                    <div className="flex flex-row justify-between p-3">
                        <div className="flex flex-col space-y-4">
                            <h1>Priority</h1>
                            <span>HIGH</span>
                        </div>
                        <div className="flex flex-col space-y-4">
                            <h1>No of Customers</h1>
                            <span>20</span>
                        </div>
                    </div>
                    <div className="flex flex-col space-y-6 p-3">
                        <h1>Assigned To</h1>
                        <div className="w-full bg-neutral-light h-auto">

                            <h1></h1>

                        </div>
                    </div>

                </div>
                <div className="h-auto bg-white">
                    <div className="flex flex-col space-y-4">
                        <div className="flex flex-row justify-between">
                            <h1>Workflow Constraints</h1>
                            <EditButton />
                        </div>

                    </div>

                </div>
            </div>
            <div className="flex flex-col w-1/2 space-y-4">
                <div className="h-full bg-white p-4 w-full">
                    <ul className="h-full w-full border-2 p-8">
                        {[{ triggerName: '', actions: [{ name: '', type: '', params: '', trigger: '' }] }].map((action) => {
                            return (
                                <div key={action.triggerName} className="flex flex-col rounded-xl shadow-lg">
                                    <div className="bg-primary-light flex flex-row justify-between h-1/3">
                                        <div className="flex flex-col justify-between">
                                            <h1>Trigger 1</h1>
                                            <span>Trigger 1</span>
                                        </div>
                                        <EditButton />
                                    </div>
                                    <div className="bg-white flex flex-col h-2/3">
                                        <ul>{action.actions.map(() => {
                                            return (
                                                <li>
                                                    
                                                </li>)
                                        })}</ul>
                                    </div>

                                </div>)
                        })}
                    </ul>
                </div>

            </div>
        </div>)
}