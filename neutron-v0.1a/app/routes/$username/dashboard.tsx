import { Link, useFetcher, useNavigate, useSubmit } from '@remix-run/react';
import EscrowSummary from '~/components/escrow/EscrowSummary';
import { primaryGradientDark, secondaryGradient } from '~/utils/neutron-theme-extensions';
import { formatDateToReadableString, structurePayinPayload } from '~/utils/utils';
import ContractStats from '~/components/contracts/ContractStats';
import { ActionFunction, LoaderFunction, redirect } from '@remix-run/server-runtime';
import { json } from '@remix-run/server-runtime';
import { testContractsData, testDisputesData } from '~/utils/testData.server';
import { useLoaderData } from '@remix-run/react';
import PlaceholderDP from "~/assets/images/kartik.png"
import PlaceholderCover from "~/assets/images/sample_cover.png"
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, firestore } from '~/firebase/neutron-config.server';
import { collection, deleteDoc, doc, getDocs, limit, Query, query, where } from 'firebase/firestore';
import { Contract, ContractCreationStages, ContractStatus } from '~/models/contracts';
import Accordion from '~/components/layout/Accordion'
import ViewIcon from '~/components/inputs/ViewIcon';
import EditIcon from '~/components/inputs/EditIcon';
import DeleteIcon from '~/components/inputs/DeleteIcon';
import ChatIcon from '~/components/inputs/ChatIcon';
import { motion } from 'framer-motion';
import MobileNavbarPadding from '~/components/layout/MobileNavbarPadding';
import PurpleWhiteButton from '~/components/inputs/PurpleWhiteButton';
import { getSingleDoc, setFirestoreDocFromData } from '~/firebase/queries.server';
import { requireUser } from '~/session.server';
import { UserState } from '~/models/user';
import ContractZeroState from '~/components/contracts/ContractZeroState';
import { ContractDraftedStatus, ContractPublishedStatus } from '~/components/layout/Statuses';
import { toast, ToastContainer } from 'react-toastify';
import { injectStyle } from 'react-toastify/dist/inject-style';
import { useEffect, useState } from 'react';
import NeutronModal from '~/components/layout/NeutronModal';
import { ContractDataStore } from '~/stores/ContractStores';
import DashboardMobileUI from '~/components/pages/DashboardMobileUI';
import { UIStore } from '~/stores/UIStore';


export const loader: LoaderFunction = async ({ request, params }) => {

    // console.log(auth.currentUser)
    const session = await requireUser(request, true);

    const ownerUsername = params.username;

    const contractsQuery = query(collection(firestore, `contracts`), where("viewers", "array-contains", session?.metadata?.id));
    //TODO : Make metadata fetching dynamic
    // const disputesQuery = query(collection(firestore, 'disputes'), limit(5));
    const contractsData = await getDocs(contractsQuery);
    // const disputesData = await getDocs(disputesQuery)
    return json({
        contracts: contractsData.docs.map((document) => {
            return { id: document.id, ...document.data() };
        }).sort((a, b) => { return b.startDate - a.startDate }), disputes: [],
        metadata: session.metadata, ownerUsername: ownerUsername
    });
}


