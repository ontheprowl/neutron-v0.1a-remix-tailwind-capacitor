import type { Contract, Milestone } from "~/models/contracts";
import { DeliverableType, MilestoneStatus } from "~/models/contracts";
import NeutronIcon from '~/assets/images/icon.svg';
import NeutronGoldIcon from '~/assets/images/iconGold.svg'
import NeutronWhiteIcon from '~/assets/images/iconWhite.svg'
import FlagIcon from '~/assets/images/flag.svg'
import { primaryGradientDark } from "~/utils/neutron-theme-extensions";
import { formatDateToReadableString, structurePayinPayload } from "~/utils/utils";
import FormButton from "../inputs/FormButton";
import Accordion from "../layout/Accordion";
import { motion } from "framer-motion";
import { useFetcher, useLoaderData, useSubmit } from "@remix-run/react";
import { ContractEvent, NeutronEvent, PaymentEvent } from "~/models/events";
import { useEffect, useState } from "react";
import { stat } from "fs/promises";
import { ContractDataStore } from "~/stores/ContractStores";
import DefaultSpinner from "../layout/DefaultSpinner";






export default function MilestoneStepper() {



    const data = useLoaderData();
    console.log(data)

    const { contract, metadata } = data;
    const [loading, setLoading] = useState<boolean>(true);
    const contractEvents: NeutronEvent[] = data.contractEvents;

    useEffect(() => {
        if (contractEvents.length > 0) {
            setLoading(false);
        }
    }, [setLoading, contractEvents])

    const sortedEvents = contractEvents.sort((a, b) => (a.event < b.event ? 1 : 0))
    const milestones = contract.milestones



    return (
        <motion.div variants={{ collapsed: { scale: 0.9, opacity: 0 }, open: { scale: 1, opacity: 1 } }}
            transition={{ duration: 0.1 }} className="flex flex-col w-auto m-3">
            {/* {sortedEvents[0].event == ContractEvent.ContractSignedByServiceProvider ? <MilestoneStep name={"Contract has been signed by the service provider!"} status={MilestoneStatus.Completed} /> : <MilestoneStep status={MilestoneStatus.Current} name={"Contract has not been signed by the service provider!"} subline={"Current Status"} />}

            {sortedEvents[1].event == ContractEvent.ContractSignedByBoth ? <MilestoneStep name={"Contract has been signed by both parties!"} status={MilestoneStatus.Completed} /> : <><MilestoneStep status={MilestoneStatus.Current} name={"Contract has not been signed by the service provider!"} subline={"Current Status"} /><MilestoneStep status={MilestoneStatus.Current} name={"Contract has not been signed by the client!"} subline={"Current Status"} /></>} */}

            {loading ? <DefaultSpinner></DefaultSpinner> :

                generateMilestonesFromEvents(sortedEvents)

            }

        </motion.div>)
}



