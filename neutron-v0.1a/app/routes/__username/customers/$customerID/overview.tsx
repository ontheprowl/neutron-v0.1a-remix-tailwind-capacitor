import { Link, useLocation, useOutletContext } from "@remix-run/react";
import { useState } from "react";
import DeleteButton from "~/components/inputs/buttons/DeleteButton";
import ExportButton from "~/components/inputs/buttons/ExportButton";
import FilterButton from "~/components/inputs/buttons/FilterButton";
import { InvoiceClearedStatus } from "~/components/layout/Statuses";



export default function CustomerOverview() {


    const { metadata, businessData } = useOutletContext();

    const { pathname } = useLocation();

    const [page, setPage] = useState(0);

    return (

        <>
            <div id="invoices_table" className="bg-white shadow-lg rounded-xl justify-between h-full flex flex-col">
                <div id="table_functions" className="flex flex-row items-center  p-5 py-1  justify-between h-auto">
                    <div className="flex flex-row bg-[#f5f5f5]  h-10 space-x-4 p-2 w-1/4  rounded-lg">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.5 17.5L14.5834 14.5833M16.6667 9.58333C16.6667 13.4954 13.4954 16.6667 9.58333 16.6667C5.67132 16.6667 2.5 13.4954 2.5 9.58333C2.5 5.67132 5.67132 2.5 9.58333 2.5C13.4954 2.5 16.6667 5.67132 16.6667 9.58333Z" stroke="#6F6E6E" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>

                        <input type="text" placeholder="Search for an invoice" className="w-full bg-transparent text-neutral-dark placeholder:text-neutral-dark focus:border-transparent outline-none " />

                    </div>
                    <div className="flex flex-row space-x-4 w-1/3 items-center justify-center">
                        <div className="flex flex-row space-x-4">
                            <button className="text-primary-dark underline underline-offset-2 decoration-primary-dark">All</button>
                            <button>Paid</button>
                        </div>
                        <div className="flex flex-row space-x-4 items-center">
                            <FilterButton />
                            <ExportButton />
                            <DeleteButton />
                        </div>
                    </div>
                </div>

                <div className={`hidden sm:table p-3 rounded-xl h-[75vh] max-h-[75vh] mt-1`}>
                    <table className={`w-full max-h-[70vh] overflow-y-scroll sm:block table-auto text-sm text-left text-black`}>

                        <tbody className='sm:block table-row-group'>
                            <tr className={` border-b text-secondary-text sm:flex sm:flex-row w-full transition-all sticky top-0 pointer-events-none bg-bg-secondary-dark z-20  hover:bg-opacity-50  dark:hover:bg-gray-600`}>

                                <th scope="row" className="px-2 py-4 w-full font-medium text-center whitespace-nowrap">
                                    <div className="flex flex-row w-auto justify-start space-x-4">
                                        <input type="checkbox"></input>
                                        <h1>INVOICE NUMBER</h1>
                                    </div>
                                </th>
                                <th scope="row" className="px-2 text-left py-4 w-full font-medium  whitespace-nowrap">
                                    COMPANY NAME
                                </th>
                                <th scope="row" className="px-2 py-4 w-full font-medium text-center ">
                                    TOTAL AMOUNT
                                </th>
                                <th scope="row" className="px-2 py-4 w-full font-medium text-center  ">
                                    CREATED DATE
                                </th>
                                <th scope="row" className="px-2 py-4 w-full font-medium text-center  whitespace-nowrap">
                                    DUE DATE
                                </th>
                                <th scope="row" className="px-2 py-4  w-full font-medium text-center  whitespace-nowrap">
                                    STATUS
                                </th>
                                <th scope="row" className="px-2 py-4  w-full font-medium text-center  whitespace-nowrap">
                                    ACTIONS
                                </th>
                            </tr>
                            <tr className={`border-b border-dashed sm:flex sm:flex-row sm:justify-evenly sm:items-center w-full border-gray-400 dark:bg-gray-800 dark:border-gray-700 transition-all hover:bg-bg-primary-dark hover:bg-opacity-50 hover:border-primary-dark`}>
                                <td scope="row" className="px-2 py-4 w-full font-gilroy-regular text-center  whitespace-nowrap">
                                    <div className="flex flex-row w-auto justify-start space-x-4">
                                        <input type="checkbox"></input>
                                        <h1>#90905454</h1>
                                    </div>
                                </td>
                                <td className="px-2 py-4 w-full text-left flex flex-col space-y-2  ">
                                    Wayne Enterprises
                                    <span className=" text-secondary-text text-md">Lucius Fox</span>
                                </td>
                                <td className="px-2 py-4 font-gilroy-regular  w-full text-center ">
                                    Rs.20,000
                                </td>
                                <td className="px-2 py-4 font-gilroy-regular  w-full text-center ">
                                    14 Dec 2020
                                </td>
                                <td className="  px-2 py-4 w-full font-gilroy-regular  text-center justify-center items-center flex-row flex ">
                                    14 Dec 2020
                                </td>
                                <td className="  px-2 py-4 w-full font-gilroy-regular justify-center flex flex-row  text-center">
                                    <InvoiceClearedStatus />

                                </td>
                                <td className='px-2 py-4 w-full min-w-[160px] flex flex-row justify-center '>
                                    <select className="bg-[#f5f5f5] p-3 rounded-xl text-secondary-text outline-none">
                                        <option value="" disabled selected className="hidden">Actions</option>
                                        <option>View</option>
                                        <option>Delete</option>
                                    </select>
                                </td>


                            </tr>


                        </tbody>
                    </table>
                </div>
                <div className="flex flex-row justify-between items-center px-3 mb-2 h-12 w-full self-end" id="invoices_pagination">
                    <select className="bg-[#f5f5f5] p-2 rounded-xl text-secondary-text outline-none">
                        <option value="" disabled selected className="hidden">Actions</option>
                        <option>View</option>
                        <option>Delete</option>
                    </select>
                    <div className="flex flex-row space-x-4  font-gilroy-medium items-center">

                        <div className={`h-10 w-10 pl-4 pt-2 ${page == 0 ? 'bg-primary-base text-white' : 'bg-neutral-light text-black'} rounded-lg`}>1</div>
                        <div className={`h-10 w-10 pl-4 pt-2 ${page == 1 ? 'bg-primary-base text-white' : 'bg-neutral-light text-black'} rounded-lg`}>2</div>
                        <div className={`h-10 w-10 pl-4 pt-2 ${page == 2 ? 'bg-primary-base text-white' : 'bg-neutral-light text-black'} rounded-lg`}>3</div>
                        <div className={`h-10 w-10 pl-4 pt-2 ${page == 3 ? 'bg-primary-base text-white' : 'bg-neutral-light text-black'} rounded-lg`}>4</div>
                        <div className={`h-10 w-10 pl-4 pt-2 ${page == 4 ? 'bg-primary-base text-white' : 'bg-neutral-light text-black'} rounded-lg`}>5</div>
                    </div>
                </div>
            </div>
        </>
    )

}