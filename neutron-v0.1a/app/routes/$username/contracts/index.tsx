import { useNavigate, useLoaderData, Outlet, Link, useSubmit } from '@remix-run/react'
import { ActionFunction, LoaderFunction, redirect } from '@remix-run/server-runtime';
import { json } from 'remix-utils';
import { firestore, auth } from '../../../firebase/neutron-config.server';
import { useCollection, useCollectionData } from 'react-firebase-hooks/firestore'
import { collection, deleteDoc, doc, DocumentData, getDocs } from 'firebase/firestore';
import { formatDateToReadableString } from '~/utils/utils';
import { primaryGradientDark, secondaryGradient } from '~/utils/neutron-theme-extensions';
import { useAuthState } from 'react-firebase-hooks/auth';
import ViewIcon from '~/components/inputs/ViewIcon';
import EditIcon from '~/components/inputs/EditIcon';
import DeleteIcon from '~/components/inputs/DeleteIcon';
import ChatIcon from '~/components/inputs/ChatIcon';
import { useEffect, useState } from 'react';
import { dataflow } from 'googleapis/build/src/apis/dataflow';
import MobileNavbarPadding from '~/components/layout/MobileNavbarPadding';
import { getFirebaseDocs, setFirestoreDocFromData } from '~/firebase/queries.server';
import { requireUser } from '~/session.server';
import { UserState } from '~/models/user';
import { Contract, Contract, ContractCreationStages, ContractStatus } from '~/models/contracts';
import { ContractDraftedStatus, ContractPublishedStatus } from '~/components/layout/Statuses';
import { Dispute } from '~/models/disputes';
import { toast, ToastContainer } from 'react-toastify';
import { injectStyle } from 'react-toastify/dist/inject-style';
import NeutronModal from '~/components/layout/NeutronModal';
import { ContractDataStore } from '~/stores/ContractStores';

export const loader: LoaderFunction = async ({ request }) => {
    const session = await requireUser(request, true);

    const result = await getFirebaseDocs(`contracts`)
    return json({ contracts: result, metadata: session?.metadata });

}

export const action: ActionFunction = async ({ request }) => {
    const session = await requireUser(request, true);

    const data = await request.formData();
    const id = data.get('id');
    console.log(data);
    const docRef = doc(firestore, `contracts/${id}`);
    await deleteDoc(docRef);
    console.log(`Contract deleted from firestore with id ${id}`);
    const numberOfContracts = new Number(session?.metadata?.contracts);

    const metadataRef = await setFirestoreDocFromData({ ...session?.metadata, contracts: numberOfContracts.valueOf() - 1 }, `metadata`, session?.metadata?.id);

    return redirect(`/${session?.metadata?.displayName}/contracts`)

}