function MilestoneStep({ name, subline, status, milestone, nextMilestoneIndex, type, submit, payment, approve, payout }: { name?: string, subline?: string, nextMilestoneIndex?: string, submit?: boolean, approve?: boolean, payment?: boolean, status?: MilestoneStatus, type?: string, milestone?: Milestone, payout?: boolean }) {

    const data = useLoaderData();
    console.log(data)

    //Temporary state to keep track of payout trigger
    const payoutTriggered = ContractDataStore.useState(s => s.payoutTriggered)

    const { contract, metadata, ownerUsername } = data;
    console.log("THE METADATA AT MILESTONE STEP");
    console.dir(metadata)

    let fetcher = useFetcher()

    const id = crypto.randomUUID()

    /**
     * THIS IS A SIMULATION OF THE PAYOUT EVENT TRIGGER PROCESS. IDEALLY, THIS SHOULD TAKE PLACE AS A SERVERLESS FUNCTION TRIGGERED ON RECEIPT OF THE 'PAYOUT REQUESTED' EVENT 
     * TODO: MOVE THIS TRIGGER TO CLOUD FUNCTIONS  
    */

    if (payout && metadata.email == contract.clientEmail && !payoutTriggered) {
        console.log()
        const payload = {
            beneId: metadata.id,
            name: metadata.displayName,
            email: contract.clientEmail,
            phone: metadata.phoneNumber,
            bankAccount: metadata.bankAccount,
            ifsc: metadata.ifscCode,
            address1: metadata.address,
            city: metadata.city,
            state: metadata.state,
            pincode: metadata.pincode
        };

        console.log("PAYOUT EVENT HAPPENING")

        setTimeout(() => {
            const form = new FormData();
            form.append('beneficiary', JSON.stringify(payload))
            fetcher.submit(form, { action: `${ownerUsername}/handlers/payout/${contract.id}/${contract.totalValue}`, method: 'post' })
        }, 1000)
        ContractDataStore.update((s) => {
            s.payoutTriggered = true;
        })

    }




    return milestone != undefined ?
        <>

            <div className="flex flex-col space-x-3 ml-3 items-center border-2 border-solid border-accent-dark rounded-xl">
                <div className="flex flex-row self-start m-5 space-x-3">
                    <img src={iconForMilestoneStatus(milestone.status != undefined ? milestone.status : MilestoneStatus.Upcoming)} alt="Neutron Icon" className="h-6 ml-3" />
                    <div className="flex flex-col space-y-1 justify-start">
                        <h1 className="prose text-purple-400  prose-lg  uppercase"> {milestone.name}</h1>
                        <h2 className="prose prose-sm text-white ml-1"> {milestone.description}</h2>
                    </div>
                </div>
                {approve && metadata.email == contract.clientEmail ? <div className="flex flex-row justify-end">
                    <FormButton onClick={() => {
                        const form = new FormData();
                        form.append("milestone", JSON.stringify(milestone));
                        form.append("contract", JSON.stringify(contract))
                        //TODO : Need to set this flag on the last milestone
                        if (milestone.lastMilestone) {
                            form.append("lastMilestone", Boolean(true).toString());
                        }
                        else {
                            form.append("nextMilestoneIndex", JSON.stringify(nextMilestoneIndex));
                        }

                        fetcher.submit(form, { method: "post", action: `${ownerUsername}/approve/${contract.id}`, encType: 'multipart/form-data' })
                    }} text="Approve Deliverable"></FormButton>
                </div> : <></>
                    // <div className="flex flex-row justify-end">
                    //     <h2 className="prose prose-sm text-white ml-1"> Milestone has been submitted </h2>
                    // </div>
                }
                {submit && metadata.email == contract.providerEmail ? <div className="flex flex-row justify-end">
                    <FormButton onClick={() => {
                        const deliverableInput = document.getElementById("deliverable-input" + id)
                        deliverableInput?.click();
                    }} text="Submit Deliverable"></FormButton>
                    <input id={"deliverable-input" + id} onChange={(e) => {
                        if (e?.currentTarget?.files) {
                            const file = e.currentTarget.files[0];
                            console.log(file)
                            const form = new FormData();
                            form.append("deliverableFile", file);
                            form.append("milestone", JSON.stringify(milestone));
                            form.append("nextMilestoneIndex", nextMilestoneIndex)
                            fetcher.submit(form, { method: "post", encType: 'multipart/form-data' })
                        }


                    }} type="file" className="hidden" />
                </div> : <></>
                    // <div className="flex flex-row justify-end">
                    //     <h2 className="prose prose-sm text-white ml-1"> Milestone has been submitted </h2>
                    // </div>
                }
                {payment && metadata.email == contract.clientEmail ? <div className="flex flex-row justify-end">
                    <FormButton onClick={() => {
                        const payload = structurePayinPayload(contract, ownerUsername, metadata);
                        console.dir(payload);
                        const formData = new FormData();
                        formData.append("payload", JSON.stringify(payload))
                        fetcher.submit(formData, { method: 'post', action: `${ownerUsername}/handlers/payment` })
                    }} text="Pay In "></FormButton>
                </div> : <div className="flex flex-row justify-end">
                    <h2 className="prose prose-sm text-white ml-1"> </h2>
                </div>}
            </div>
        </> : <>

            <div className="flex flex-row space-x-5 items-center">
                <img src={iconForMilestoneStatus(status != undefined ? status : MilestoneStatus.Upcoming)} alt="Neutron Icon" className="h-10 ml-3" />
                <div className="flex flex-col space-y-2 justify-between">
                    <h1 className="prose prose-lg text-white"> {name}</h1>
                    <h2 className="prose prose-sm text-white"> {subline}</h2>
                </div>
            </div>
        </>
}


function iconForMilestoneStatus(status?: MilestoneStatus): string | undefined {
    switch (status) {
        case MilestoneStatus.Current:
            return NeutronGoldIcon
        case MilestoneStatus.Completed:
            return NeutronIcon
        case MilestoneStatus.Upcoming:
            return NeutronWhiteIcon
        case MilestoneStatus.CurrentContractSpecific:
            return FlagIcon
    }
}

