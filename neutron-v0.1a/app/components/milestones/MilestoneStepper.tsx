import type { Contract, Milestone } from "~/models/contracts";
import { DeliverableType, MilestoneStatus } from "~/models/contracts";
import NeutronIcon from '~/assets/images/icon.svg';
import CompletedMilestoneIcon from '~/assets/images/CompletedMilestoneIcon.svg';
import CurrentMilestoneIcon from '~/assets/images/CurrentMilestoneIcon.svg';
import FlagIcon from '~/assets/images/flag.svg'
import { primaryGradientDark } from "~/utils/neutron-theme-extensions";
import { formatDateToReadableString, structurePayinPayload } from "~/utils/utils";
import FormButton from "../inputs/FormButton";
import Accordion from "../layout/Accordion";
import NeutronModal from "../layout/NeutronModal";
import { motion } from "framer-motion";
import { useFetcher, useLoaderData, useSubmit } from "@remix-run/react";
import { ContractEvent, NeutronEvent, PaymentEvent } from "~/models/events";
import { useEffect, useState } from "react";
import { stat } from "fs/promises";
import { ContractDataStore } from "~/stores/ContractStores";
import DefaultSpinner from "../layout/DefaultSpinner";
import RequestRevisionForm from "../disputes/RequestRevisionForm";
import RaiseDisputeForm from "../disputes/RaiseDisputeForm";