export default function ListContracts() {


    const loaderData = JSON.parse(useLoaderData());
    const disputes: Dispute[] = [];
    const contracts = loaderData.contracts;
    const currentUser = loaderData.metadata;
    console.log(contracts)

    const [contractsTab, setContractsTab] = useState(true);
    const [currentContract, setCurrentContract] = useState(-1);
    const initialContractToBeDeleted: Contract = contracts[0]
    useEffect(() => {
        injectStyle();
    })
    const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);

    const submit = useSubmit();

    const [contractSelectedForDeletion, setContractSelectedForDeletion] = useState(initialContractToBeDeleted);

    let navigate = useNavigate();



    const generateContractsList = () => {
        return (<ul className=" m-4 space-y-4 max-h-[512px] overflow-scroll snap-y snap-mandatory">
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

    const generateDisputesList = () => {
        return (<ul className="m-5 mt-1 space-y-4 max-h-60 overflow-scroll">
            {disputes.map((contract: { id?: string, data?: any }, index: number) => {
                return (<li onClick={() => {
                    navigate(`${contract.id}`);
                }} key={contract.id} className={`bg-bg-secondary-dark border-2 h-auto rounded-xl border-accent-dark dark:bg-gray-800 dark:border-gray-700 hover:bg-gradient-to-br from-violet-700 via-violet-400 to-violet-500 hover:bg-opacity-50 dark:hover:bg-gray-600 flex flex-row justify-between`}>

                    <div className="flex flex-col  m-2 p-3 space-y-2">
                        <h2 className="prose prose-md text-white">
                            {contract.data.projectName}
                        </h2>
                        <h3 className="prose prose-sm text-gray-300">{contract.data.clientName}</h3>
                        <h4 className="prose prose-sm text-gray-300">{contract.data.signedDate}</h4>
                    </div>
                    <div className="flex flex-col  m-2 p-3 justify-between">
                        <h2 className="prose prose-md text-white">
                            {contract?.data?.contractValue}
                        </h2>
                        <td>
                            {contract?.data?.status == ContractStatus.Draft ? <ContractDraftedStatus></ContractDraftedStatus> : <ContractPublishedStatus></ContractPublishedStatus>}
                        </td>
                    </div>


                    {/* <td><ViewIcon onClick={() => {
                    navigate(`${contract.id}`)
                }} className={''}></ViewIcon></td>
                <td><EditIcon onClick={function (event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
                    throw new Error('Function not implemented.');
                }} className={''}></EditIcon></td>
                <td><DeleteIcon onClick={(e) => {
                    let data = new FormData();
                    data.append('id', contract.id);
                    submit(data,
                        { method: 'post' });
                }} className={''}></DeleteIcon></td>
                <td><ChatIcon onClick={function (event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
                    throw new Error('Function not implemented.');
                }} className={''}></ChatIcon></td> */}
                </li>)
            })}
        </ul>)
    }

    return (
        <div className='flex flex-col bg-bg-primary-dark h-full'>
            <div className=" flex flex-row justify-between w-full">
                <div className='flex flex-col m-6 justify-between'>
                    <div className="flex flex-col space-y-0">
                        <article className="">
                            <h2 className="text-white text-[30px] font-gilroy-black">Contracts </h2>
                            <p className="text-white text-[20px] font-gilroy-regular">Track and manage your contracts</p>
                        </article>
                    </div>

                    {/* <div className="flex items-center w-full sm:w-[692px] mt-10">
                        <label htmlFor="simple-search" className="sr-only">Search</label>
                        <div className="relative w-full ">
                            <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                                <svg className="w-5 h-5 text-white dark:text-black" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path></svg>
                            </div>
                            <input type="text" id="simple-search" className="p-5 bg-bg-primary-dark border border-gray-300 text-gray-900 text-sm rounded-lg placeholder-white block w-full pl-10  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white " placeholder="Search through contracts" required />

                        </div>
                    </div> */}
                    {/* <div id="user-action-buttons" className='flex flex-row'>
                        
                    </div> */}
                </div>

                <div className="hidden sm:flex sm:flex-col-reverse m-6 sm:max-w-[400px] sm:w-full">

                    <button
                        className={`w-full rounded-lg p-3 border-2 h-16 self-start text-left ${primaryGradientDark} border-transparent active:bg-amber-300 outline-none focus:ring-1 focus:ring-white focus:border-white hover:border-white hover:ring-white text-white transition-all`}
                        onClick={() => {
                            ContractDataStore.update((s) => { s.stage = ContractCreationStages.ClientInformation });
                            navigate(`create`)
                        }}

                    >
                        <div className='flex flex-row space-x-4 justify-center'>
                            <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10.4993 4.16602V15.8327M4.66602 9.99935H16.3327" stroke="white" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <h1>Add Contract</h1>

                        </div>

                    </button>
                </div>
            </div>
            <div className="flex flex-row sm:hidden m-3 w-auto rounded-xl">
                <button
                    className={`w-full rounded-lg ${contractsTab ? 'bg-accent-dark' : 'bg-bg-primary-dark'}  p-3 text-white transition-all hover:scale-100`}
                    onClick={() => {
                        setContractsTab(!contractsTab)

                    }}
                >
                    Contracts
                </button>
                <button
                    className={`w-full rounded-lg ${!contractsTab ? 'bg-accent-dark' : 'bg-bg-primary-dark'} p-3 text-white transition-all hover:scale-100`}
                    onClick={() => {
                        setContractsTab(!contractsTab)
                    }}
                >
                    Disputes
                </button>
            </div>
            <div className={`bg-bg-secondary-dark p-3 rounded-lg border-2 border-solid border-purple-400  h-auto m-6 sm:flex hidden`}>
                <table className="w-full max-h-max text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-sm w-auto text-white bg-bg-secondary-dark dark:bg-gray-700 dark:text-gray-400">
                        <tr className="border-b ">
                            <th scope="row" className="px-6 py-4 font-medium text-center text-white dark:text-white whitespace-nowrap">
                                #
                            </th>
                            <th scope="row" className="px-6 py-4 text-center text-white dark:text-white whitespace-nowrap">
                                Project Name
                            </th>
                            <th scope="row" className="px-6 py-4 font-medium text-center text-white dark:text-white whitespace-nowrap">
                                Client Name
                            </th>
                            <th scope="row" className="px-6 py-4 font-medium text-center text-white dark:text-white whitespace-nowrap">
                                Contract Value & Due Date
                            </th>
                            <th scope="row" className="px-6 py-4 font-medium text-center text-white dark:text-white whitespace-nowrap">
                                Start Date
                            </th>
                            <th scope="row" className="px-6 py-4 font-medium text-center text-white dark:text-white whitespace-nowrap">
                                Contract Status
                            </th>
                            <th scope="row" className="px-6 py-4 font-medium text-center text-white dark:text-white whitespace-nowrap">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {contracts.map((contract: { id: string, data: any }, index: number) => {
                            return (<tr key={contract.id} className={`bg-bg-secondary-dark  border-b hover:border-accent-dark dark:bg-gray-800 dark:border-gray-700 hover:bg-bg-primary-dark hover:bg-opacity-50 dark:hover:bg-gray-600`}>

                                <th scope="row" className="px-6 py-4 font-medium text-center text-white dark:text-white whitespace-nowrap">
                                    <Link to={`${contract.id}`}>{index + 1}</Link>
                                </th>
                                <td className="px-6 py-4 text-center text-white">
                                    <Link to={`/${currentUser?.displayName}/contracts/${contract.id}`} className="hover:underline hover:animate-pulse">
                                        {contract.data.projectName}

                                    </Link>
                                </td>
                                <td className="px-6 py-4 text-center text-white">
                                    {contract.data.clientName}
                                </td>
                                <td className="px-6 py-4 text-center text-white">
                                    {contract.data.contractValue}
                                </td>
                                <td className="px-6 py-4 text-center text-white">
                                    {contract?.data?.startDate}
                                </td>

                                <td className="px-6 py-4">
                                    {contract?.data?.status == ContractStatus.Draft ? <ContractDraftedStatus></ContractDraftedStatus> : <ContractPublishedStatus></ContractPublishedStatus>}
                                </td>
                                <td>
                                    <div className=" justify-between flex flex-row">
                                        <ViewIcon onClick={() => {
                                            navigate(`/${currentUser?.displayName}/contracts/${contract.id}`)
                                        }} className={'rounded-full border-2 border-transparent bg-transparent hover:bg-accent-dark transition-all  p-2'}></ViewIcon>
                                        <EditIcon onClick={contract.status == ContractStatus.Draft ? () => {
                                            throw new Error('Function not implemented.');
                                        } : () => { toast("You can't edit a contract once it's published :(", { theme: 'dark', type: 'info' }) }} className={'rounded-full border-2 border-transparent bg-transparent hover:bg-accent-dark transition-all  p-2'}></EditIcon>
                                        <DeleteIcon onClick={contract.status == ContractStatus.Published ? () => {
                                            setContractSelectedForDeletion(contract);
                                            setDeleteConfirmationModal(!deleteConfirmationModal);
                                        } : () => { toast("You can't delete a contract once it's published :(") }} className={'rounded-full border-2 border-transparent bg-transparent hover:bg-accent-dark transition-all  p-2'}></DeleteIcon>
                                        {/* <ChatIcon onClick={function (event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
                                                    throw new Error('Function not implemented.');
                                                }} className={'rounded-full border-2 border-transparent bg-transparent hover:bg-accent-dark transition-all  p-2'}></ChatIcon> */}
                                    </div>
                                </td>
                            </tr>)
                        })}

                    </tbody>
                </table>
            </div>
            <div className="flex flex-col sm:hidden">
                {contractsTab ? generateContractsList() : generateDisputesList()}
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

        </div >);
}


