import { Link, Outlet, useLocation, useOutletContext, useSubmit } from "@remix-run/react";
import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import DeleteButton from "~/components/inputs/buttons/DeleteButton";
import SaveButton from "~/components/inputs/buttons/SaveButton";
import NucleiDropdownInput from "~/components/inputs/fields/NucleiDropdownInput";
import NucleiTextInput from "~/components/inputs/fields/NucleiTextInput";
import NeutronRadioButton from "~/components/inputs/radios/NeutronRadioButton";
import NeutronRadioGroup from "~/components/inputs/radios/NeutronRadioGroup";
import WorkflowMessageIcon from "~/assets/images/workflowMessageIcon.svg";
import EditButton from "~/components/inputs/buttons/EditButton";
import PlusCircleIcon from "~/assets/images/plusCircleIcon.svg"
import { ActionFunction, redirect } from "@remix-run/server-runtime";
import { requireUser } from "~/session.server";

import { addFirestoreDocFromData, getSingleDoc, setFirestoreDocFromData } from "~/firebase/queries.server";
import NucleiTagsInput from "~/components/inputs/fields/NucleiTagsInput";
import { executeDunningPayloads, getScheduleForActionAndInvoice } from "~/utils/utils.server";
import { EmailPayloadStructure, WhatsappPayloadStructure } from "~/models/dunning";




export const action: ActionFunction = async ({ request, params }) => {

    const session = await requireUser(request);


    console.log("REQUEST RECEIVED");
    const formData = await request.formData();
    const payload = JSON.parse(formData.get("payload"));

    // // **  For invoices that exist already, calculate all trigger conditions ( cron schedules ), filter cron schedules that are after today, then procedurally queue messages right now. 

    const businessData = await getSingleDoc(`businesses/${session?.metadata?.businessID}`);

    const customers = payload?.customers
    const actions = payload?.actions;
    const assigned_to: [name: string, email: string] = payload?.assigned_to?.split(",")

    let dunningPayloads: Array<WhatsappPayloadStructure | EmailPayloadStructure> = [];
    for (const customer of customers) {
        const customersReceivables = customer?.data?.invoices;
        if (customersReceivables) {
            for (const receivable of customersReceivables) {
                for (const action of actions) {
                    if (action?.action_type == "automatic") {
                        const dunningPayload = getScheduleForActionAndInvoice(receivable, { company_name: businessData?.business_name, assigned_to: assigned_to[0], assigned_to_contact: assigned_to[1] }, customer?.data, action);
                        dunningPayloads.push(dunningPayload);
                    }
                }
            }
        }
        console.log("CUSTOMER PAYLOADS GENERATED FOR " + customer?.data?.vendor_name + " > EMAIL : " + customer?.data?.email + ", PHONE : " + customer?.data?.mobile);

    }
    // ? Need to build reactive infrastructure for invoices that are to be added later.

    const dunningCallsResult = executeDunningPayloads(dunningPayloads);

    const workflowCreationRef = await addFirestoreDocFromData(payload, 'workflows/business', session?.metadata?.businessID);

    return null;

}