export default function MilestoneStepper() {

    // let ENV;
    // if (window != undefined) {
    //     ENV = window.ENV;
    // }

    // console.log("ENV IS : " + ENV.NODE_ENV);


    const data = useLoaderData();


    let fetcher = useFetcher();

    const { contract, metadata, ownerUsername, node_env } = data as { contract: Contract, metadata: { [x: string]: any }, ownerUsername: string, node_env: string };

    console.log("Environment value is : " + node_env);
    const [loading, setLoading] = useState<boolean>(true);
    const [targetMilestoneInfo, setTargetMilestoneInfo] = useState<{ milestone: Milestone, milestoneIndex?: string | undefined, nextMilestoneIndex?: string | undefined }>();
    const [approvalModal, setApprovalModal] = useState<boolean>(false);
    const [requestRevisionModal, setRequestRevisionModal] = useState<boolean>(false);
    const [raiseDisputeModal, setRaiseDisputeModal] = useState<boolean>(false);
    const [payinModal, setPayinModal] = useState<boolean>(false);

    const contractEvents: NeutronEvent[] = data.contractEvents;

    useEffect(() => {
        if (contractEvents.length > 0) {
            setLoading(false);
        }
    }, [setLoading, contractEvents])

    const sortedEvents = contractEvents.sort((a, b) => (a?.timestamp - b?.timestamp))
    console.log("Sorted events are : ")
    console.log(sortedEvents)
    const milestones = contract.milestones



    return (
        <>
            <motion.div variants={{ collapsed: { scale: 0.9, opacity: 0 }, open: { scale: 1, opacity: 1 } }}
                transition={{ duration: 0.1 }} className="flex flex-col w-auto m-3 max-h-[500px] overflow-y-scroll">
                {/* {sortedEvents[0].event == ContractEvent.ContractSignedByServiceProvider ? <MilestoneStep name={"Contract has been signed by the service provider!"} status={MilestoneStatus.Completed} /> : <MilestoneStep status={MilestoneStatus.Current} name={"Contract has not been signed by the service provider!"} subline={"Current Status"} />}

            {sortedEvents[1].event == ContractEvent.ContractSignedByBoth ? <MilestoneStep name={"Contract has been signed by both parties!"} status={MilestoneStatus.Completed} /> : <><MilestoneStep status={MilestoneStatus.Current} name={"Contract has not been signed by the service provider!"} subline={"Current Status"} /><MilestoneStep status={MilestoneStatus.Current} name={"Contract has not been signed by the client!"} subline={"Current Status"} /></>} */}

                {loading ? <DefaultSpinner></DefaultSpinner> :

                    generateMilestonesFromEvents(sortedEvents)

                }

            </motion.div>
            {approvalModal && <NeutronModal onConfirm={() => {
                if (targetMilestoneInfo?.milestone) {
                    const form = new FormData();
                    form.append("milestone", JSON.stringify(targetMilestoneInfo.milestone));
                    form.append("contract", JSON.stringify(contract))
                    //TODO : Need to set this flag on the last milestone
                    if (targetMilestoneInfo?.milestone.isLastMilestone) {
                        console.log("LAST MILESTONE IDENTIFIED");
                        form.append("isLastMilestone", Boolean(true).toString());
                    }
                    else {
                        form.append("nextMilestoneIndex", JSON.stringify(targetMilestoneInfo?.nextMilestoneIndex));
                    }

                    fetcher.submit(form, { method: "post", action: `${ownerUsername}/approve/${contract.id}`, encType: 'multipart/form-data' })
                }

            }} toggleModalFunction={setApprovalModal} heading={<h1 className="text-black"> You are about to approve a deliverable</h1>} body={<p className="text-black">On approval, this milestone will be marked complete. <br></br><span className="text-red-500 mt-3"> Warning: This operation cannot be undone</span> </p>}></NeutronModal>}
            {requestRevisionModal && <NeutronModal toggleModalFunction={setRequestRevisionModal} heading={<p className={`${contract.revisions && contract.revisions > 0 ? 'text-black' : 'text-red'} font-gilroy-black`}> {contract.revisions && contract.revisions > 0 ?
                <div>
                    <span>You are about to request a revision. </span>
                    <br></br>
                    <br></br>
                    <span>After this revision request, you will have {contract.revisions - 1} revisions that you can request</span>
                </div> : `You can not request any/any further revisions for this contract.`}</p>} body={<div className="text-black" > {contract.revisions && contract.revisions > 0 ? <RequestRevisionForm milestone={targetMilestoneInfo?.milestone} milestoneIndex={targetMilestoneInfo?.milestoneIndex}></RequestRevisionForm> : <span className="text-red-600"> If you still feel the quality of work needs to be addressed, please raise a dispute under the Quality of Work category</span>}</div >}></NeutronModal >}
            {raiseDisputeModal && <NeutronModal toggleModalFunction={setRaiseDisputeModal} heading={
                <div>
                    <span className=" break-normal">You are about to raise a dispute for this contract. </span>
                    <br></br>
                    <span className="text-red-700 break-normal mt-2 text-[14px] leading-tight"> Please only raise a dispute in case revisions can no longer address your concerns.</span>
                </div>} body={
                    <RaiseDisputeForm milestone={targetMilestoneInfo?.milestone} milestoneIndex={targetMilestoneInfo?.milestoneIndex} />
                }></NeutronModal>}
            {
                payinModal && <NeutronModal onConfirm={() => {
                    const payload = structurePayinPayload(contract, ownerUsername, metadata, node_env);
                    console.dir(payload);
                    const formData = new FormData();
                    formData.append("payload", JSON.stringify(payload))
                    fetcher.submit(formData, { method: 'post', action: `${ownerUsername}/handlers/payment` })
                }} toggleModalFunction={setPayinModal} heading={<p> You will be paying in {contract.contractValue} for this contract </p>} body={<p className="text-black">Are you sure you want to proceed? </p>}></NeutronModal>
            }
        </>)




    function MilestoneStep({ name, subline, index, status, milestone, nextMilestoneIndex, type, submit, payment, approve, payout }: { name?: string, subline?: string, nextMilestoneIndex?: string, submit?: boolean, approve?: boolean, payment?: boolean, status?: MilestoneStatus, index?: confirmation_number, type?: string, milestone?: Milestone, payout?: boolean }) {

        const data = useLoaderData();


        //Temporary state to keep track of payout trigger
        const payoutTriggered = ContractDataStore.useState(s => s.payoutTriggered)

        const { contract, metadata, ownerUsername } = data;


        console.dir(metadata)


        const id = crypto.randomUUID();
        console.dir(milestone)

        return milestone != undefined ?
            <>

                <div className="flex flex-col space-x-3 ml-3 items-center border-2 border-solid border-accent-dark rounded-xl">
                    <div className="flex flex-col self-start m-5 space-x-3 space-y-3">
                        <div className="flex flex-row items-center space-y-1 space-x-3 justify-start">
                            <img src={iconForMilestoneStatus(milestone.status != undefined ? milestone.status : MilestoneStatus.Upcoming)} alt="Neutron Icon" className="h-6 ml-3" />
                            <h1 className="prose text-purple-400 font-gilroy-medium prose-lg  uppercase text-[16px]"> {milestone.name}</h1>
                        </div>
                        <h2 className="prose prose-sm break-all text-white ml-1 font-gilroy-regular text-[14px]"> {milestone.description}</h2>

                    </div>
                    {approve && metadata.email == contract.clientEmail ?
                        <div className="flex flex-col justify-start space-y-3 p-3">
                            <FormButton onClick={() => {
                                console.log("MILESTONE INDEX FOR APPROVAL :" + nextMilestoneIndex)
                                console.dir("MILESTONE GOING TO APPROVAL ACTION :")
                                console.dir(milestone);
                                setTargetMilestoneInfo({ milestone: milestone, nextMilestoneIndex: nextMilestoneIndex + 1 });
                                setApprovalModal(true);

                            }} text="Approve Deliverable"></FormButton>
                            <FormButton text="Request Revision" onClick={() => {
                                setTargetMilestoneInfo({ milestone: milestone, milestoneIndex: Number.parseInt(nextMilestoneIndex) });
                                setRequestRevisionModal(true);
                            }}></FormButton>
                            <FormButton text="Raise Dispute" onClick={() => {
                                setTargetMilestoneInfo({ milestone: milestone, nextMilestoneIndex: nextMilestoneIndex, milestoneIndex: Number.parseInt(nextMilestoneIndex) });
                                setRaiseDisputeModal(true);
                            }}></FormButton>
                        </div> : <></>
                        // <div className="flex flex-row justify-end">
                        //     <h2 className="prose prose-sm text-white ml-1"> Milestone has been submitted </h2>
                        // </div>
                    }
                    {submit && metadata.email == contract.providerEmail ?
                        <div className="flex flex-row justify-end p-3">
                            {contract.externalDeliverables ?
                                <div>
                                    <FormButton onClick={() => {
                                        const form = new FormData();
                                        form.append("externallyDelivered", 'true');
                                        form.append("milestone", JSON.stringify(milestone));
                                        form.append("milestoneIndex", nextMilestoneIndex)
                                        fetcher.submit(form, { method: "post", encType: 'multipart/form-data' })
                                    }} text=" Mark as Externally Submitted " />
                                </div> :
                                <>
                                    <FormButton onClick={() => {
                                        const deliverableInput = document.getElementById("deliverable-input" + id)
                                        deliverableInput?.click();
                                    }} text="Submit Deliverable"></FormButton>
                                    <input id={"deliverable-input" + id} onChange={(e) => {
                                        if (e?.currentTarget?.files) {
                                            const file = e.currentTarget.files[0];

                                            const form = new FormData();
                                            form.append("deliverableFile", file);
                                            form.append("milestone", JSON.stringify(milestone));
                                            form.append("milestoneIndex", nextMilestoneIndex)
                                            fetcher.submit(form, { method: "post", encType: 'multipart/form-data' })
                                        }


                                    }} type="file" className="hidden" />
                                </>}

                        </div> : <></>
                        // <div className="flex flex-row justify-end">
                        //     <h2 className="prose prose-sm text-white ml-1"> Milestone has been submitted </h2>
                        // </div>
                    }
                    {payment && metadata.email == contract.clientEmail ? <div className="flex flex-row justify-end p-3">
                        <FormButton onClick={() => {
                            setPayinModal(true);
                        }} text="Pay In "></FormButton>
                    </div> : <div className="flex flex-row justify-end">
                        <h2 className="prose prose-sm text-white ml-1"> </h2>
                    </div>}
                </div>
            </> : <>

                <div className="flex flex-row space-x-5 mb-6
             items-center">
                    <img src={iconForMilestoneStatus(status != undefined ? status : MilestoneStatus.Upcoming)} alt="Neutron Icon" className="h-10 ml-3" />
                    <div className="flex flex-col space-y-0  justify-between font-gilroy-medium">
                        <h1 className="prose prose-lg text-white text-[16px]"> {name}</h1>
                        <h2 className="prose prose-sm text-white text-[12px] font-gilroy-regular"> {subline}</h2>
                    </div>
                </div>
            </>
    }


    function iconForMilestoneStatus(status?: MilestoneStatus): string | undefined {
        switch (status) {
            case MilestoneStatus.Current:
                return CurrentMilestoneIcon
            case MilestoneStatus.Completed:
                return CompletedMilestoneIcon
            case MilestoneStatus.Upcoming:
                return CurrentMilestoneIcon
            case MilestoneStatus.CurrentContractSpecific:
                return FlagIcon
        }
    }

    function generateStepForEvent(event: NeutronEvent, variant = MilestoneStatus.Completed, eventIndex: number): JSX.Element {

        let milestone = event?.payload?.data.queuedMilestone;
        let nextMilestoneIndex = event?.payload?.data.nextMilestoneIndex;
        console.log("INDEX IN THE STEP EVENT  : " + eventIndex);

        switch (event?.event) {
            case ContractEvent.ContractPublished:

                return <MilestoneStep key={event.timestamp} index={eventIndex} status={variant} name={variant == MilestoneStatus.Completed ? `Contract has been signed by ${contract.providerName}` : `Contract has not been signed by ${contract.providerName}`} subline={variant == MilestoneStatus.Completed ? formatDateToReadableString(event.timestamp, false, true) : 'Current Status'} />
            case ContractEvent.ContractPendingSignByClient:

                return <MilestoneStep key={event.timestamp} index={eventIndex} status={variant} name={`Contract is waiting for ${contract.clientName} to sign it`} subline={variant == MilestoneStatus.Completed ? formatDateToReadableString(event.timestamp, false, true) : 'Current Status'} />
            case ContractEvent.ContractSignedByBoth:
                return <MilestoneStep key={event.timestamp} index={eventIndex} status={variant} name={variant == MilestoneStatus.Completed ? "Contract has been signed by both parties" : "Contract has not been signed by the client"} subline={variant == MilestoneStatus.Completed ? formatDateToReadableString(event.timestamp, false, true) : 'Current Status'} />
            case ContractEvent.ContractPayinRequested:
                return (
                    <div key={event.timestamp}>
                        <MilestoneStep index={eventIndex} milestone={variant == MilestoneStatus.Completed ? undefined : { name: "PAY IN", description: "Payin pending from client ..." }} name={variant == MilestoneStatus.Completed ? "Payment request has been acknowledged" : "Payin pending from client"} subline={variant == MilestoneStatus.Completed ? formatDateToReadableString(event.timestamp, false, true) : 'Current Status'} status={variant} payment ></MilestoneStep>
                    </div >)
            case ContractEvent.ContractPayinCompleted:
                return <MilestoneStep index={eventIndex} key={event.timestamp} status={variant} name={variant == MilestoneStatus.Completed ? `Payin to Neutron of ${contract.contractValue} towards this contract has been received` : 'Payin not received for this contract yet'} subline={variant == MilestoneStatus.Completed ? formatDateToReadableString(event.timestamp, false, true) : 'Current Status'} />;
            case ContractEvent.ContractAdvancePending:
                return (
                    <div key={event.timestamp}>
                        <MilestoneStep index={eventIndex} status={variant} milestone={variant == MilestoneStatus.Completed ? undefined : milestone} nextMilestoneIndex={nextMilestoneIndex} name={variant == MilestoneStatus.Completed ? `An advance of ₹${milestone.value} is being processed for this contract  ` : ``} subline={variant == MilestoneStatus.Completed ? formatDateToReadableString(event.timestamp, false, true) : 'Current Status'} ></MilestoneStep>
                    </div>)

            case ContractEvent.ContractAdvancePayoutCompleted:
                return (
                    <div key={event.timestamp}>
                        <MilestoneStep index={eventIndex} status={variant} nextMilestoneIndex={nextMilestoneIndex} name={`The advance has been paid for this contract `} subline={variant == MilestoneStatus.Completed ? formatDateToReadableString(event.timestamp, false, true) : 'Current Status'} submit ></MilestoneStep>
                    </div>)


            case ContractEvent.ContractMilestonePending:

                console.dir(milestone)
                return (
                    <div>
                        <MilestoneStep index={eventIndex} status={variant} milestone={variant == MilestoneStatus.Completed ? undefined : milestone} nextMilestoneIndex={nextMilestoneIndex} name={variant == MilestoneStatus.Completed ? `Deliverable submitted for milestone ${milestone.name}` : ""} subline={variant == MilestoneStatus.Completed ? formatDateToReadableString(event.timestamp, false, true) : 'Current Status'} submit ></MilestoneStep>
                    </div>)
            case ContractEvent.ContractMilestoneSubmitted:
                const submittedMilestone = event?.payload?.data.milestone;
                return (
                    <div>
                        <MilestoneStep index={eventIndex} status={variant} milestone={variant == MilestoneStatus.Completed ? undefined : submittedMilestone} nextMilestoneIndex={nextMilestoneIndex} name={variant == MilestoneStatus.Completed ? `The client has reviewed the submitted deliverable` : "else"} subline={variant == MilestoneStatus.Completed ? formatDateToReadableString(event.timestamp, false, true) : 'Current Status'} status={variant} approve ></MilestoneStep>
                    </div>)
            case ContractEvent.ContractMilestoneInFeedback:
                const milestoneToBeRevised = event?.payload?.data.milestone;
                const milestoneIndex = event?.payload?.data.milestoneIndex;
                const revision = event?.payload?.data.revision;
                return (
                    <div>
                        <MilestoneStep index={eventIndex} status={variant} milestone={variant == MilestoneStatus.Completed ? undefined : { ...milestoneToBeRevised, name: "REVISION - " + milestoneToBeRevised.name, description: revision.description }} nextMilestoneIndex={milestoneIndex} name={variant == MilestoneStatus.Completed ? `Revision for milestone ${milestoneIndex} completed` : ""} subline={variant == MilestoneStatus.Completed ? formatDateToReadableString(event.timestamp, false, true) : 'Current Status'} submit ></MilestoneStep>
                    </div>)
            case ContractEvent.ContractMilestoneCompleted:
                const approvedMilestone = event?.payload?.data.milestone;
                return <MilestoneStep index={eventIndex} key={event.event} status={variant} name={`Milestone ${approvedMilestone.name} has been completed`} subline={variant == MilestoneStatus.Completed ? formatDateToReadableString(event.timestamp, false, true) : 'Current Status'} />;
            case ContractEvent.ContractPayoutRequested:
                let payoutAmount = event.payload?.data?.amount;
                return <MilestoneStep index={eventIndex} key={event.event} status={variant} name={variant == MilestoneStatus.Completed ? `Payout of ₹${payoutAmount} has been queued ` : `Payout of ₹${payoutAmount} will be queued shortly `} subline={variant == MilestoneStatus.Completed ? formatDateToReadableString(event.timestamp, false, true) : 'Current Status'} />;

            //TODO: Add contract details to contract payout completed event so that milestone event can be enriched.
            case ContractEvent.ContractPayoutCompleted:
                let paidAmount = event.payload?.data?.amount;
                return <MilestoneStep index={eventIndex} key={event.event} status={variant} name={variant == MilestoneStatus.Completed ? `Payout has been completed ` : `Payout is being processed `} subline={variant == MilestoneStatus.Completed ? formatDateToReadableString(event.timestamp, false, true) : 'Current Status'} />;

            case ContractEvent.ContractCompleted:
                let completedContract = event?.payload?.data;
                return <MilestoneStep index={eventIndex} key={event.event} status={variant} name={`This contract has been completed`} subline={variant == MilestoneStatus.Completed ? formatDateToReadableString(event.timestamp, false, true) : 'Current Status'} />;
            case PaymentEvent.PayoutRequested:
                let payoutRequestedContract = event?.payload?.data;
                return <MilestoneStep index={eventIndex} key={event.event} payout={variant == MilestoneStatus.Current} status={variant} name={variant == MilestoneStatus.Completed ? `Neutron has processed a payout request for contract ${payoutRequestedContract.projectName} ` : `Payout has been requested for contract ${payoutRequestedContract.projectName}`} subline={variant == MilestoneStatus.Completed ? formatDateToReadableString(event.timestamp, false, true) : 'Current Status'} />
            case ContractEvent.ContractClosed:
                return <MilestoneStep index={eventIndex} key={event.event} status={MilestoneStatus.Completed} name={'This contract has been closed'} subline={formatDateToReadableString(event.timestamp, false, true)} />;

        }
        return <MilestoneStep milestone={milestone} status={variant} ></MilestoneStep>

    }

    /** Algorithm:
     *  1)  Loop through events from first to second-last event, as they are all completed.
     *      a) For each event, generate Step
     *  2) Generate 'current' themed step for last event
     *  3) Return array of steps
     */
    function generateMilestonesFromEvents(events: NeutronEvent[]): JSX.Element[] | undefined {

        let milestoneArray: JSX.Element[] = [];
        for (let currentIndex = 0; currentIndex < events.length - 1; currentIndex++) {
            const currentEvent = events[currentIndex]
            console.log(`Event ${currentIndex}`);
            console.dir(currentEvent)
            milestoneArray.push(generateStepForEvent(currentEvent, MilestoneStatus.Completed, currentIndex))
        }
        console.log(`Event ${events.length - 1}`);
        console.dir(events[events.length - 1]);
        milestoneArray.push(generateStepForEvent(events[events.length - 1], MilestoneStatus.Current, events.length - 1))
        // milestoneArray.push(
        //     <div key={key}>
        //         <div className={`ml-5 w-0.5 h-20 border-solid ${milestone.status == MilestoneStatus.Current || milestone.status == MilestoneStatus.Completed ? primaryGradientDark : 'bg-gray-100'}`}></div>
        //         <MilestoneStep milestone={milestone}></MilestoneStep>
        //     </div>
        // )
        return milestoneArray

    }
}





