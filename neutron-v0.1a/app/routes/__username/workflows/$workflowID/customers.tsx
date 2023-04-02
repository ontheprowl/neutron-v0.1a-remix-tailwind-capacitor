import { Link, useOutletContext } from "@remix-run/react";
import { useState } from "react";
import DeleteButton from "~/components/inputs/buttons/DeleteButton";
import EditButton from "~/components/inputs/buttons/EditButton";
import NucleiPagination from "~/components/inputs/pagination/NucleiPagination";
import { CustomerOnTimeStatus, InvoiceClearedStatus } from "~/components/layout/Statuses";







export default function CustomerDetails() {

    const workflow: { customers: Array<{ [x: string]: any }> } = useOutletContext();

    console.log(workflow?.customers)

    const [startOffset, setStart] = useState(0);
    const [endOffset, setEnd] = useState(50);
    const [filter, setFilter] = useState('');

    const currSort = (a, b) => {
        if (a?.outstanding_receivable_amount > b?.outstanding_receivable_amount) {
            return -1
        } else {
            return 1
        }
    };

    return <div id="workflow_customers_table" className="bg-white shadow-lg rounded-xl justify-between h-full flex flex-col">
        <div id="table_functions" className="flex flex-row items-center  p-5 py-1  justify-between h-auto">
            <div className="flex flex-row bg-[#f5f5f5]  h-10 space-x-4 p-2 w-1/4  rounded-lg">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.5 17.5L14.5834 14.5833M16.6667 9.58333C16.6667 13.4954 13.4954 16.6667 9.58333 16.6667C5.67132 16.6667 2.5 13.4954 2.5 9.58333C2.5 5.67132 5.67132 2.5 9.58333 2.5C13.4954 2.5 16.6667 5.67132 16.6667 9.58333Z" stroke="#6F6E6E" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                </svg>

                <input type="text" onChange={(e) => {
                    setFilter(e.currentTarget.value);
                }} placeholder="Search for a customer" className="w-full bg-transparent text-neutral-dark placeholder:text-neutral-dark focus:border-transparent outline-none " />

            </div>
            <div className="flex flex-row  space-x-4 w-1/3 items-center justify-start">

                {/* <div className="flex flex-row space-x-4 items-center">
                    <EditButton />
                    <DeleteButton />
                </div> */}
            </div>
        </div>

        <div className={`hidden sm:table p-3 rounded-xl h-[75vh] max-h-[75vh] mt-1`}>
            <table className={`w-full max-h-[70vh] overflow-y-scroll sm:block table-auto text-sm text-left text-black`}>

                <tbody className='sm:block table-row-group'>
                    <tr className={` bg-white border-b text-secondary-text sm:flex sm:flex-row w-full transition-all sticky top-0 pointer-events-none bg-bg-secondary-dark z-20  hover:bg-opacity-50  dark:hover:bg-gray-600`}>

                        <th scope="row" className="px-2 py-4 w-full font-medium text-left whitespace-nowrap">
                            <div className="flex flex-row w-auto justify-start space-x-4">
                                <input type="checkbox"></input>
                                <h1>COMPANY NAME</h1>

                            </div>
                        </th>
                        <th scope="row" className="px-2 text-left py-4 w-full font-medium  whitespace-nowrap">
                            POINT OF CONTACT
                        </th>
                        <th scope="row" className="px-2 py-4 w-full font-medium text-center ">
                            STARTING DATE
                        </th>
                        <th scope="row" className="px-2 py-4 w-full font-medium text-center  ">
                            STATUS
                        </th>
                    </tr>
                    {workflow?.customers?.filter((customer) => {
                        return (customer?.data?.vendor_name?.toLowerCase().includes(filter.toLowerCase()) || customer?.data?.first_name?.toLowerCase()?.includes(filter.toLowerCase()) || customer?.data?.last_name?.toLowerCase()?.includes(filter.toLowerCase()));
                    }).sort(currSort).slice(startOffset, endOffset).map((customer, index) => {

                        return (
                            <tr key={customer?.id} className={`border-b border-dashed h-24 sm:flex sm:flex-row sm:justify-evenly sm:items-center w-full border-gray-400 dark:bg-gray-800 dark:border-gray-700 transition-all hover:bg-bg-primary-dark hover:bg-opacity-50 hover:border-primary-dark`}>
                                <td scope="row" className="px-2 py-4 w-full font-gilroy-regular text-left">
                                    <div className="flex flex-row w-auto justify-start items-center space-x-4">
                                        <input type="checkbox"></input>
                                        <Link to={`/customers/${customer?.id}/overview`} preventScrollReset><span className="w-full break-words ">{customer?.data?.vendor_name}</span></Link>
                                    </div>
                                </td>
                                <td className="px-2 py-4 w-full text-left flex flex-col space-y-2  ">
                                    {customer?.data?.first_name + " " + customer?.data?.last_name}
                                    <span className=" text-secondary-text text-md">{customer?.data?.email}</span>
                                    <span className=" text-secondary-text text-md">{customer?.data?.mobile}</span>

                                </td>
                                <td className="px-2 py-4 font-gilroy-regular  w-full text-center ">
                                    {customer?.data?.dunning_starts_on}
                                </td>
                                <td className="  px-2 py-4 w-full font-gilroy-regular justify-center flex flex-row  text-center">
                                    {customer?.data?.dunning_starts_on ? customer?.data?.is_paused ? <div className="text-warning-dark bg-warning-light p-3 font-gilroy-medium rounded-xl">PAUSED</div> : <div className="text-success-dark bg-success-light p-3 rounded-xl font-gilroy-medium">RUNNING</div> : <div className="text-error-dark bg-error-light p-3 rounded-xl font-gilroy-medium">DETAILS MISSING</div>}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
        <div className="flex flex-row justify-between items-center px-3 mb-2 h-12 w-full self-end" id="invoices_pagination">
            {/* <select className="bg-[#f5f5f5] p-2 rounded-xl text-secondary-text outline-none">
                <option value="" disabled selected className="hidden">Actions</option>
                <option>View</option>
                <option>Delete</option>
            </select> */}
            <NucleiPagination items={workflow?.customers} startPage={0} pageSize={50} pagesDisplayed={2} startState={[startOffset, setStart]} endState={[endOffset, setEnd]} />
        </div>
    </div>
}