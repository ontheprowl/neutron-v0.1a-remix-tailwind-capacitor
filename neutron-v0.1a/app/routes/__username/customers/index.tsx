import { Link, useOutletContext } from "@remix-run/react";
import { useState } from "react";
import NucleiPagination from "~/components/inputs/pagination/NucleiPagination";
import NucleiZeroState from "~/components/layout/NucleiZeroState";
import { CustomerOnTimeStatus } from "~/components/layout/Statuses";
import ErrorIcon from '~/assets/images/errorIcon.svg';
import SortButton from "~/components/inputs/buttons/SortButton";




export default function CustomersList() {


    const { metadata, businessData } = useOutletContext();

    const [currTab, setCurrTab] = useState('All')
    // const currView = currTab == "Outstanding" ? outstandingCustomers : allCustomers;
    const currView = businessData?.customers;


    // * State for sort
    const [currSortType, setCurrSort] = useState('vendor_name');
    const [sortAsc, setSortAsc] = useState(false);

    const currSort = function (sortType: string) {

        switch (sortType) {
            case 'vendor_name':
                return (a, b) => {
                    if (a?.vendor_name < b?.vendor_name) {
                        return sortAsc ? 1 : -1
                    } else {
                        return sortAsc ? -1 : 1
                    }
                }
            case 'outstanding':
                return (a, b) => {
                    if (a?.outstanding_receivable_amount > b?.outstanding_receivable_amount) {
                        return sortAsc ? 1 : -1
                    } else {
                        return sortAsc ? -1 : 1
                    }
                }
            case 'payment_terms':
                return (a, b) => {
                    if (a?.payment_terms > b?.payment_terms) {
                        return sortAsc ? 1 : - 1
                    } else {
                        return sortAsc ? -1 : 1
                    }
                }
            case 'rating':
                return (a, b) => {
                    if (a?.payment_rating > b?.payment_rating) {
                        return sortAsc ? 1 : - 1
                    } else {
                        return sortAsc ? -1 : 1
                    }
                }
            default:
                return (a, b) => {
                    if (a?.outstanding_receivable_amount > b.outstanding_receivable_amount) {
                        return -1
                    } else {
                        return 1
                    }
                }
        }

    };


    const [startOffset, setStart] = useState(0);
    const [endOffset, setEnd] = useState(50)
    const [filter, setFilter] = useState('');

    return (
        <div className=" h-full flex flex-col space-y-4">
            <div className="flex flex-row justify-between">
                <div id="page_title" className="flex flex-col">
                    <h1 className="text-base">Customers List</h1>
                    <span className="text-neutral-base text-sm font-gilroy-medium"> Home - Customers</span>
                </div>
                {/* <button className="bg-primary-base text-white hover:bg-primary-dark transition-all rounded-lg p-3">
                    Add Customers
                </button> */}
            </div>
            {currView?.length > 0 ?
                <div id="invoices_table" className="bg-white shadow-lg rounded-xl justify-start h-full flex flex-col">
                    <div id="table_functions" className="flex flex-row items-center  pl-5 py-3 pr-5   justify-between h-auto">
                        <div className="flex flex-row bg-[#f5f5f5]  h-10 space-x-4 p-2 w-2/5  rounded-lg">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17.5 17.5L14.5834 14.5833M16.6667 9.58333C16.6667 13.4954 13.4954 16.6667 9.58333 16.6667C5.67132 16.6667 2.5 13.4954 2.5 9.58333C2.5 5.67132 5.67132 2.5 9.58333 2.5C13.4954 2.5 16.6667 5.67132 16.6667 9.58333Z" stroke="#6F6E6E" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>

                            <input onChange={(e) => {
                                setFilter(e.currentTarget.value);
                            }} type="text" placeholder="Search for a customer by company or contact name" className="text-sm w-full bg-transparent text-neutral-dark placeholder:text-neutral-dark focus:border-transparent outline-none " />

                        </div>
                        <div className="flex flex-row space-x-4 w-2/5 p-2  items-center justify-end">
                            <div className="flex flex-row space-x-4 text-sm">
                                <button onClick={() => {
                                    setCurrTab('All');
                                    setCurrSort('vendor_name');
                                }} className={`underline-offset-4 hover:opacity-75 transition-all ${currTab == "All" ? 'underline decoration-primary-dark text-primary-dark' : ''}`}>All</button>
                                <button onClick={() => {
                                    setCurrTab('Outstanding');
                                    setCurrSort('outstanding');
                                }} className={`underline-offset-4 hover:opacity-75  transition-all ${currTab == "Outstanding" ? 'underline decoration-primary-dark text-primary-dark' : ''}`}>Outstanding</button>
                            </div>
                            {/* <div className="flex flex-row space-x-4 items-center">
                                <FilterButton />
                                <ExportButton />
                                <DeleteButton />
                            </div> */}
                        </div>
                    </div>

                    <div className={`hidden sm:table p-3 rounded-xl h-[75vh] max-h-[75vh] mt-1`}>
                        <table className={`w-full max-h-[70vh] overflow-y-scroll sm:block table-auto text-xs text-left text-black`}>

                            <tbody className='sm:block table-row-group'>
                                <tr className={` bg-white border-b text-secondary-text sm:flex sm:flex-row w-full transition-all sticky top-0  z-20`}>

                                    <th scope="row" className="px-2 py-4 w-full font-medium text-center whitespace-nowrap">
                                        <div className="flex flex-row space-x-2 items-center">
                                            <input type="checkbox"></input>
                                            <h1 className={`hover:opacity-80 cursor-pointer ${currSortType == "vendor_name" ? 'text-black' : ''} hover:text-black transition-colors`} onClick={(e) => {
                                                setCurrSort('vendor_name')
                                            }}>COMPANY NAME</h1>
                                            {currSortType == "vendor_name" && <SortButton onClick={() => {
                                                setSortAsc(!sortAsc)
                                            }} expanded={sortAsc}></SortButton>}
                                        </div>

                                    </th>
                                    <th scope="row" className="px-2 text-center py-4 w-full font-medium  whitespace-nowrap">
                                        POINT OF CONTACT
                                    </th>
                                    <th scope="row" className="px-2 py-4 w-full font-medium text-center ">
                                        <div className="flex flex-row space-x-2 justify-center items-center">
                                            <h1 className={`hover:opacity-80 cursor-pointer ${currSortType == "outstanding" ? 'text-black' : ''} hover:text-black transition-colors`} onClick={(e) => {
                                                setCurrSort('outstanding')
                                            }}>OUTSTANDING BALANCE</h1>
                                            {currSortType == "outstanding" && <SortButton onClick={() => {
                                                setSortAsc(!sortAsc)
                                            }} expanded={sortAsc}></SortButton>}
                                        </div>
                                    </th>
                                    <th scope="row" className="px-2 py-4 w-full font-medium text-center  ">
                                        <div className="flex flex-row space-x-2 justify-center items-center">
                                            <h1 className={`hover:opacity-80 cursor-pointer ${currSortType == "payment_terms" ? 'text-black' : ''} hover:text-black transition-colors`} onClick={(e) => {
                                                setCurrSort('payment_terms')
                                            }}>PAYMENT TERMS (CREDIT)</h1>
                                            {currSortType == "payment_terms" && <SortButton onClick={() => {
                                                setSortAsc(!sortAsc)
                                            }} expanded={sortAsc}></SortButton>}
                                        </div>
                                    </th>
                                    <th scope="row" className="px-2 py-4 w-full font-medium text-center  whitespace-nowrap">
                                        <div className="flex flex-row space-x-2 justify-center items-center">
                                            <h1 className={`hover:opacity-80 cursor-pointer ${currSortType == "rating" ? 'text-black' : ''} hover:text-black transition-colors`} onClick={(e) => {
                                                setCurrSort('rating')
                                            }}>RATING</h1>
                                            {currSortType == "rating" && <SortButton onClick={() => {
                                                setSortAsc(!sortAsc)
                                            }} expanded={sortAsc}></SortButton>}
                                        </div>
                                    </th>
                                </tr>
                                {currView.filter((customer) => {
                                    return (customer?.vendor_name?.toLowerCase()?.includes(filter.toLowerCase()) || customer?.first_name?.toLowerCase()?.includes(filter.toLowerCase()) || customer?.last_name?.toLowerCase()?.includes(filter.toLowerCase()));
                                }).sort(currSort(currSortType)).filter((customer) => currTab == "Outstanding" && customer?.outstanding_receivable_amount > 0 || currTab == "All").slice(startOffset, endOffset).map((customer, index) => {
                                    return (
                                        <tr key={index} className={`border-b border-dashed sm:flex sm:flex-row sm:justify-evenly h-24 sm:items-center w-full border-gray-400 dark:bg-gray-800 dark:border-gray-700 transition-all hover:bg-bg-primary-dark hover:bg-opacity-50 hover:border-primary-dark`}>
                                            <td scope="row" className="px-2 py-4 w-full font-gilroy-regular text-left">
                                                <div className="flex flex-row w-auto justify-start items-center space-x-2">
                                                    <input type="checkbox"></input>
                                                    <Link to={`${customer?.contact_id}/overview`} preventScrollReset><span className="w-full break-words underline decoration-transparent hover:decoration-black underline-offset-1">{customer?.vendor_name}</span></Link>
                                                    {(customer?.mobile == "" || customer?.email == "" || (customer?.firstName || customer?.lastName)) && <img src={ErrorIcon} alt="customer_details_missing_icon"></img>}
                                                </div>
                                            </td>
                                            <td className="px-2 py-4 w-full text-center flex flex-col space-y-2  ">
                                                {customer?.first_name + " " + customer?.last_name}
                                                <span className=" text-secondary-text text-md">{customer?.email}</span>
                                                <span className=" text-secondary-text text-md">{customer?.mobile}</span>

                                            </td>
                                            <td className="px-2 py-4 font-gilroy-regular  w-full text-center ">
                                                Rs. {Number(customer?.outstanding_receivable_amount).toLocaleString('en-IN')}
                                            </td>
                                            <td className="px-2 py-4 font-gilroy-regular  w-full text-center  ">
                                                {customer?.payment_terms}
                                            </td>
                                            <td className="  px-2 py-4 w-full font-gilroy-regular  text-center">
                                                {customer?.payment_rating == "on-time" ? <CustomerOnTimeStatus /> : 'Not enough data'}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex flex-row justify-end items-center px-3 mb-2 h-12 w-full self-end" id="invoices_pagination">
                        {/* <select className="bg-[#f5f5f5] p-2 rounded-xl text-secondary-text outline-none">
                            <option value="" disabled selected className="hidden">Actions</option>
                            <option>View</option>
                            <option>Delete</option>
                        </select> */}
                        <NucleiPagination items={currView} startPage={0} pageSize={50} pagesDisplayed={2} startState={[startOffset, setStart]} endState={[endOffset, setEnd]} />
                    </div>
                </div> :
                <NucleiZeroState entity="customers" />}


        </div >
    )
}