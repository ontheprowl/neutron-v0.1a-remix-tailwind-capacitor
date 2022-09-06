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
import { useState } from 'react';
import { dataflow } from 'googleapis/build/src/apis/dataflow';
import MobileNavbarPadding from '~/components/layout/MobileNavbarPadding';
import { getFirebaseDocs, setFirestoreDocFromData } from '~/firebase/queries.server';
import { requireUser } from '~/session.server';
import { UserState } from '~/models/user';
import { ContractStatus } from '~/models/contracts';
import { ContractDraftedStatus, ContractPublishedStatus } from '~/components/layout/Statuses';
import { Dispute } from '~/models/disputes';

export const loader: LoaderFunction = async ({ request }) => {
    const session = await requireUser(request, true);

    const result = await getFirebaseDocs(`users/contracts/${session?.metadata?.id}`)
    return json({ contracts: result, metadata: session?.metadata });

}

export const action: ActionFunction = async ({ request }) => {
    const session = await requireUser(request, true);

    const data = await request.formData();
    const id = data.get('id');
    console.log(data);
    const docRef = doc(firestore, `users/contracts/${session?.metadata?.id}/${id}`);
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

    const submit = useSubmit();

    let navigate = useNavigate();



    const generateContractsList = () => {
        return (<ul className="m-5 mt-1 space-y-4 max-h-96 overflow-scroll snap-y snap-mandatory">
            {contracts.map((contract: { id: string, data: any }, index: number) => {
                return (<li onClick={() => {
                    setCurrentContract(index)
                }} key={contract.id} className={`snap-center bg-bg-secondary-dark border-2 h-auto rounded-xl border-accent-dark dark:bg-gray-800 dark:border-gray-700 hover:bg-gradient-to-br from-violet-700 via-violet-400 to-violet-500 hover:bg-opacity-50 dark:hover:bg-gray-600 flex flex-col transition-all justify-between`}>

                    <div className="flex flex-row justify-between">
                        <div className="flex flex-col  m-2 p-3 space-y-2">
                            <h2 className="prose prose-md text-white">
                                {contract.data.projectName}
                            </h2>
                            <h3 className="prose prose-sm text-gray-300">{contract.data.clientName}</h3>
                            <h4 className="prose prose-sm text-gray-300">{contract.data.signedDate}</h4>
                        </div>
                        <div className="flex flex-col  m-2 p-3 justify-between">
                            <h2 className="prose prose-md text-white">
                                {contract.data.contractValue}
                            </h2>
                            <td>
                                {contract?.data?.status == ContractStatus.Draft ? <ContractDraftedStatus></ContractDraftedStatus> : <ContractPublishedStatus></ContractPublishedStatus>}
                            </td>
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
        <div className='flex flex-col space-y-8 bg-bg-primary-dark h-full'>
            <div className=" flex flex-row justify-between w-full">
                <div className='flex flex-col m-6 justify-between'>
                    <div className="flex flex-col">
                        <article className="prose">
                            <h2 className="text-white prose prose-lg">Welcome {currentUser?.email}</h2>
                            <p className="text-white prose prose-sm">{formatDateToReadableString()}</p>
                        </article>
                    </div>
                    <div className="flex items-center w-full sm:w-[692px] mt-10">
                        <label htmlFor="simple-search" className="sr-only">Search</label>
                        <div className="relative w-full ">
                            <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                                <svg className="w-5 h-5 text-white dark:text-black" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path></svg>
                            </div>
                            <input type="text" id="simple-search" className="p-5 bg-bg-primary-dark border border-gray-300 text-gray-900 text-sm rounded-lg placeholder-white block w-full pl-10  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white " placeholder="Search through contracts" required />

                        </div>
                    </div>
                    <div id="user-action-buttons">
                        <div>

                        </div>
                    </div>
                </div>

                <div className="hidden sm:flex sm:flex-col-reverse m-6">

                    {/**Add profile buttons here */}
                    <button
                        className="w-40 rounded-lg bg-accent-dark p-3 text-white transition-all hover:scale-105"
                        onClick={() => {
                            navigate('create');
                        }}
                    >
                        Add Contract
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
            <div className={`bg-bg-primary-dark p-3 rounded-lg border-2 border-solid border-accent-dark  h-auto m-6 sm:flex hidden`}>
                <table className="w-full max-h-max text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs w-auto text-white uppercase bg-bg-primary-dark dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-center">
                                #
                            </th>
                            <th scope="col" className="px-6 py-3 text-center">
                                Project Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-center">
                                Client Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-center">
                                Contract Value
                            </th>
                            <th scope="col" className="px-6 py-3 text-center">
                                Date Created
                            </th>
                            <th scope="col" className="px-6 py-3 text-center">
                                <span>Status</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {contracts.map((contract: { id: string, data: any }, index: number) => {
                            return (<tr key={contract.id} className={`bg-bg-primary-dark border-t border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gradient-to-br from-violet-700 via-violet-400 to-violet-500 hover:bg-opacity-50 dark:hover:bg-gray-600`}>

                                <th scope="row" className="px-6 py-4 font-medium text-center text-white dark:text-white whitespace-nowrap">
                                    <Link to={`${contract.id}`}>{index + 1}</Link>
                                </th>
                                <td className="px-6 py-4 text-center text-white">
                                    {contract.data.projectName}
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
                                <td><ViewIcon onClick={() => {
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
                                }} className={''}></ChatIcon></td>
                            </tr>)
                        })}

                    </tbody>
                </table>
            </div>
            <div className="flex flex-col sm:hidden">
                {contractsTab ? generateContractsList() : generateDisputesList()}
            </div>
            <MobileNavbarPadding />

        </div >);
}


