import { useNavigate } from '@remix-run/react';
import * as React from 'react'
import EscrowSummary from '~/components/escrow/EscrowSummary';
import { primaryGradientDark, secondaryGradient } from '~/utils/neutron-theme-extensions';
import { formatDateToReadableString } from '~/utils/utils';
import ContractStats from '~/components/contracts/ContractStats';
import type { LoaderFunction } from '@remix-run/server-runtime';
import { json } from '@remix-run/server-runtime';
import { testContractsData, testDisputesData } from '~/utils/testData.server';
import { useLoaderData } from '@remix-run/react';
import PlaceholderDP from "~/assets/images/kartik.png"
import PlaceholderCover from "~/assets/images/sample_cover.png"
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '~/firebase/neutron-config';

export const loader: LoaderFunction = async ({ request }) => {

    return json({ contracts: testContractsData, disputes: testDisputesData });
}



export default function Dashboard() {

    const [user, loading, error] = useAuthState(auth);


    const userData = useLoaderData();

    console.log(userData)


    let navigate = useNavigate();

    return (
        <div className="flex flex-row h-full">
            <div id="user-profile-panel" className="w-96 flex flex-col bg-[#202020] justify-evenly">
                <div className="flex flex-col items-stretch">
                    <img alt="cover" className="w-auto h-auto min-h-48 object-cover rounded-bl-[50px] rounded-br-[50px] rounded-tl-[50px] " src={PlaceholderCover}></img>
                    <img alt="profile" src={PlaceholderDP} className="h-32 w-32 translate-y-[-50px] bg-[#e5e5e5] border-8 border-solid border-black rounded-full self-center object-contain"></img>
                    <div className='flex flex-col justify-between space-y-5 translate-y-[-28px]'>
                        <h1 className="prose prose-lg text-white self-center">Harvey Spector</h1>
                        <p className="prose prose-lg text-white self-center"> UI Designer</p>
                    </div></div>
                <EscrowSummary></EscrowSummary>
                <ContractStats></ContractStats>
                <button
                    className="m-4 h-16 p-3 rounded-lg bg-accent-dark w-auto text-black transition-all hover:scale-105"
                    onClick={() => navigate('/session/contracts/create')}
                >
                    Create Contract
                </button>
            </div>
            <div id="activity-details-summary" className="flex flex-col w-full bg-bg-primary-dark">
                <div className='flex flex-row m-6 justify-between'>
                    <div className="flex flex-col">
                        <article className="prose">
                            <h2 className="text-white prose prose-lg">Welcome {user?.email}</h2>
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
                <div id="current-project-summary" className={`flex flex-row m-6 w-auto rounded-xl h-auto min-h-52 ${primaryGradientDark} justify-between items-center`}>
                    <div className="flex flex-col m-5 w-auto">
                        <h2 className="prose prose-xl text-white">
                            Current Project: Neutron Money UI Design
                        </h2>
                        <p className="prose prose-md text-white">
                            Perform user research on freelancers and client enterprises to find out optimal Users and create user personas. Then ideate wireframes and map user flows. Once the product wireframes and flows are finalized, Design User Interface and add suible UX to the design.
                        </p>
                        <h2 className="prose prose-lg text-white"> Current Status : IN PROGRESS </h2>
                    </div>
                    <div className={`${secondaryGradient} h-40 w-36 m-6 rounded-xl`}>
                        <div className="flex flex-col m-5 mt-10 text-center">
                            <h1 className="prose prose-sm text-white">Next Milestone</h1>
                            <h1 className="prose prose-xl text-white"> May 15</h1>
                        </div>
                    </div>

                </div>
                <div id="contracts-and-disputes-summary" className="flex w-auto h-full flex-row m-6 mt-2 space-x-7">
                    <div className="flex flex-col rounded-xl h-auto w-full bg-[#F5EBFF] text-left justify-between">
                        <div>
                            <h1 className="prose prose-xl m-4 text-black">Contracts</h1>
                            <ul className="m-4 space-y-3">
                                {userData.contracts.map((contract) => {
                                    return (
                                        <li key={contract.projectName}>
                                            <div className="flex flex-row justify-between">
                                                <div className="flex flex-col">
                                                    <h1 className="prose prose-lg text-black">{contract.projectName}</h1>
                                                    <h3 className="prose prose-md text-black opacity-50">{contract.duration}</h3>
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-white bg-accent-dark text-center rounded-full p-3">{contract.status}</h3>
                                                </div>
                                            </div>
                                            <br></br>
                                            <hr className="w-full"></hr>
                                        </li>)
                                })}
                            </ul>
                        </div>
                        <button
                            className="self-center m-4 h-16 p-3 rounded-lg bg-accent-dark w-36 text-black transition-all hover:scale-105"
                            onClick={() => navigate('/session/contracts/create')}
                        >
                            Create Contract
                        </button>
                    </div>
                    <div className="flex flex-col rounded-xl h-auto w-full bg-[#F5EBFF] text-left justify-between">
                        <div>
                            <h1 className="prose prose-xl m-4 text-black">Disputes</h1>
                            <ul className="m-4 space-y-3">
                                {userData.disputes.map((dispute) => {
                                    return (
                                        <li key={dispute.disputeName}>
                                            <div className="flex flex-row justify-between">
                                                <div className="flex flex-col">
                                                    <h1 className="prose prose-lg text-black">{dispute.disputeName}</h1>
                                                    <h3 className="prose prose-md text-black opacity-50">{dispute.duration}</h3>
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-white bg-accent-dark text-center rounded-full p-3">{dispute.status}</h3>
                                                </div>
                                            </div>
                                            <br></br>
                                            <hr className="w-full"></hr>
                                        </li>)
                                })}
                            </ul>
                        </div>

                        <button
                            className="self-center m-4 h-16 p-3 rounded-lg bg-accent-dark w-36 text-black transition-all hover:scale-105"
                            onClick={() => navigate('/session/contracts/create')}
                        >
                            Create Contract
                        </button>
                    </div>
                </div>

            </div>
        </div>);

}