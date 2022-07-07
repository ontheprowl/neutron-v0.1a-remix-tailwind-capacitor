import { Link, useFetcher, useNavigate, useSubmit } from '@remix-run/react';
import * as React from 'react'
import EscrowSummary from '~/components/escrow/EscrowSummary';
import { primaryGradientDark, secondaryGradient } from '~/utils/neutron-theme-extensions';
import { formatDateToReadableString } from '~/utils/utils';
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
import { Contract } from '~/models/contracts';
import Accordion from '~/components/layout/Accordion'
import ViewIcon from '~/components/inputs/ViewIcon';
import EditIcon from '~/components/inputs/EditIcon';
import DeleteIcon from '~/components/inputs/DeleteIcon';
import ChatIcon from '~/components/inputs/ChatIcon';
import { motion } from 'framer-motion';
import MobileNavbarPadding from '~/components/layout/MobileNavbarPadding';
import PurpleWhiteButton from '~/components/inputs/PurpleWhiteButton';
import { getSingleDoc } from '~/firebase/queries.server';
import { requireUser } from '~/session.server';
import { UserState } from '~/models/user';


export const loader: LoaderFunction = async ({ request }) => {

    // console.log(auth.currentUser)
    const session = await requireUser(request,true);

    if(!session){
        return redirect('/login')
    }
    console.log('this is what hte metadata is looking like...')
    console.dir(session.metadata)
    const contractsQuery = query(collection(firestore, 'contracts'), limit(5));
    //TODO : Make metadata fetching dynamic
    // const disputesQuery = query(collection(firestore, 'disputes'), limit(5));
    const contractsData = await getDocs(contractsQuery);
    // const disputesData = await getDocs(disputesQuery)
    return json({
        contracts: contractsData.docs.map((document) => {
            return { id: document.id, ...document.data() };
        }).sort((a, b) => { return b.startDate - a.startDate }), disputes: [],
        metadata: session.metadata
    });
}


export const action: ActionFunction = async ({ request }) => {

    const data = await request.formData();
    const id = data.get('id');
    console.log(data);
    const docRef = doc(firestore, `contracts/${id}`);
    await deleteDoc(docRef);
    console.log(`Contract deleted from firestore with id ${id}`);
    return redirect('/session/contracts')

}