function generateStepForEvent(event: NeutronEvent, variant = MilestoneStatus.Completed): JSX.Element {
    let milestone = event?.payload?.data.queuedMilestone;
    let nextMilestoneIndex = event?.payload?.data.nextMilestoneIndex;


    switch (event?.event) {
        case ContractEvent.ContractPublished:
            return <MilestoneStep key={event.event} status={variant} name={variant == MilestoneStatus.Completed ? "Contract has been signed by the service provider !" : "Contract has not been signed by the service provider !"} subline={variant == MilestoneStatus.Completed ? event.timestamp : 'Current Status'} />
        case ContractEvent.ContractPendingSignByClient:
            return <MilestoneStep key={event.event} status={variant} name={"Contract is waiting for the client to sign it.."} subline={variant == MilestoneStatus.Completed ? event.timestamp : 'Current Status'} />
        case ContractEvent.ContractSignedByBoth:
            return <MilestoneStep key={event.event} status={variant} name={variant == MilestoneStatus.Completed ? "Contract has been signed by both parties !" : "Contract has not been signed by the client !"} subline={variant == MilestoneStatus.Completed ? event.timestamp : 'Current Status'} />
        case ContractEvent.ContractPayinRequested:
            return (
                <div key={event.event}>
                    <div className={`ml-5 w-0.5 h-20 border-solid ${variant == MilestoneStatus.Current || variant == MilestoneStatus.Completed ? primaryGradientDark : 'bg-gray-100'}`}></div>
                    <MilestoneStep milestone={variant == MilestoneStatus.Completed ? undefined : { name: "PAY IN", description: "Payin pending from client ..." }} name={variant == MilestoneStatus.Completed ? "Payment request has been acknowledged!" : "Payin pending from client ..."} subline={variant == MilestoneStatus.Completed ? event.timestamp : 'Current Status'} status={variant} payment ></MilestoneStep>
                </div >)
        case ContractEvent.ContractPayinCompleted:
            return <MilestoneStep key={event.event} status={variant} name={variant == MilestoneStatus.Completed ? `Payin to Neutron of ₹ ${event.payload?.data.payinAmount} towards this contract has been received!` : 'Payin not received for this contract yet'} subline={variant == MilestoneStatus.Completed ? event.timestamp : 'Current Status'} />;
        case ContractEvent.ContractMilestonePending:

            console.dir(milestone)
            return (
                <div>
                    <div className={`ml-5 w-0.5 h-20 border-solid ${variant == MilestoneStatus.Current || variant == MilestoneStatus.Completed ? primaryGradientDark : 'bg-gray-100'}`}></div>
                    <MilestoneStep milestone={variant == MilestoneStatus.Completed ? undefined : milestone[0]} nextMilestoneIndex={nextMilestoneIndex} name={variant == MilestoneStatus.Completed ? `Milestone submitted for approval ` : "else"} subline={variant == MilestoneStatus.Completed ? event.timestamp : 'Current Status'} submit ></MilestoneStep>
                </div>)
        case ContractEvent.ContractMilestoneSubmitted:
            const submittedMilestone = event?.payload?.data;
            return (
                <div>
                    <div className={`ml-5 w-0.5 h-20 border-solid ${variant == MilestoneStatus.Current || variant == MilestoneStatus.Completed ? primaryGradientDark : 'bg-gray-100'}`}></div>
                    <MilestoneStep milestone={variant == MilestoneStatus.Completed ? undefined : submittedMilestone} nextMilestoneIndex={nextMilestoneIndex} name={variant == MilestoneStatus.Completed ? `Milestone has been approved! ` : "else"} subline={variant == MilestoneStatus.Completed ? event.timestamp : 'Current Status'} status={variant} approve ></MilestoneStep>
                </div>)
        case ContractEvent.ContractMilestoneCompleted:
            const approvedMilestone = event?.payload?.data.milestone;
            return <MilestoneStep key={event.event} status={variant} name={`Milestone ${approvedMilestone.name} has been completed!`} subline={variant == MilestoneStatus.Completed ? event.timestamp : 'Current Status'} />;
        case ContractEvent.ContractCompleted:
            let completedContract = event?.payload?.data;
            return <MilestoneStep key={event.event} status={variant} name={`Contract ${completedContract.projectName} has been completed!`} subline={variant == MilestoneStatus.Completed ? event.timestamp : 'Current Status'} />;
        case PaymentEvent.PayoutRequested:
            let payoutRequestedContract = event?.payload?.data;
            return <MilestoneStep key={event.event} payout={variant == MilestoneStatus.Current} status={variant} name={variant == MilestoneStatus.Completed ? `Neutron has processed a payout request for contract ${payoutRequestedContract.projectName} ` : `Payout has been requested for contract ${payoutRequestedContract.projectName}`} subline={variant == MilestoneStatus.Completed ? event.timestamp : 'Current Status'} />
        case ContractEvent.ContractPayoutCompleted:
            let payoutCompletedContract = event?.payload?.data;

            return <MilestoneStep key={event.event} status={variant} name={`Funds transferred for contract ${payoutCompletedContract.projectName} `} subline={variant == MilestoneStatus.Completed ? event.timestamp : 'Current Status'} />
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
        console.log("Current event is :")
        console.dir(currentEvent)
        milestoneArray.push(generateStepForEvent(currentEvent))
    }
    milestoneArray.push(generateStepForEvent(events[events.length - 1], MilestoneStatus.Current))
    // milestoneArray.push(
    //     <div key={key}>
    //         <div className={`ml-5 w-0.5 h-20 border-solid ${milestone.status == MilestoneStatus.Current || milestone.status == MilestoneStatus.Completed ? primaryGradientDark : 'bg-gray-100'}`}></div>
    //         <MilestoneStep milestone={milestone}></MilestoneStep>
    //     </div>
    // )
    return milestoneArray

}



