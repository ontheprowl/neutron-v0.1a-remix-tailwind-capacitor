import { useLoaderData, useNavigate } from "@remix-run/react";
import { MouseEvent, useEffect, useState } from "react";
import { injectStyle } from "react-toastify/dist/inject-style";
import { Contract, ContractCreationStages, ContractStatus } from "~/models/contracts";
import { ContractDataStore } from "~/stores/ContractStores";
import { primaryGradientDark } from "~/utils/neutron-theme-extensions";
import { formatDateToReadableString } from "~/utils/utils";
import ContractZeroState from "../contracts/ContractZeroState";
import ChatIcon from "../inputs/ChatIcon";
import DeleteIcon from "../inputs/DeleteIcon";
import EditIcon from "../inputs/EditIcon";
import PurpleWhiteButton from "../inputs/PurpleWhiteButton";
import ViewIcon from "../inputs/ViewIcon";
import MobileNavbarPadding from "../layout/MobileNavbarPadding";
import NeutronModal from "../layout/NeutronModal";
import { ContractDraftedStatus, ContractPublishedStatus } from "../layout/Statuses";



export default function DashboardMobileUI() {



    useEffect(() => {
        injectStyle();
    })

    const userData: { contracts: Contract[], disputes: any[], metadata: any, ownerUsername: string } = useLoaderData();

    const contracts = userData.contracts;
    const currentContract = contracts[0];


    const generateContractsList = () => {
        return (<ul className=" mt-1 space-y-4 max-h-[512px] overflow-scroll snap-y snap-mandatory">
            {contracts.map((contract: Contract, index: number) => {
                return (<li onClick={() => {
                    setCurrentContract(index)
                }} key={contract.id} className={`snap-center bg-bg-secondary-dark border-2 h-auto rounded-xl border-purple-400 dark:bg-gray-800 dark:border-gray-700 hover:bg-gradient-to-br from-violet-700 via-violet-400 to-violet-500 hover:bg-opacity-50 dark:hover:bg-gray-600 flex flex-col transition-all justify-between`}>

                    <div className="flex flex-col justify-between p-4 space-y-2">
                        <div className="flex flex-row space-y-2">
                            <h2 className="prose prose-md text-[18px] text-white">
                                {contract.projectName}
                            </h2>

                        </div>
                        <div className="flex flex-row   justify-between">
                            <h3 className="prose prose-sm text-gray-300">{contract.clientName}</h3>
                            <h4 className="prose prose-sm text-gray-300">{contract.endDate}</h4>
                        </div>
                        <div className="flex flex-row space-x-5  justify-between">
                            <h2 className="prose prose-md text-white">
                                {contract.contractValue}
                            </h2>
                            <span className="w-full flex flex-row justify-end">
                                {contract?.status == ContractStatus.Draft ? <ContractDraftedStatus></ContractDraftedStatus> : <ContractPublishedStatus></ContractPublishedStatus>}
                            </span>
                        </div>

                    </div>


                    <div className={` m-2 p-3 justify-between ${currentContract == index ? 'flex flex-row' : 'hidden'}`}>
                        <ViewIcon onClick={() => {
                            navigate(`${contract.id}`)
                        }} className={''}></ViewIcon>
                        <EditIcon onClick={function (event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
                            throw new Error('Function not implemented.');
                        }} className={''}></EditIcon>
                        <DeleteIcon onClick={(e) => {
                            let data = new FormData();
                            data.append('id', contract.id);
                            submit(data,
                                { method: 'post' });
                        }} className={''}></DeleteIcon>
                        <ChatIcon onClick={function (event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
                            throw new Error('Function not implemented.');
                        }} className={''}></ChatIcon>
                    </div>


                </li>)
            })
            }
        </ul >)
    }
    // let protectedFunds = 0;
    // userData.contracts.forEach((contract) => {
    //     protectedFunds += Number.parseInt(contract?.contractValue?.replace('₹'));
    // })

    const [contractsTab, setContractsTab] = useState(true);
    const currentUserData = userData.metadata;

    let navigate = useNavigate();


    return (
        <div className={`flex flex-col sm:hidden space-y- h-full  text-center bg-transparent`}>
            <div>
                <h1 className="text-white text-[30px] text-left font-gilroy-black ml-8"> Welcome, {currentUserData?.displayName} </h1>
                <h2 className="text-white text-[16px] text-left font-gilroy-medium ml-8">{formatDateToReadableString(new Date().getTime(), false, true)}</h2>
            </div>


            <div className={` w-auto m-8 rounded-xl p-1 ${primaryGradientDark} z-10 translate-y-10`}>
                <div className=" h-40 rounded-xl bg-bg-primary-dark text-white">
                    <div className="flex flex-col space-y-2 pt-6">
                        <h1 className="text-[16px] font-gilroy-medium">Committed Funds</h1>
                        <p className="font-gilroy-black text-[30px]"> Rs. 5402</p>
                        <p className="font-gilroy-medium text-[14px]"> (57 Contracts)</p>
                    </div>
                </div>
            </div>
            <div id="main-dash-section" className=' bg-bg-primary-dark h-full z-0 translate-y-[-40px] pt-32 p-8 flex flex-col'>
                <button
                    className={`w-full rounded-full p-3  h-14 self-start text-left ${primaryGradientDark} active:bg-amber-300 outline-none focus:ring-1 focus:ring-white focus:border-white hover:border-white hover:ring-white text-white transition-all`}
                    onClick={() => {
                        ContractDataStore.update((s) => { s.stage = ContractCreationStages.ClientInformation });
                        navigate(`/${currentUserData?.displayName}/contracts/create`)
                    }}

                >
                    <div className='flex flex-row space-x-2 justify-center items-center'>
                        <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10.4993 4.16602V15.8327M4.66602 9.99935H16.3327" stroke="white" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        <h1 className=''>Add Contract</h1>

                    </div>

                </button>

                {/* <div className="flex flex-row sm:hidden font-gilroy-black m-3 w-auto rounded-xl">
                    <button
                        className={`w-full rounded-lg ${contractsTab ? primaryGradientDark : 'bg-bg-primary-dark'}  p-3 text-white transition-all`}
                        onClick={() => {
                            setContractsTab(!contractsTab)

                        }}
                    >
                        Contracts
                    </button>
                    <button
                        className={`w-full rounded-lg ${!contractsTab ? 'bg-purple-400' : 'bg-bg-primary-dark'} p-3 text-white transition-all `}
                        onClick={() => {
                            setContractsTab(!contractsTab)
                        }}
                    >
                        Disputes
                    </button>
                </div> */}
                <div className="flex flex-col sm:hidden mt-10 bg-bg-secondary-dark  text-white rounded-xl">
                    {/* {contractsTab ? generateContractsList() : ''} */}
                    {currentContract ?
                        <div id="current-project-summary" className={`flex font-gilroy-regular flex-col sm:flex-row m-6 mt-2 w-auto rounded-xl h-full min-h-52 justify-between items-center`}>
                            <div className="flex flex-col m-0.5 rounded-xl p-5 w-full text-left bg-bg-secondary-dark">
                                <h2 className="prose prose-xl mb-3 text-white font-gilroy-black text-[24px]">
                                    Current Project: {currentContract?.projectName}
                                </h2>
                                <p className="prose prose-md text-white break-all sm:text-left font-gilroy-regular text-[18px]">
                                    {currentContract?.description}
                                </p>
                                {/* <div className="flex flex-col mt-2 text-left">
                                    <h1 className="prose prose-sm text-white">Next Milestone</h1>
                                    <h1 className="prose prose-md text-white">{currentContract?.hasMilestones ? currentContract?.milestones?.workMilestones[0].description : "Project has no milestones"}</h1>
                                </div>
                                <div className="flex flex-row justify-start space-x-5 items-center prose prose-lg font-gilroy-medium text-white mt-2 whitespace-nowrap max-w-sm mb-5 sm:text-left">
                                    <span className='items-center'>Current Status :</span>
                                    <span className='items-center mb-3'> {currentContract?.status == ContractStatus.Draft ? <ContractDraftedStatus></ContractDraftedStatus> : <ContractPublishedStatus></ContractPublishedStatus>}</span>
                                </div> */}
                                {currentContract?.projectName && currentUserData.email == currentContract.clientEmail && currentContract.isSigned ? <PurpleWhiteButton text="Pay Contract" onClick={function (event: MouseEvent<HTMLButtonElement, MouseEvent>): void {
                                    throw new Error("Function not implemented.");
                                } } /> : <></>}

                            </div>

                            {/* onClick={() => {
                                const payload = structurePayinPayload(currentContract, userData.ownerUsername, currentUserData);
                                const formData = new FormData();
                                formData.append("payload", JSON.stringify(payload))
                                fetcher.submit(formData, { method: 'post', action: `${userData.ownerUsername}/handlers/payment` })
                            }} */}
                        </div> : <ContractZeroState></ContractZeroState>}

                </div>
                {/* {deleteConfirmationModal && <NeutronModal onConfirm={(e) => {

                    let data = new FormData();
                    if (contractSelectedForDeletion.id) {
                        data.append('id', contractSelectedForDeletion.id);
                        submit(data,
                            { method: 'post' });
                    }

                }} body={<p className="text-red-600">You're about to delete a contract</p>} toggleModalFunction={setDeleteConfirmationModal}></NeutronModal>} */}
                        <MobileNavbarPadding></MobileNavbarPadding>

            </div>

        </div>)
}