export default function Dashboard() {

    const fetcher = useFetcher();
    const [expanded, setExpanded] = React.useState(false);
    const submit = useSubmit();
    const userData: { contracts: Contract[], disputes: any[], metadata: any } = useLoaderData();

    console.log(userData)
    const currentContract: Contract = userData.contracts[0]
    const currentUserData : UserState = userData.metadata;


    let navigate = useNavigate();

    return (
        <div className="flex flex-col sm:flex-row h-full ">
            <div id="user-profile-panel" className="w-full sm:w-96 flex flex-col bg-bg-primary-dark sm:bg-bg-secondary-dark justify-evenly ">
                <div className="hidden sm:flex sm:flex-col items-stretch">
                    {/* <img alt="cover" className="w-auto h-auto min-h-48 object-cover rounded-bl-[50px] rounded-br-[50px] rounded-tl-[50px] " src={PlaceholderCover}></img> */}
                    <img alt="profile" src={PlaceholderDP} className="h-32 w-32 mt-16 translate-y-[-50px] bg-[#e5e5e5] border-8 border-solid border-black rounded-full self-center object-contain"></img>
                    <div className='flex flex-col justify-between space-y-5 translate-y-[-28px]'>
                        <h1 className="prose prose-lg text-white self-center">{currentUserData.name}</h1>
                        <p className="prose prose-lg text-white self-center"> {currentUserData.designation}</p>
                    </div>
                </div>
                <Accordion label={<motion.div className={`rounded-xl text-left p-4`}>
                    <motion.h2 className='prose prose-lg text-white text-center sm:text-left'>Total Funds</motion.h2>
                    <motion.h1 className="prose prose-lg text-white text-center sm:text-right"> {currentUserData?.funds?.totalFunds}</motion.h1>
                </motion.div>} className={`${primaryGradientDark}  h-auto rounded-xl mt-4 text-left p-4`} content={<EscrowSummary funds={currentUserData.funds}></EscrowSummary>} expanded={expanded} setExpanded={setExpanded}></Accordion>
                <ContractStats clients={currentUserData.clients} contracts={currentUserData.contracts}></ContractStats>
                <button
                    className="m-4 h-16 p-3 rounded-full bg-accent-dark w-auto text-black transition-all hover:scale-105"
                    onClick={() => navigate('/session/contracts/create')}
                >
                    Create Contract
                </button>
            </div>
            <div id="activity-details-summary" className="flex flex-col w-full bg-bg-primary-dark">
                <div className='hidden sm:flex flex-row m-6 justify-between'>
                    <div className="flex flex-col">
                        <article className="prose">
                            <h2 className="text-white prose prose-lg">Welcome {currentUserData?.email}</h2>
                            <p className="text-white prose prose-sm">{formatDateToReadableString()}</p>
                        </article>

                    </div>
                    <div className="flex items-center w-[692px]">
                        <label htmlFor="simple-search" className="sr-only">Search</label>
                        <div className="relative w-full ">
                            <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                                <svg className="w-5 h-5 text-white dark:text-black" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path></svg>
                            </div>
                            <input type="text" id="simple-search" className="p-5 bg-bg-primary-dark border border-gray-300 text-gray-900 text-sm rounded-lg placeholder-white block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white " placeholder="Search through contracts" required />

                        </div>
                    </div>
                    <div id="user-action-buttons">
                        <div>

                        </div>
                    </div>
                </div>
                <div id="current-project-summary" className={`flex font-gilroy-regular flex-col sm:flex-row m-6 mt-2 w-auto rounded-xl h-auto min-h-52 ${primaryGradientDark} justify-between items-center`}>
                    <div className="flex flex-col m-2 p-5 w-auto text-center">
                        <h2 className="prose prose-xl mb-3 text-white">
                            Current Project: {currentContract.projectName}
                        </h2>
                        <p className="prose prose-md text-white sm:text-left">
                            {currentContract.description}
                        </p>
                        <h2 className="prose prose-lg text-white mt-5 sm:text-left"> Current Status : {currentContract.status} </h2>
                        <PurpleWhiteButton onClick={() => {
                            // const payload = {
                            //     customer_details: {
                            //         customer_id: "hi3",
                            //         customer_email: "grimmjow2365@gmail.com",
                            //         customer_phone: "8390608693"
                            //     },
                            //     order_id: "1246",
                            //     // order_meta: {
                            //     //     return_url: "https://192.168.0.107:3001",
                            //     //     order_id: '1242',
                            //     //     order_token: '23123213213'
                            //     // },
                            //     order_amount: 222,
                            //     order_currency: "INR"
                            // }
                            // const formData = new FormData();
                            // formData.append("payload", JSON.stringify(payload))
                            fetcher.submit({},{ method: 'post', action: "/logout" })
                        }} text="Pay Contract" />                    </div>
                    <div className={`${secondaryGradient} hidden sm:flex h-40 w-36 m-6 rounded-xl`}>
                        <div className="flex flex-col m-5 mt-10 text-center">
                            <h1 className="prose prose-sm text-white">Next Milestone</h1>
                            <h1 className="prose prose-md text-white">{currentContract.hasMilestones ? currentContract.milestones : "Project has no milestones"}</h1>
                        </div>
                    </div>

                </div>
                <MobileNavbarPadding />

                <div className={`bg-[#202020] hidden sm:block p-3 rounded-xl border-2 border-solid border-accent-dark  h-full m-6`}>
                    <table className=" w-full h-auto text-sm text-left text-gray-500 dark:text-gray-400">

                        <tbody>
                            {userData.contracts.map((contract: Contract, index: number) => {
                                console.log()
                                return (<tr key={contract.id} className={` border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gradient-to-br from-violet-700 via-violet-400 to-violet-500 hover:bg-opacity-50 dark:hover:bg-gray-600`}>

                                    <th scope="row" className="px-6 py-4 font-medium text-center text-white dark:text-white whitespace-nowrap">
                                        <Link to={`/session/contracts/${contract.id}`}>{index + 1}</Link>
                                    </th>
                                    <td className="px-6 py-4 text-center text-white">
                                        {contract.projectName}
                                        <br></br>
                                        {contract.clientName}
                                    </td>
                                    <td className="px-6 py-4 text-center text-white">
                                        {contract.totalValue}
                                        <br></br>
                                        {contract.isSigned ? formatDateToReadableString(contract.signedDate) : formatDateToReadableString(contract.startDate)}

                                    </td>
                                    <td className="px-6 py-4">
                                        <h3 className="font-medium text-black bg-gray-100 text-center rounded-lg p-1">Draft</h3>
                                    </td>
                                    <td><ViewIcon onClick={() => {
                                        navigate(`/session/contracts/${contract.id}`)
                                    }} className={''}></ViewIcon></td>
                                    <td><EditIcon onClick={function (event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
                                        throw new Error('Function not implemented.');
                                    }} className={''}></EditIcon></td>
                                    <td><DeleteIcon onClick={(e) => {
                                        let data = new FormData();
                                        if (contract.id) {
                                            data.append('id', contract.id);
                                            submit(data,
                                                { method: 'post' });
                                        }

                                    }} className={''}></DeleteIcon></td>
                                    <td><ChatIcon onClick={function (event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
                                        throw new Error('Function not implemented.');
                                    }} className={''}></ChatIcon></td>
                                </tr>)
                            })}

                        </tbody>
                    </table>
                </div>

            </div>
        </div>);

}