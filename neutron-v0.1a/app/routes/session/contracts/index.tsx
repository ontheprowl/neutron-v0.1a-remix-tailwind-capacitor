import { useNavigate, useLoaderData, Outlet, Link } from '@remix-run/react'
import { LoaderFunction } from '@remix-run/server-runtime';
import * as React from 'react'
import { json } from 'remix-utils';
import { firestore } from '../../../firebase/neutron-config';
import { useCollection, useCollectionData } from 'react-firebase-hooks/firestore'
import { collection, getDocs } from 'firebase/firestore';
import { formatDateToReadableString } from '~/utils/utils';

export const loader: LoaderFunction = async ({ request }) => {

    const querySnapshot = await getDocs(collection(firestore, "contracts"));
    const result: any[] = []
    querySnapshot.forEach((doc) => {
        result.push({id:doc.id,data:doc.data()});
    });

    return json(result);

}



export default function ListContracts() {


    const contracts = useLoaderData();

    console.log(contracts);
    let navigate = useNavigate();

    return (
        <div className='flex flex-col space-y-8 m-4'>
            <div className=" flex flex-row justify-between">
                <div className="flex items-center w-[692px]">
                    <label htmlFor="simple-search" className="sr-only">Search</label>
                    <div className="relative w-full ">
                        <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                            <svg className="w-5 h-5 text-white dark:text-black" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path></svg>
                        </div>
                        <input type="text" id="simple-search" className="p-5 bg-bg-primary-dark border border-gray-300 text-gray-900 text-sm rounded-lg placeholder-white block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white " placeholder="Search through contracts" required />

                    </div>
                </div>
                <div>
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
            <div className='bg-secondary-dark rounded-lg h-[60vh] max-h-min-[540px]'><table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" className="px-6 py-3">
                            Contract ID
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Project Name
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Client Name
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Contract Value
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Delivery Date
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Redressal Window
                        </th>
                        <th scope="col" className="px-6 py-3">
                            <span className="sr-only">Draft Status</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {JSON.parse(contracts).map((contract: {id: string, data : any}) => {
                        return (<tr key={contract.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">

                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                <Link to={`${contract.id}`}>{contract.id}</Link>
                            </th>
                            <td className="px-6 py-4">
                                {contract.data.projectName}
                            </td>
                            <td className="px-6 py-4">
                                {contract.data.clientName}
                            </td>
                            <td className="px-6 py-4">
                                {contract.data.totalValue}
                            </td>
                            <td className="px-6 py-4">
                                {formatDateToReadableString(contract.data.endDate?.seconds)}
                            </td>
                            <td className="px-6 py-4">
                                14 days
                            </td>
                            <td className="px-6 py-4 text-right">
                                <h3 className="font-medium text-white bg-accent-dark text-center rounded-lg p-1">Draft</h3>
                            </td>
                        </tr>)
                    })}

                </tbody>
            </table></div>
        </div>);
}