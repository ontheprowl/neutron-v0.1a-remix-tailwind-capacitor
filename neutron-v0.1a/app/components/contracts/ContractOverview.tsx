

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
import { NotSubmittedStatus } from '../layout/Statuses';
import Accordion from '../layout/Accordion';
import { useState } from 'react';
import ExpandArrowButton from '../inputs/ExpandArrowButton';



export default function ContractOverview({ loaderData }: { loaderData?: Contract }) {

    let data = ContractDataStore.useState();

    const [expanded, setExpanded] = useState(false);
    if (loaderData) {
        data = loaderData;
    }
    console.log('data for the contract overview is : ');
    console.log(data)
    return <>
        <div className="flex flex-col w-auto h-auto justify-between">
            {/*
Escrow section
*/}
            <div className="hidden sm:flex sm:flex-row h-14 space-x-5 mb-10">
                <div className={`flex flex-row ${primaryGradientDark} w-72 h-full rounded-lg justify-between p-3 items-center`}>
                    <h2 className='prose prose-md text-white'>Total Funds</h2>
                    <h1 className="prose prose-lg text-white text-right"> $3402.00</h1>
                </div>
                <div className={`flex flex-row bg-bg-primary-dark border-2 border-solid border-accent-dark w-72 h-full rounded-lg justify-between p-3 items-center`}>
                    <h2 className='prose prose-md text-white'>Released Funds</h2>
                    <h1 className="prose prose-lg text-white text-right"> $2000.00</h1>
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
                    <div className="w-full sm:h-72 p-3  rounded-lg sm:border-2 sm:border-solid border-gray-400 mb-10">
                        {data.description}
                    </div>

                    <div className="flex flex-row sm:justify-start justify-center mb-5">
                        <h2>Deliverables</h2>
                    </div>
                    <div className="hidden sm:flex sm:flex-col w-full h-auto justify-between border-white border-2 border-solid rounded-lg bg-bg-primary-dark text-white">

                        {data?.deliverables?.map((deliverable) => {
                            return (
                                <div key={deliverable.name} className="flex flex-row m-5 space-x-2 w-auto items-center justify-between">
                                    <img src={iconForDeliverableType(Number(deliverable.format))}
                                        className="mr-3 h-7 " alt="progressLineActive">
                                    </img>
                                    <h2>{deliverable.name}</h2>
                                    <p>{deliverable.description}</p>
                                    <NotSubmittedStatus></NotSubmittedStatus>
                                </div>
                            )
                        }
                        )}
                    </div>
                    <div className="flex flex-col sm:hidden w-full h-auto justify-between border-white rounded-lg bg-bg-primary-dark text-white">

                        {data?.deliverables?.map((deliverable) => {
                            return (
                                <div key={deliverable.name} className="flex flex-col p-3  border-2 border-accent-dark bg-bg-secondary-dark rounded-xl space-y-3 w-auto items-center justify-between">
                                    <div className="flex flex-row justify-between items-center w-full p-5">
                                        <div className="flex flex-col justify-start">
                                            <div className="flex flex-row">
                                                <img src={`${iconForDeliverableType(Number(deliverable.format))}`}
                                                    className="mr-3 h-7 " alt="progressLineActive">
                                                </img>
                                                <h2>{deliverable.name}</h2>
                                            </div>
                                            <p className="text-gray-400 w-auto">{deliverable.description}</p>
                                        </div>
                                        <NotSubmittedStatus></NotSubmittedStatus>

                                    </div>
                                    <div className="flex flex-row justify-center items-center border-2 rounded-xl w-full m-5 p-5">
                                        {!deliverable.isMilestone ? deliverable.milestone : 'Project'}
                                    </div>
                                </div>
                            )
                        }
                        )}
                    </div>
                </div>
                <div id="contract-milestones" className="flex flex-col sm:basis-1/3 sm:w-auto w-full mb-5 sm:m-5 h-full justify-between bg-bg-secondary-dark border-accent-dark border-2 border-solid rounded-xl  text-white">

                    <Accordion label={<div className="flex flex-row m-5 justify-between">
                        <h2 className='prose prose-lg text-purple-500'>Current Status</h2>
                        <p className=" prose prose-sm text-white">{data.status}</p>
                        <ExpandArrowButton expanded={expanded}></ExpandArrowButton>
                    </div>} expanded={expanded} setExpanded={setExpanded} content={
                        <MilestoneStepper data={data}></MilestoneStepper>
                    }></Accordion>
                </div>
            </div>

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
    console.dir(format)
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