export default function CreateWorkflowScreen() {


    const { metadata, businessData } = useOutletContext();


    const { pathname } = useLocation();
    const submit = useSubmit();

    const workflowCreationForm = useForm();


    const [currentAction, setCurrentAction] = useState(0)
    const [localActions, setCurrentActions] = useState<Array<{ [x: string]: any }>>([]);
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [customersFilter, setCustomersFilter] = useState('');

    const [tags, setTags] = useState<string[]>([])

    const actions: Array<{ [x: string]: any }> = useWatch({ control: workflowCreationForm.control, name: 'actions' })
    const actionType = useWatch({ control: workflowCreationForm.control, name: `actions.${currentAction}.action_type` })


    useEffect(() => {
        if (actionType == "manual") {
            workflowCreationForm.unregister(`actions.${currentAction}.template`);
        } else {
            workflowCreationForm.unregister(`actions.${currentAction}.assigned_to`);
        }
    }, [actionType])

    return (
        <FormProvider {...workflowCreationForm}>
            <form onSubmit={workflowCreationForm.handleSubmit((data) => {
                data['customers'] = data['customers'].filter((customer: { id: string | boolean }) => {
                    return (typeof customer.id == 'string')
                });
                data['actions'] = localActions
                const formData = new FormData();

                // ? Is there a better solution than sending invoices to be dunned from client to server?

                for (const customer of data['customers']) {
                    const customerDetails = businessData?.customers?.find((customerData) => { return (customerData?.contact_id == customer?.id) });
                    customer['data'] = customerDetails;
                }

                formData.append('payload', JSON.stringify(data))
                formData.append('customersData', JSON.stringify(data));
                submit(formData, { method: "post" })
            })} className=" h-full flex flex-col space-y-4">
                <div className="flex flex-row justify-between">
                    <div id="page_title" className="flex flex-col">
                        <h1 className="text-lg">Create Workflow</h1>
                        <span className="text-neutral-base text-sm font-gilroy-medium"> Home - Workflows - Create Workflow</span>
                    </div>
                    <div className="flex flex-row space-x-4">
                        <SaveButton submit />
                        <DeleteButton />
                    </div>
                </div>

                <div id="workflow_details" className=" h-auto flex flex-col p-6 bg-white shadow-lg rounded-xl">
                    <h1 className="text-lg">Workflow Details</h1>
                    <div className="flex flex-row space-x-4 mt-4">
                        <NucleiTextInput name={"name"} label={"Workflow Name"} placeholder={"E.g: General Workflow"} ></NucleiTextInput>
                        <NucleiDropdownInput name={"assigned_to"} label={"Person In Charge"} placeholder={""}>
                            {businessData?.team?.map((member) => {
                                return (<option key={member?.email} value={[member?.name, member?.email]}> {member?.name}</option>)
                            })}
                        </NucleiDropdownInput>
                    </div>

                    <NucleiTextInput name={"tags"} label={"Tags"} placeholder={"E.g: Pune Customers, High Priority"} />
                    {/* <div className="flex flex-row space-x-4 mt-4">
                        <NucleiTagsInput name={"tags"} label={"Tags"} placeholder={"E.g: High Priority, Pune Customers, etc"} tagsState={[tags,setTags]}/>
                    </div> */}

                </div>

                <div id="workflow_settings" className="h-auto flex p-6 flex-col space-y-4 bg-white shadow-lg rounded-xl">
                    <h1 className="text-lg">Workflow Details</h1>
                    <div className="flex flex-row space-x-6 mt-4">
                        <NucleiDropdownInput name={`actions.${currentAction}.trigger`} label={"Trigger"} placeholder={"The action's trigger condition"} >
                            <option value={"After Issue Date"}>After Issue Date</option>
                            <option value={"Before Due Date"}>Before Due Date</option>
                            <option value={"After Due Date"}>After Due Date</option>
                        </NucleiDropdownInput>
                        <NucleiTextInput name={`actions.${currentAction}.days`} label="Days" placeholder="E.g: 20 Days" />
                        <NeutronRadioGroup>
                            <NeutronRadioButton noIcon name={`actions.${currentAction}.action_type`} value={"automatic"} heading={"Automatic"} no={1} />
                            <NeutronRadioButton noIcon name={`actions.${currentAction}.action_type`} value={"manual"} heading={"Manual"} no={2} />
                        </NeutronRadioGroup>
                    </div>
                    <div className="flex flex-row space-x-4 mt-4">
                        <NucleiDropdownInput name={`actions.${currentAction}.action`} label={"Action"} placeholder={"Email / Whatsapp"} >
                            {actionType == "manual" ?
                                <>
                                    <option value={"Manual Visit"}>Manual Visit</option>
                                    <option value={"Manual Contact"}>Manual Contact</option>
                                </> :
                                <>
                                    <option value={"Email"}>Email</option>
                                    <option value={"Whatsapp"}>Whatsapp</option>
                                </>}
                        </NucleiDropdownInput>
                        {actionType == "automatic" &&
                            <NucleiDropdownInput name={`actions.${currentAction}.template`} label={"Template"} placeholder={"Which template do you wish to send out in your reminder?"} >
                                <option value={"Early Reminder"}>Early Reminder</option>
                                <option value={"On Due Date"}>On Due Date</option>
                                <option value={"Overdue Reminder"}>Overdue Reminder</option>
                            </NucleiDropdownInput>}
                        {actionType == "manual" && <NucleiDropdownInput name={`actions.${currentAction}.assigned_to`} label={"Person In Charge"} placeholder={"Who are you assigning this task to?"} >
                            {businessData?.team?.map((member) => {
                                return (<option key={member?.email} value={member?.email}>{member?.name}</option>)
                            })}
                        </NucleiDropdownInput>}
                        <NucleiTextInput name={`actions.${currentAction}.time`} type="time" label={"Time"} placeholder={"When do you want to schedule this action?"} />
                    </div>
                    <button type="button" className="bg-primary-base flex flex-row space-x-2 justify-center transition-all hover:bg-primary-dark active:bg-primary-dark focus:bg-primary-dark max-w-fit items-center  text-white p-3 rounded-lg" onClick={() => {
                        localActions[currentAction] = actions[currentAction];
                        workflowCreationForm.resetField(`actions.${currentAction}.action`);
                        workflowCreationForm.resetField(`actions.${currentAction}.template`);
                        workflowCreationForm.resetField(`actions.${currentAction}.time`);
                        workflowCreationForm.resetField(`actions.${currentAction}.trigger`);
                        workflowCreationForm.resetField(`actions.${currentAction}.days`);
                        setEditIndex(null);
                        setCurrentAction(currentAction + 1);
                    }}>
                        <img src={PlusCircleIcon} alt="plus_circle" />
                        <span>{editIndex != null ? 'Edit Actions' : 'Add Actions'}</span>
                    </button>
                    <ul className="flex flex-col space-y-4 h-[300px] overflow-y-scroll">
                        {localActions?.map((action, index) => {
                            return (
                                <li className={`transition-all border-2 ${editIndex == index ? ' border-dashed border-primary-dark bg-primary-light' : 'border-neutral-light'}  p-6 rounded-lg w-full`} key={index}>
                                    <div className="flex flex-row items-center justify-between">
                                        <div className="flex flex-row w-1/4 items-center space-x-4">
                                            <img src={WorkflowMessageIcon} alt="workflow_message_icon"></img>
                                            <div className="flex flex-col space-y-4">
                                                <span className="font-gilroy-bold text-lg">{action?.action}</span>
                                                <span className="font-gilroy-medium text-base">{action?.days} days {action?.trigger}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-row w-1/4 items-center space-x-4">
                                            <span className="p-3 rounded-xl bg-success-light uppercase text-success-dark">{action?.action_type}</span>
                                        </div>
                                        <div className="flex flex-row w-1/4 items-center space-x-4">
                                            <div className="flex flex-col space-y-4">
                                                <span className="font-gilroy-bold text-lg">{action?.action_type == "automatic" ? `Template - ${action?.template}` : `Assigned To - ${action?.assigned_to}`}</span>
                                                <span className="font-gilroy-medium text-base">This action is to be executed at {action?.time}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-row w-1/4 items-center justify-end space-x-4">
                                            <EditButton onClick={() => {
                                                const actionToBeEdited = localActions[index]
                                                workflowCreationForm.setValue(`actions.${index}.action`, actionToBeEdited?.action);
                                                workflowCreationForm.setValue(`actions.${index}.template`, actionToBeEdited?.template);
                                                workflowCreationForm.setValue(`actions.${index}.time`, actionToBeEdited?.time);
                                                workflowCreationForm.setValue(`actions.${index}.action_type`, actionToBeEdited?.action_type);
                                                workflowCreationForm.setValue(`actions.${index}.assigned_to`, actionToBeEdited?.assigned_to);
                                                workflowCreationForm.setValue(`actions.${index}.trigger`, actionToBeEdited?.trigger);
                                                workflowCreationForm.setValue(`actions.${index}.days`, actionToBeEdited?.days);
                                                setCurrentAction(index);
                                                setEditIndex(index);
                                            }} />
                                            <DeleteButton onClick={() => {
                                                setCurrentAction(index)
                                                delete localActions[index]
                                            }} />
                                        </div>
                                    </div>
                                </li>)
                        })}
                    </ul>

                </div>
                <div id="add_customers" className="h-auto flex flex-col p-6 bg-white shadow-lg rounded-xl">
                    <h1 className="text-lg">Choose Customers</h1>
                    <div className="flex flex-row bg-[#f5f5f5]  h-10 space-x-4 p-2 mt-4 w-1/2  rounded-lg">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.5 17.5L14.5834 14.5833M16.6667 9.58333C16.6667 13.4954 13.4954 16.6667 9.58333 16.6667C5.67132 16.6667 2.5 13.4954 2.5 9.58333C2.5 5.67132 5.67132 2.5 9.58333 2.5C13.4954 2.5 16.6667 5.67132 16.6667 9.58333Z" stroke="#6F6E6E" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>

                        <input type="text" onChange={(e) => {
                            setCustomersFilter(e.currentTarget.value);
                        }} placeholder="Search for customers" className="w-full bg-transparent text-neutral-dark placeholder:text-neutral-dark border-transparent focus:border-transparent outline-none focus:ring-0 ring-0 " />

                    </div>
                    <div className="grid grid-flow-dense auto-rows-min grid-cols-3  p-3 mt-4 h-[400px] overflow-y-scroll">
                        {businessData?.customers.filter((customer) => (customer?.vendor_name.includes(customersFilter))).map((customer, index) => {
                            return (
                                <div className="flex flex-row items-center space-x-4" key={index}>
                                    <input {...workflowCreationForm.register(`customers.${index}.id`)} value={customer?.contact_id} className="text-primary-base fill-primary-base accent-primary-base rounded-full outline-none" type="checkbox" placeholder="" />
                                    <span className="font-gilroy-medium text-lg">{customer?.vendor_name}</span>
                                </div>)
                        })}
                    </div>

                </div>


            </form>
        </FormProvider >)

}

