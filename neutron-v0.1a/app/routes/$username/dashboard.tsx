import { Link, useFetcher, useNavigate, useSubmit } from '@remix-run/react';
import { primaryGradientDark } from '~/utils/neutron-theme-extensions';
import { formatDateToReadableString } from '~/utils/utils';
import type { ActionFunction, LoaderFunction} from '@remix-run/server-runtime';
import { redirect } from '@remix-run/server-runtime';
import { json } from '@remix-run/server-runtime';
import { useLoaderData } from '@remix-run/react';
import PlaceholderDP from "~/assets/images/kartik.png"
import { firestore } from '~/firebase/neutron-config.server';
import { collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import type { Contract} from '~/models/contracts';
import { ContractCreationStages, ContractStatus } from '~/models/contracts';
import ViewIcon from '~/components/inputs/ViewIcon';
import EditIcon from '~/components/inputs/EditIcon';
import DeleteIcon from '~/components/inputs/DeleteIcon';
import MobileNavbarPadding from '~/components/layout/MobileNavbarPadding';
import { setFirestoreDocFromData } from '~/firebase/queries.server';
import { requireUser } from '~/session.server';
import ContractZeroState from '~/components/contracts/ContractZeroState';
import { ContractDraftedStatus, ContractPublishedStatus } from '~/components/layout/Statuses';
import { ToastContainer } from 'react-toastify';
import { injectStyle } from 'react-toastify/dist/inject-style';
import { useEffect, useState } from 'react';
import NeutronModal from '~/components/layout/NeutronModal';
import { ContractDataStore } from '~/stores/ContractStores';
import DashboardMobileUI from '~/components/pages/DashboardMobileUI';


export const loader: LoaderFunction = async ({ request, params }) => {

    // 
    const session = await requireUser(request, true);

    const ownerUsername = params.username;

    const contractsQuery = query(collection(firestore, `contracts`), where("viewers", "array-contains", session?.metadata?.id));
    //TODO : Make metadata fetching dynamic
    // const disputesQuery = query(collection(firestore, 'disputes'), limit(5));
    const contractsData = await getDocs(contractsQuery);
    // const disputesData = await getDocs(disputesQuery)

    const contracts: { [x: string]: any }[] = contractsData.docs.map((document) => {
        return { id: document.id, ...document.data() };
    });

    return json({
        contracts: contracts.filter((contract) => contract?.status != ContractStatus.Draft || contract?.creator == session?.metadata?.email).sort((a, b) => { return b.startDate - a.startDate }), disputes: [],
        metadata: session.metadata, ownerUsername: ownerUsername
    });
}


export const action: ActionFunction = async ({ request }) => {

    const session = await requireUser(request, true);
    const data = await request.formData();
    const id = data.get('id');


    const docRef = doc(firestore, `contracts/${id}`);

    await deleteDoc(docRef);
    const numberOfContracts = new Number(session?.metadata?.contracts);

    const metadataRef = await setFirestoreDocFromData({ ...session?.metadata, contracts: numberOfContracts.valueOf() - 1 }, `metadata`, session?.metadata?.id);

    return redirect(`${session?.metadata?.displayName}/dashboard`)

}


export default function Dashboard() {

    const fetcher = useFetcher();

    useEffect(() => {
        injectStyle();
    })

    const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
    const submit = useSubmit();
    const userData: { contracts: Contract[], disputes: any[], metadata: any, ownerUsername: string } = useLoaderData();


    const currentContract: Contract = userData.contracts[0]

    // let protectedFunds = 0;
    // userData.contracts.forEach((contract) => {
    //     protectedFunds += Number.parseInt(contract?.contractValue?.replace('₹'));
    // })
    const [contractSelectedForDeletion, setContractSelectedForDeletion] = useState(currentContract);
    const [contractFilter, setContractFilter] = useState();

    const currentUserData = userData.metadata;


    let navigate = useNavigate();

    return (
        <>
            <div className="hidden sm:flex sm:flex-row h-full ">
                
                <div id="activity-details-summary" className="flex flex-col w-full bg-bg-primary-dark ">
                    <div className='hidden sm:flex flex-row m-6 justify-between'>
                        <div className="flex flex-col">
                            <article className="">
                                <h2 className="text-white text-[30px] font-gilroy-black">Contracts </h2>
                                <p className="text-white text-[20px] font-gilroy-regular">Track and manage your contracts</p>

                            </article>

                        </div>
                        {/* <div className="flex items-center w-[692px]">
                        <label htmlFor="simple-search" className="sr-only">Search</label>
                        <div className="relative w-full ">
                            <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                                <svg className="w-5 h-5 text-white dark:text-black" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path></svg>
                            </div>
                            <input type="text" id="simple-search" className=" bg-bg-primary-dark border border-gray-300 text-gray-900 text-sm rounded-lg placeholder-white block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white " placeholder="Search through contracts" required />

                        </div>
                    </div> */}
                        <div id="user-action-buttons" >
                            <div className=' m-2'>
                                <button
                                    className={`w-full rounded-lg p-3 border-2 h-14 self-start text-left ${primaryGradientDark} border-transparent active:bg-amber-300 outline-none focus:ring-1 focus:ring-white focus:border-white hover:border-white hover:ring-white text-white transition-all`}
                                    onClick={() => {
                                        ContractDataStore.update((s) => { s.stage = ContractCreationStages.ClientInformation });
                                        navigate(`/${currentUserData?.displayName}/contracts/create`)
                                    }}

                                >
                                    <div className='flex flex-row space-x-2 justify-center items-center'>
                                        <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M10.4993 4.16602V15.8327M4.66602 9.99935H16.3327" stroke="white" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <h1 className=''>Create Contract</h1>

                                    </div>

                                </button>
                            </div>
                        </div>
                    </div>
                    {userData.contracts.length > 0 && <div className="flex flex-row bg-[#4d4d4d] h-10 mb-2 ml-6 space-x-4 p-2 w-1/2 border-2 border-gray-500 rounded-lg">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.5 17.5L14.5834 14.5833M16.6667 9.58333C16.6667 13.4954 13.4954 16.6667 9.58333 16.6667C5.67132 16.6667 2.5 13.4954 2.5 9.58333C2.5 5.67132 5.67132 2.5 9.58333 2.5C13.4954 2.5 16.6667 5.67132 16.6667 9.58333Z" stroke="#BCBCBC" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>

                        <input type="text" placeholder="Search" onChange={(e) => {
                            setContractFilter(e?.target?.value);
                        }} className="w-full bg-[#4d4d4d] border-0 text-white placeholder:text-white focus:border-transparent outline-none " />

                    </div>}
                    {/* {currentContract ?
                    <div id="current-project-summary" className={`flex font-gilroy-regular flex-col sm:flex-row m-6 mt-2 w-auto rounded-xl h-auto min-h-52 ${primaryGradientDark} justify-between items-center`}>
                        <div className="flex flex-col m-0.5 rounded-xl p-5 w-full text-left bg-bg-secondary-dark">
                            <h2 className="prose prose-xl mb-3 text-white font-gilroy-black text-[24px]">
                                Current Project: {currentContract?.projectName}
                            </h2>
                            <p className="prose prose-md text-white break-all sm:text-left font-gilroy-regular text-[18px]">
                                {currentContract?.description}
                            </p>
                             <div className="flex flex-col mt-2 text-left">
                            <h1 className="prose prose-sm text-white">Next Milestone</h1>
                            <h1 className="prose prose-md text-white">{currentContract?.hasMilestones ? currentContract?.milestones?.workMilestones[0].description : "Project has no milestones"}</h1>
                        </div> 
                            <div className="flex flex-row justify-start space-x-5 items-center prose prose-lg font-gilroy-medium text-white mt-2 whitespace-nowrap max-w-sm mb-5 sm:text-left">
                                <span className='items-center'>Current Status :</span>
                                <span className='items-center mb-3'> {currentContract?.status == ContractStatus.Draft ? <ContractDraftedStatus></ContractDraftedStatus> : <ContractPublishedStatus></ContractPublishedStatus>}</span>
                            </div>
                            {currentContract?.projectName && currentUserData.email == currentContract.clientEmail && currentContract.isSigned ? <PurpleWhiteButton onClick={() => {
                                const payload = structurePayinPayload(currentContract, userData.ownerUsername, currentUserData);
                                const formData = new FormData();
                                formData.append("payload", JSON.stringify(payload))
                                fetcher.submit(formData, { method: 'post', action: `${userData.ownerUsername}/handlers/payment` })
                            }} text="Pay Contract" /> : <></>}

                        </div>


                    </div> : <ContractZeroState></ContractZeroState>}
                <MobileNavbarPadding /> */}

                    {currentContract ? <div className={`bg-[#202020] hidden sm:table p-3 rounded-xl border-2 max-h-[70vh] border-solid border-purple-400 ${userData.contracts.length > 3 ? 'h-[65vh]' : 'h-2/5'} m-6`}>
                        <table className={`w-full max-h-[70vh] overflow-y-scroll sm:block table-auto ${userData.contracts.length > 3 ? 'h-[65vh]' : 'h-auto'} text-sm text-left text-gray-500 dark:text-gray-400`}>

                            <tbody className='sm:block table-row-group'>
                                <tr className={` border-b sm:flex sm:flex-row w-full dark:bg-gray-800 dark:border-gray-700 transition-all sticky top-0 pointer-events-none bg-bg-secondary-dark z-20  hover:bg-opacity-50 hover:drop-shadow-md dark:hover:bg-gray-600`}>

                                    <th scope="row" className="px-2 py-4 w-full font-medium text-center text-white dark:text-white whitespace-nowrap">
                                        #
                                    </th>
                                    <th scope="row" className="px-2 py-4 w-full font-medium text-center text-white dark:text-white whitespace-nowrap">
                                        Project Name
                                    </th>
                                    <th scope="row" className="px-2 py-4 w-full font-medium text-center text-white dark:text-white whitespace-nowrap">
                                        Client Name
                                    </th>
                                    <th scope="row" className="px-2 py-4 w-full font-medium text-center text-white dark:text-white whitespace-nowrap">
                                        Contract Value & Due Date
                                    </th>
                                    <th scope="row" className="px-2 py-4 w-full font-medium text-center text-white dark:text-white whitespace-nowrap">
                                        Contract Status
                                    </th>
                                    <th scope="row" className="px-2 py-4  w-full font-medium text-center text-white dark:text-white whitespace-nowrap">
                                        Issuer / Receiver
                                    </th>
                                    <th scope="row" className="px-2 py-4  w-full font-medium text-center text-white dark:text-white whitespace-nowrap">
                                        Actions
                                    </th>

                                </tr>
                                {userData?.contracts.filter((contract) => contractFilter ? contract.projectName?.includes(contractFilter) : true).map((contract: Contract, index: number) => {

                                    return (
                                        <tr key={contract.id} className={`border-b sm:flex sm:flex-row sm:justify-evenly sm:items-center w-full border-gray-400 dark:bg-gray-800 dark:border-gray-700 transition-all hover:bg-bg-primary-dark hover:bg-opacity-50 hover:border-accent-dark hover:drop-shadow-md dark:hover:bg-gray-600`}>

                                            <td scope="row" className="px-2 py-4 w-full font-medium text-center text-white dark:text-white whitespace-nowrap">
                                                {index + 1}
                                            </td>
                                            <td className="px-2 py-4 w-full text-center text-white ">
                                                <Link to={`/${currentUserData?.displayName}/contracts/${contract.id}`} className="hover:underline">
                                                    {contract.projectName}
                                                </Link>
                                            </td>
                                            <td className="px-2 py-4  w-full text-center text-white">
                                                {contract.clientName}
                                            </td>
                                            <td className="px-2 py-4 w-full text-center text-white">

                                                {contract.contractValue}
                                                <br></br>
                                                {contract.isSigned ? formatDateToReadableString(contract.signedDate) : contract.startDate}

                                            </td>
                                            <td className="  px-2 py-4 w-full translate-y-[-5px] text-center justify-center items-center flex-row flex ">
                                                {contract?.status == ContractStatus.Draft ? <ContractDraftedStatus></ContractDraftedStatus> : <ContractPublishedStatus></ContractPublishedStatus>}
                                            </td>
                                            <td className="  px-2 py-4 w-full text-center text-white">
                                                {contract?.creator === currentUserData.email ? 'Issuer' : 'Receiver'}
                                            </td>
                                            <td className=' px-2 py-4 w-full min-w-[160px] flex flex-row justify-center '>
                                                <div className=" max-w-fit w-full space-x-2 flex flex-row justify-evenly ">

                                                    {contract.status === ContractStatus.Draft && <EditIcon onClick={() => {
                                                        navigate(`/${currentUserData?.displayName}/contracts/edit/${contract.id}`)
                                                    }} className={'rounded-full border-2 border-transparent bg-transparent hover:bg-accent-dark transition-all  p-2'}></EditIcon>}
                                                    <ViewIcon onClick={() => {
                                                        navigate(`/${currentUserData?.displayName}/contracts/${contract.id}`)
                                                    }} className={'rounded-full border-2 border-transparent bg-transparent hover:bg-accent-dark transition-all  p-2'}></ViewIcon>
                                                    {contract.status === ContractStatus.Draft && <DeleteIcon onClick={() => {
                                                        setContractSelectedForDeletion(contract);
                                                        setDeleteConfirmationModal(!deleteConfirmationModal);
                                                    }} className={'rounded-full border-2 border-transparent bg-transparent hover:bg-accent-dark transition-all  p-2'}></DeleteIcon>}
                                                    {/* <ChatIcon onClick={function (event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
                                                    throw new Error('Function not implemented.');
                                                }} className={'rounded-full border-2 border-transparent bg-transparent hover:bg-accent-dark transition-all  p-2'}></ChatIcon> */}
                                                </div>
                                            </td>


                                        </tr>)
                                })}

                            </tbody>
                        </table>
                    </div> : <ContractZeroState></ContractZeroState>}

                </div>
                {deleteConfirmationModal && <NeutronModal onConfirm={(e) => {

                    let data = new FormData();
                    if (contractSelectedForDeletion.id) {
                        data.append('id', contractSelectedForDeletion.id);
                        submit(data,
                            { method: 'post' });
                    }

                }} body={<p className="text-red-600">You're about to delete a contract</p>} toggleModalFunction={setDeleteConfirmationModal}></NeutronModal>}

                <ToastContainer position="bottom-center"
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    theme="dark"
                    limit={1}

                    pauseOnFocusLoss
                    draggable
                    pauseOnHover></ToastContainer>
                <MobileNavbarPadding />
            </div>
            <DashboardMobileUI></DashboardMobileUI></>);

}