export const action: ActionFunction = async ({ request }) => {

    const session = await requireUser(request, true);
    const data = await request.formData();
    const id = data.get('id');
    console.log(data);
    const docRef = doc(firestore, `contracts/${id}`);

    await deleteDoc(docRef);
    const numberOfContracts = new Number(session?.metadata?.contracts);

    const metadataRef = await setFirestoreDocFromData({ ...session?.metadata, contracts: numberOfContracts.valueOf() - 1 }, `metadata`, session?.metadata?.id);
    console.log(`Contract deleted from firestore with id ${id}`);
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
                <div id="user-profile-panel" className="w-full border-2 flex flex-col sm:w-96 sm:hidden sm:bg-bg-secondary-dark justify-start rounded-l-3xl ">
                    {/* Mobile Section */}


                    {/* Desktop Section */}
                    <div className="hidden sm:flex sm:flex-col items-stretch">
                        {/* <img alt="cover" className="w-auto h-auto min-h-48 object-cover rounded-bl-[50px] rounded-br-[50px] rounded-tl-[50px] " src={PlaceholderCover}></img> */}
                        <img alt="profile" src={currentUserData.photoURL ? currentUserData.photoURL : PlaceholderDP} className="h-32 w-32 mt-16 translate-y-[-50px] bg-[#e5e5e5] border-8 hover:opacity-50 hover:ring-1 outline-none transition-all hover:ring-[#8364E8] border-solid border-black rounded-full self-start ml-6  object-contain"></img>
                        <div className='flex flex-col justify-between space-y-4 translate-y-[-28px] p-2 pl-6'>
                            <h2 className="prose prose-lg text-white self-start font-gilroy-black text-[25px]">{currentUserData.firstName} {currentUserData.lastName} </h2>
                            <h1 className="prose prose-lg text-[#CDC1F6] self-start font-gilroy-black text-[16px] translate-y-[-20px]">@{currentUserData.displayName}</h1>
                            <p className="prose prose-lg text-black text-center w-auto min-w-[101px] font-gilroy-bold self-start bg-white p-2 rounded-full text-[14px] translate-y-[-25px]"> {currentUserData.designation}</p>
                            <div className='flex flex-col w-full rounded-xl space-y-4'>
                                <h1 className="prose prose-lg text-white self-start font-gilroy-bold text-[16px]">Member Since: <span className="font-gilroy-regular">{currentUserData.creationTime}</span></h1>
                                <p className="prose prose-lg text-white self-start font-gilroy-bold text-[16px]"> Working Language: <span className="font-gilroy-regular">{currentUserData.language}</span></p>
                                <h1 className="prose prose-lg text-white self-start font-gilroy-bold text-[16px]">Location: <span className="font-gilroy-regular">{currentUserData.location}</span></h1>
                                <p className="prose prose-lg text-white self-start font-gilroy-bold text-[16px]">Experience: <span className="font-gilroy-regular">{currentUserData.experience} years</span></p>
                            </div>
                        </div>
                    </div>
                    {/* <Accordion label={<motion.div onClick={() => setExpanded(!expanded)} className={`rounded-xl text-left p-4 cursor-pointer`}>
                    <motion.h2 className='prose prose-lg text-white text-center sm:text-left'>Total Funds</motion.h2>
                    <motion.h1 className="prose prose-lg text-white text-center sm:text-right"> {currentUserData?.funds?.totalFunds}</motion.h1>
                </motion.div>} className={`${primaryGradientDark}  h-auto rounded-xl mt-4 text-left p-4`} content={<EscrowSummary funds={currentUserData.funds}></EscrowSummary>} expanded={expanded} setExpanded={setExpanded}></Accordion> */}
                    <ContractStats clients={currentUserData.clients} contracts={currentUserData.contracts}></ContractStats>


                </div>
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
                                            <path d="M10.4993 4.16602V15.8327M4.66602 9.99935H16.3327" stroke="white" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round" />
                                        </svg>
                                        <h1 className=''>Add Contract</h1>

                                    </div>

                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-row bg-[#4d4d4d] h-10 mb-2 ml-6 space-x-4 p-2 w-1/2 border-2 border-gray-500 rounded-lg">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.5 17.5L14.5834 14.5833M16.6667 9.58333C16.6667 13.4954 13.4954 16.6667 9.58333 16.6667C5.67132 16.6667 2.5 13.4954 2.5 9.58333C2.5 5.67132 5.67132 2.5 9.58333 2.5C13.4954 2.5 16.6667 5.67132 16.6667 9.58333Z" stroke="#BCBCBC" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>

                        <input type="text" placeholder="Search" onChange={(e) => {
                            setContractFilter(e?.target?.value);
                        }} className="w-full bg-[#4d4d4d] border-0 text-white placeholder:text-white focus:border-transparent outline-none " />

                    </div>
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
                        <table className=" w-full max-h-[70vh] overflow-y-scroll sm:block table-auto h-[65vh] text-sm text-left text-gray-500 dark:text-gray-400">

                            <tbody className='sm:block table-row-group'>
                                <tr className={` border-b sm:flex sm:flex-row w-full dark:bg-gray-800 dark:border-gray-700 transition-all sticky top-0 pointer-events-none bg-bg-secondary-dark z-20  hover:bg-opacity-50 hover:drop-shadow-md dark:hover:bg-gray-600`}>

                                    <th scope="row" className="px-6 py-4 w-full font-medium text-center text-white dark:text-white whitespace-nowrap">
                                        #
                                    </th>
                                    <th scope="row" className="px-6 py-4 w-full font-medium text-center text-white dark:text-white whitespace-nowrap">
                                        Project Name
                                    </th>
                                    <th scope="row" className="px-6 py-4 w-full font-medium text-center text-white dark:text-white whitespace-nowrap">
                                        Client Name
                                    </th>
                                    <th scope="row" className="px-6 py-4 w-full font-medium text-center text-white dark:text-white whitespace-nowrap">
                                        Contract Value & Due Date
                                    </th>
                                    <th scope="row" className="px-6 py-4 w-full font-medium text-center text-white dark:text-white whitespace-nowrap">
                                        Contract Status
                                    </th>
                                    <th scope="row" className="px-6 py-4  w-full font-medium text-center text-white dark:text-white whitespace-nowrap">
                                        Issuer / Receiver
                                    </th>
                                    <th scope="row" className="px-6 py-4  w-full font-medium text-center text-white dark:text-white whitespace-nowrap">
                                        Actions
                                    </th>

                                </tr>
                                {userData?.contracts.filter((contract) => contractFilter ? contract.projectName?.includes(contractFilter) : true).map((contract: Contract, index: number) => {
                                    console.log()
                                    return (
                                        <tr key={contract.id} className={`border-b sm:flex sm:flex-row sm:justify-evenly sm:items-center w-full border-gray-400 dark:bg-gray-800 dark:border-gray-700 transition-all hover:bg-bg-primary-dark hover:bg-opacity-50 hover:border-accent-dark hover:drop-shadow-md dark:hover:bg-gray-600`}>

                                            <td scope="row" className="px-6 py-4 w-full font-medium text-center text-white dark:text-white whitespace-nowrap">
                                                {index + 1}
                                            </td>
                                            <td className="px-6 py-4 w-full text-center text-white ">
                                                <Link to={`/${currentUserData?.displayName}/contracts/${contract.id}`} className="hover:underline ">
                                                    {contract.projectName}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4  w-full text-center text-white">
                                                {contract.clientName}
                                            </td>
                                            <td className="px-6 py-4 w-full text-center text-white">

                                                {contract.contractValue}
                                                <br></br>
                                                {contract.isSigned ? formatDateToReadableString(contract.signedDate) : contract.startDate}

                                            </td>
                                            <td className="  px-6 py-4 w-full translate-y-[-5px] text-center justify-center items-center flex-row flex ">
                                                {contract?.status == ContractStatus.Draft ? <ContractDraftedStatus></ContractDraftedStatus> : <ContractPublishedStatus></ContractPublishedStatus>}
                                            </td>
                                            <td className="  px-6 py-4 w-full text-center text-white">
                                                {contract?.creator === currentUserData.email ? 'Issuer' : 'Receiver'}
                                            </td>
                                            <td className=' px-6 py-4 w-full min-w-[160px] flex flex-row justify-center '>
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
                    autoClose={2000}
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