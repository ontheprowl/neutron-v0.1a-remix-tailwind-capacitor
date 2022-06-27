

import NeutronIcon from '~/assets/images/icon.svg';
import ProgressLine from "~/assets/images/progressLineActive.svg"
import GradientSeparator from '~/assets/images/gradientLineSeparator.svg'
import { ContractDataStore } from '~/stores/ContractStores';
import { Contract } from '~/types/contracts';
import { primaryGradientDark } from '~/utils/neutron-theme-extensions';
import MilestoneStepper from '../milestones/MilestoneStepper';
import { NotSubmittedStatus } from '../layout/Statuses';



export default function ContractOverview({ loaderData }: { loaderData?: Contract }) {

    let data = ContractDataStore.useState();
    if (loaderData) {
        data = loaderData;
    }
    console.log('data for the contract overview is : ');
    console.log(data)
    return <>
        <div className="flex flex-col w-auto h-auto justify-between m-6">
            {/*
Escrow section
*/}
            <div className="flex flex-row h-14 space-x-5 mb-10">
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
            <div className="flex flex-row w-auto">
                <div id="contract-details" className="flex flex-col basis-2/3 w-auto h-auto justify-start rounded-lg bg-bg-primary-dark text-white">
                    <div className="flex flex-row justify-between mb-5">
                        <h2>Project Details</h2>
                    </div>
                    <div className="w-full h-72 p-5  rounded-lg border-2 border-solid border-gray-400 mb-10">
                        {data.description}
                    </div>

                    <div className="flex flex-col w-full h-auto justify-between border-white border-2 border-solid rounded-lg bg-bg-primary-dark text-white">
                        <div className="flex flex-row m-5 justify-between">
                            <h2>Deliverables</h2>
                            <p>Status: Wireframes submitted in JPG, PDF, MP4 format and is Approved</p>
                        </div>
                        {data?.deliverables?.map((deliverable) => {
                            return (
                                <div key={deliverable.name} className="flex flex-row m-5 space-x-2 w-auto items-center justify-between">
                                    <img src={iconForDeliverableType(deliverable.format)}
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
                </div>
                <div id="contract-milestones" className="flex flex-col basis-1/3 w-auto m-5 h-full justify-between bg-[#2A2a2a] border-accent-dark border-2 border-solid rounded-xl  text-white">
                    <div className="flex flex-row m-5 justify-between">
                        <h2 className='prose prose-lg text-purple-500'>Current Status</h2>
                        <p className=" prose prose-sm text-white">{data.status}</p>
                    </div>
                    <MilestoneStepper data={data}></MilestoneStepper>
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

function iconForDeliverableType(format: any): string | undefined {
    return NeutronIcon
}
