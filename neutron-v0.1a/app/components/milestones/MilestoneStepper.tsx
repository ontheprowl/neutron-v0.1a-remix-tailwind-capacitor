import type { Contract, Milestone } from "~/models/contracts";
import { DeliverableType, MilestoneStatus } from "~/models/contracts";
import NeutronIcon from '~/assets/images/icon.svg';
import NeutronGoldIcon from '~/assets/images/iconGold.svg'
import NeutronWhiteIcon from '~/assets/images/iconWhite.svg'
import FlagIcon from '~/assets/images/flag.svg'
import { primaryGradientDark } from "~/utils/neutron-theme-extensions";
import { formatDateToReadableString } from "~/utils/utils";
import FormButton from "../inputs/FormButton";
import Accordion from "../layout/Accordion";
import { motion } from "framer-motion";




export default function MilestoneStepper({ data }: { data?: Contract }) {


    return (
        <motion.div  variants={{ collapsed: { scale: 0.9, opacity:0 }, open: { scale: 1, opacity:1 } }}
        transition={{ duration: 0.1 }} className="flex flex-col w-auto m-3">
            {data?.signedDate != undefined ? <MilestoneStep name={"Contract has been signed!"} subline={formatDateToReadableString(data.signedDate.getSeconds())} /> : <MilestoneStep status={MilestoneStatus.Current} name={"Contract has not been signed!"} subline={"Current Status"} />}

            {data?.milestones?.map((milestone) => {
                milestone = { ...milestone, status: MilestoneStatus.CurrentContractSpecific, type: DeliverableType.Delivery }
                return (
                    <>
                        <div className={`ml-5 w-0.5 h-20 border-solid ${milestone.status == MilestoneStatus.Current || milestone.status == MilestoneStatus.Completed ? primaryGradientDark : 'bg-gray-100'}`}></div>
                        <MilestoneStep milestone={milestone}></MilestoneStep>
                    </>
                )

            })}
            {data?.signedDate != undefined ? <MilestoneStep name={"Contract has been signed!"} subline={formatDateToReadableString(data.signedDate.getSeconds())} /> : <MilestoneStep status={MilestoneStatus.Current} name={"Contract has not been signed!"} subline={"Current Status"} />}

        </motion.div>)
}



function MilestoneStep({ name, subline, status, milestone, type }: { name?: string, subline?: string, status?: MilestoneStatus, type?: string, milestone?: Milestone }) {



    return milestone != undefined ?
        <>

            <div className="flex flex-col space-x-3 ml-3 items-center border-2 border-solid border-accent-dark rounded-xl">
                <div className="flex flex-row self-start m-5 space-x-3">
                    <img src={iconForMilestoneStatus(milestone.status != undefined ? milestone.status : MilestoneStatus.Upcoming)} alt="Neutron Icon" className="h-6 ml-3" />
                    <div className="flex flex-col space-y-1 justify-start">
                        <h1 className="text-purple-400 uppercase prose prose-lg">{milestone.type == DeliverableType.Delivery ? 'Delivery' : 'Advance'}</h1>
                        <h1 className="prose prose-lg text-white uppercase"> {milestone.name}</h1>
                        <h2 className="prose prose-sm text-white ml-1"> {milestone.description}</h2>
                    </div>
                </div>
                <div className="flex flex-row justify-end">
                    <FormButton onClick={() => {

                    }} text="Submit Deliverable"></FormButton>
                </div>
            </div>
        </> : <>

            <div className="flex flex-row space-x-5 items-center">
                <img src={iconForMilestoneStatus(status != undefined ? status : MilestoneStatus.Upcoming)} alt="Neutron Icon" className="h-6 ml-3" />
                <div className="flex flex-col space-y-2 justify-between">
                    <h1> {name}</h1>
                    <h2> {subline}</h2>
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
