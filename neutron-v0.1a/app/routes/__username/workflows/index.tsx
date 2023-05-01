import { Link, useLoaderData, useNavigate, useSubmit } from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { useState } from "react";
import DeleteButton from "~/components/inputs/buttons/DeleteButton";
import NucleiPagination from "~/components/inputs/pagination/NucleiPagination";
import NucleiZeroState from "~/components/layout/NucleiZeroState";
import { deleteEvents, deleteFieldsFromFirestoreDoc, deleteFirestoreDoc, getFirebaseDocs } from "~/firebase/queries.server";
import { requireUser } from "~/session.server";


export const loader: LoaderFunction = async ({ request, params }) => {
    const session = await requireUser(request);

    const workflows = await getFirebaseDocs('workflows/business', false, `${session?.metadata?.businessID}`);

    return json(workflows);
}


export const action: ActionFunction = async ({ request, params }) => {
    const session = await requireUser(request);
    const formData = await request.formData();

    const action = formData.get('action');

    switch (action) {
        case "delete":
            const ids: string[] = JSON.parse(formData.get('ids'));
            for (const id of ids) {
                const deleteDocRef = await deleteFirestoreDoc('workflows', `business/${session?.metadata?.businessID}/${id}`);
                const deleteEventsRef = await deleteEvents(id, ['workflow_id']);
                const clearJobsFromWorkflow = await fetch(`https://neutron-knock.fly.dev/jobs/delete/${id}`, {
                    method: "DELETE",
                    headers: new Headers({
                        'Connection': 'close'
                    })
                })
                console.log(JSON.stringify(await clearJobsFromWorkflow.json()))

            }
            const indexUpdateRef = await deleteFieldsFromFirestoreDoc(ids, 'indexes', session?.metadata?.businessID);
            break;
        default:
            break;
    }

    return null;
}


