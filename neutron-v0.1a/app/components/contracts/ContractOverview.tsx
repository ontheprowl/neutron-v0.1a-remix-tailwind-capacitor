import NeutronIcon from '~/assets/images/icon.svg';
import IconPDF from '~/assets/images/PDF.png';
import IconMedia from '~/assets/images/Media.png';
import IconZIP from '~/assets/images/ZIP.png';
import ProgressLine from "~/assets/images/progressLineActive.svg"
import GradientSeparator from '~/assets/images/gradientLineSeparator.svg'
import { ContractDataStore } from '~/stores/ContractStores';
import { Contract, DeliverableFormat } from '~/models/contracts';
import { primaryGradientDark } from '~/utils/neutron-theme-extensions';
import MilestoneStepper from '../milestones/MilestoneStepper';
import { NotSubmittedStatus, StatusGenerator } from '../layout/Statuses';
import Accordion from '../layout/Accordion';
import { useState } from 'react';
import ExpandArrowButton from '../inputs/ExpandArrowButton';
import { Link, useLoaderData } from '@remix-run/react';
import { NeutronEvent } from '~/models/events';
import MobileNavbarPadding from '../layout/MobileNavbarPadding';
import DisputesChatComponent from '../disputes/DisputesChatComponent';


function generateDeliverables(milestones: { [key: string]: any }) {

    let deliverablesArray = []
    for (const [key, value] of Object.entries(milestones)) {
        const deliverable = { ...value }
        if (deliverable.name == 'Advance') continue
        if (key == "workMilestones") {
            for (const [milestoneNumber, milestone] of Object.entries(value)) {
                deliverablesArray.push(
                    <a href={milestone.submissionPath} key={milestone.name}>
                        <div className="flex flex-row m-5 space-x-2 w-auto items-center justify-between">
                            <img src={iconForDeliverableType(Number(milestone.submissionFormat))}
                                className="mr-3 h-7 " alt="progressLineActive">
                            </img>
                            <h2>{milestone.name}</h2>
                            <p>{milestone.description}</p>
                            {milestone?.status ? StatusGenerator(milestone.status) : <NotSubmittedStatus></NotSubmittedStatus>}
                        </div>
                    </a>
                    // <a key={deliverable.name} href={deliverable.submissionPath ? deliverable.submissionPath : "#"}>
                    //     <div className="flex flex-row m-5 space-x-2 w-auto items-center justify-between">
                    //         <img src={iconForDeliverableType(Number(deliverable.submissionFormat))}
                    //             className="mr-3 h-7 " alt="progressLineActive">
                    //         </img>
                    //         <h2>{deliverable.name}</h2>
                    //         <p>{deliverable.description}</p>
                    //         <NotSubmittedStatus></NotSubmittedStatus>
                    //     </div>
                    // </a>


                )
            }
        }

    }
    return deliverablesArray
}

export default function ContractOverview() {

    const loaderData = useLoaderData();
    console.log("LOADERDATA AT OVERVIEW")
    console.dir(loaderData)
    let data = ContractDataStore.useState();
    let events;

    const [expanded, setExpanded] = useState(false);
    if (loaderData) {
        data = loaderData.contract;
        events = loaderData.contractEvents;

    }


    const sidePanelStages = [<MilestoneStepper key={0} ></MilestoneStepper>, <DisputesChatComponent from={} key={1} ></DisputesChatComponent>]


    const milestones = data.milestones



    return <>
        <div className="flex flex-col w-auto h-auto justify-between">
            {/*
Escrow section
*/}
            <div className="hidden sm:flex sm:flex-row h-14 space-x-5 mb-10">
                <div className={`flex flex-row ${primaryGradientDark} w-72 h-full rounded-lg justify-between p-3 items-center`}>
                    <h2 className='prose prose-md text-white'>Total Funds</h2>
                    <h1 className="prose prose-lg text-white text-right"> {data.totalValue}</h1>
                </div>
                <div className={`flex flex-row bg-bg-primary-dark border-2 border-solid border-accent-dark w-72 h-full rounded-lg justify-between p-3 items-center`}>
                    <h2 className='prose prose-md text-white'>Released Funds</h2>
                    <h1 className="prose prose-lg text-white text-right"> {data.releasedFunds}</h1>
                </div>
                <div className={`flex flex-row bg-bg-primary-dark border-2 border-solid border-accent-dark w-72 h-full rounded-lg justify-between p-3 items-center`}>
                    <h2 className='prose prose-md text-white'>Milestones</h2>
                    <h1 className="prose prose-lg text-white text-right"> <span className="text-purple-400">2</span>/4</h1>
                </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row w-auto h-full">
                <div id="contract-details" className="sm:flex sm:flex-col basis-2/3 w-auto h-auto justify-start rounded-lg bg-bg-primary-dark text-white">
                    <div className="flex flex-row mb-5 sm:justify-start justify-center">
                        <h2>Project Details</h2>
                    </div>
                    <div className="w-full break-all sm:h-72 p-3  rounded-lg sm:border-2 sm:border-solid border-gray-400 mb-10">
                        {data.description}
                    </div>

                    <div className="flex flex-row sm:justify-start justify-center mb-5">
                        <h2>Deliverables</h2>
                    </div>
                    <div className="hidden sm:flex sm:flex-col sm:space-y-2 sm:space-x-0 w-full h-auto justify-between border-white border-2 border-solid rounded-lg bg-bg-primary-dark text-white">

                        {generateDeliverables(milestones)}
                    </div>
                    <div className="flex flex-col sm:hidden w-full h-auto justify-between border-white rounded-lg bg-bg-primary-dark text-white">

                        {generateDeliverables(milestones)}
                    </div>
                </div>
                <div id="contract-milestones" className="flex flex-col sm:basis-1/3 sm:w-auto w-full mb-5 max-h-[600px] overflow-y-scroll sm:m-5 h-full justify-between bg-bg-secondary-dark border-accent-dark border-2 border-solid rounded-xl  text-white">

                    <Accordion label={<div onClick={() => setExpanded(!expanded)}
                        className="flex flex-row m-5 justify-between">
                        <h2 className='prose prose-lg text-purple-500'>Current Status</h2>
                        <p className=" prose prose-sm text-white">{data.status}</p>
                        <ExpandArrowButton expanded={expanded}></ExpandArrowButton>
                    </div>} expanded={expanded} setExpanded={setExpanded} content={
                        <MilestoneStepper ></MilestoneStepper>
                    }></Accordion>
                </div>
            </div>
            <MobileNavbarPadding size="large"></MobileNavbarPadding>
        </div>
        {/*
Milestones section
*/}
        {/*
Deliverables section
*/}

    </>

}

function iconForDeliverableType(format: DeliverableFormat): string | undefined {
    console.dir(`FORMAT IS : ${format}`)
    switch (format) {

        case DeliverableFormat.JPEG || DeliverableFormat.MP4:
            return IconMedia
        case DeliverableFormat.PDF:
            console.log('issa pdf')
            console.log(IconPDF)
            return IconPDF
        case DeliverableFormat.ZIP:
            return IconZIP

    }
}