export default function WorkflowsList() {

    const workflows: Array<{ id: string, data: { [x: string]: any } }> = useLoaderData();

    console.log(workflows)

    const [startOffset, setStart] = useState(0);
    const [endOffset, setEnd] = useState(50);
    const [filter, setFilter] = useState('');

    let submit = useSubmit();

    let navigate = useNavigate();

    return (
        <div className=" h-full flex flex-col space-y-4">
            <div className="flex flex-row justify-between">
                <div id="page_title" className="flex flex-col">
                    <h1 className="text-lg">Workflows</h1>
                    <span className="text-neutral-base"> Home - Workflows</span>
                </div>
                {workflows?.length > 0 && <button onClick={() => {
                    navigate("create")
                }} className="bg-primary-base text-white hover:bg-primary-dark transition-all rounded-lg p-3">
                    Add Workflow
                </button>}
            </div>
            {workflows?.length > 0 ?
                <div id="workflows_table" className="bg-white shadow-lg rounded-xl justify-between h-full flex flex-col">
                    <div id="table_functions" className="flex flex-row items-center pl-5 py-2 pr-5   justify-between h-auto">
                        <div className="flex flex-row bg-[#f5f5f5]  h-10 space-x-4 p-2 w-1/4  rounded-lg">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17.5 17.5L14.5834 14.5833M16.6667 9.58333C16.6667 13.4954 13.4954 16.6667 9.58333 16.6667C5.67132 16.6667 2.5 13.4954 2.5 9.58333C2.5 5.67132 5.67132 2.5 9.58333 2.5C13.4954 2.5 16.6667 5.67132 16.6667 9.58333Z" stroke="#6F6E6E" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>

                            <input type="text" placeholder="Search for a workflow" className="w-full bg-transparent text-neutral-dark placeholder:text-neutral-dark focus:border-transparent outline-none " />

                        </div>
                        <div className="flex flex-row space-x-4 w-2/5 p-2 items-center justify-end">
                            {/* <div className="flex flex-row space-x-4">
                            <button className="text-primary-dark underline underline-offset-2 decoration-primary-dark">All</button>
                            <button>Paid</button>
                        </div> */}
                            <div className="flex flex-row space-x-4 items-center">
                                <DeleteButton onClick={() => {
                                    const form = new FormData();
                                    form.append('action', 'delete');
                                    const values: HTMLInputElement[] = [...document.querySelectorAll('input[name="check_for_deletion"]')]
                                    form.append('ids', JSON.stringify(values.filter((element) => element.checked).map((element) => element.value)))
                                    submit(form, { method: "post" })
                                }} />
                            </div>
                        </div>
                    </div>

                    <div className={`hidden sm:table p-3 rounded-xl h-[75vh] max-h-[75vh] mt-1`}>
                        <table className={`w-full max-h-[70vh] overflow-y-scroll sm:block table-auto text-sm text-left text-black`}>

                            <tbody className='sm:block table-row-group'>
                                <tr className={` border-b text-secondary-text sm:flex sm:flex-row w-full transition-all sticky top-0 pointer-events-none bg-bg-secondary-dark z-20  hover:bg-opacity-50  dark:hover:bg-gray-600`}>

                                    <th scope="row" className="px-2 py-4 w-full font-medium text-left whitespace-nowrap">
                                        <div className="flex flex-row w-auto justify-start space-x-4">
                                            <input type="checkbox"></input>
                                            <h1>NAME OF THE WORKFLOW</h1>
                                        </div>
                                    </th>
                                    <th scope="row" className="px-2 text-left py-4 w-full font-medium  whitespace-nowrap">
                                        NO. OF CUSTOMERS
                                    </th>
                                    <th scope="row" className="px-2 py-4 w-full font-medium text-left ">
                                        WORKFLOW TYPE
                                    </th>
                                    <th scope="row" className="px-2 py-4 w-full font-medium text-left  ">
                                        PERSON IN CHARGE
                                    </th>
                                    <th scope="row" className="px-2 py-4  w-full font-medium text-left  whitespace-nowrap">
                                        TAGS
                                    </th>
                                </tr>
                                {workflows.map((workflow) => {
                                    const assigned_to: [name: string, email: string] = workflow?.data?.assigned_to?.split(",")
                                    return (<tr key={workflow.id} className={`border-b border-dashed sm:flex sm:flex-row sm:justify-evenly sm:items-center w-full border-gray-400 dark:bg-gray-800 dark:border-gray-700 transition-all hover:bg-bg-primary-dark hover:bg-opacity-50 hover:border-primary-dark`}>
                                        <td scope="row" className="px-2 py-4 w-full font-gilroy-regular text-left">
                                            <div className="flex flex-row w-auto justify-start space-x-4">
                                                <input name='check_for_deletion' value={workflow.id} type="checkbox"></input>
                                                <Link to={`${workflow.id}/overview`} className="decoration-black break-normal  font-gilroy-bold hover:underline cursor-pointer">{workflow?.data?.name}</Link>
                                            </div>
                                        </td>

                                        <td className=" py-4 font-gilroy-regular  w-full text-left px-10 ">
                                            {workflow?.data?.customers?.length}
                                        </td>
                                        <td className="  px-2 py-4 w-full font-gilroy-regular justify-start flex flex-row  text-left">
                                            <div className="p-3 rounded-xl uppercase bg-success-light text-success-dark">
                                                {workflow?.data?.actions.find((action) => action?.action_type == "manual") ? "hybrid" : "fully automatic"}
                                            </div>
                                        </td>
                                        <td className="px-2 py-4 w-full text-left flex flex-col space-y-2  ">
                                            {assigned_to[0]}
                                            <span className=" text-secondary-text text-md">{assigned_to[1]}</span>
                                        </td>
                                        <td className="px-2 py-4 font-gilroy-regular flex flex-col space-y-4  w-full text-left ">
                                            <div className="grid grid-cols-auto grid-flow-dense gap-4 w-full">
                                                {workflow?.data?.tags?.split(",")?.map((tag) => {
                                                    return <span className="text-secondary-text border-2 border-secondary-text p-2  flex flex-col justify-center items-center rounded-xl" key={tag}>{tag}</span>
                                                })}
                                            </div>

                                        </td>
                                    </tr>)
                                })}


                            </tbody>
                        </table>
                    </div>
                    <div className="flex flex-row justify-end px-3 mb-2">
                        <NucleiPagination items={workflows} startState={[startOffset, setStart]} endState={[endOffset, setEnd]} />
                    </div>

                </div> : <NucleiZeroState onClick={() => {
                    navigate('create');
                }} cta={"Create Workflows"} entity={"workflows"} />}
        </div >
    )
}