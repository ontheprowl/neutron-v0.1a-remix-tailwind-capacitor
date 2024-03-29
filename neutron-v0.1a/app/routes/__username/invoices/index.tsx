import { useOutletContext } from "@remix-run/react";
import { useMemo, useState } from "react";
import DeleteButton from "~/components/inputs/buttons/DeleteButton";
import ExportButton from "~/components/inputs/buttons/ExportButton";
import FilterButton from "~/components/inputs/buttons/FilterButton";
import SortButton from "~/components/inputs/buttons/SortButton";
import NucleiPagination from "~/components/inputs/pagination/NucleiPagination";
import NucleiZeroState from "~/components/layout/NucleiZeroState";
import { InvoicePaidStatus, InvoiceOverdueStatus, InvoiceSentStatus } from "~/components/layout/Statuses";



export default function InvoicesList() {


    const { metadata, businessData } = useOutletContext();

    const receivables = useMemo(() => { return [...new Set([...businessData?.receivables['30d'], ...businessData?.receivables['60d'], ...businessData?.receivables['90d'], ...businessData?.receivables['excess']])] }, [businessData?.receivables])
    const paid = useMemo(() => { return [...new Set([...businessData?.paid['excess'], ...businessData?.paid['90d'], ...businessData?.paid['60d'], ...businessData?.paid['30d']])] }, [businessData?.paid])

    const invoices = [...receivables, ...paid];


    // * State for sort
    const [currTab, setCurrTab] = useState('All')
    const [currSortType, setCurrSort] = useState('balance');
    const [sortAsc, setSortAsc] = useState(false);

    const currSort = function (sortType: string) {

        switch (sortType) {
            case 'balance':
                return (a, b) => {
                    if (a?.balance > b.balance) {
                        return sortAsc ? 1 : -1
                    } else {
                        return sortAsc ? -1 : 1
                    }
                }
            case 'total':
                return (a, b) => {
                    if (a?.total > b?.total) {
                        return sortAsc ? 1 : -1
                    } else {
                        return sortAsc ? -1 : 1
                    }
                }
            case 'customer_name':
                return (a, b) => {
                    if (a?.customer_name > b?.customer_name) {
                        return sortAsc ? 1 : - 1
                    } else {
                        return sortAsc ? -1 : 1
                    }
                }
            case 'invoice_number':
                return (a, b) => {
                    if (a?.invoice_number > b?.invoice_number) {
                        return sortAsc ? 1 : - 1
                    } else {
                        return sortAsc ? -1 : 1
                    }
                }

            case 'date':
                return (a, b) => {
                    if (a?.date > b?.date) {
                        return sortAsc ? 1 : - 1
                    } else {
                        return sortAsc ? -1 : 1
                    }
                }

            case 'due_date':
                return (a, b) => {
                    if (a?.due_date > b?.due_date) {
                        return sortAsc ? 1 : - 1
                    } else {
                        return sortAsc ? -1 : 1
                    }
                }
            default:
                return (a, b) => {
                    if (a?.balance > b.balance) {
                        return -1
                    } else {
                        return 1
                    }
                }
        }

    };

    const currView = function (currTab: string) {
        switch (currTab) {
            case "All":
                return invoices;
            case "Overdue":
                return receivables.filter((receivable) => receivable?.status == "overdue");
            case "Paid":
                return paid;
            case "Sent":
                return receivables.filter((receivable) => receivable?.status == "sent");
        }
    }(currTab);



    const [startOffset, setStart] = useState(0);
    const [endOffset, setEnd] = useState(50)
    const [filter, setFilter] = useState('')


    return (
        <div className=" h-full flex flex-col space-y-4">
            <div className="flex flex-row justify-between">
                <div id="page_title" className="flex flex-col">
                    <h1 className="text-base">Invoices List</h1>
                    <span className="text-neutral-base font-gilroy-medium text-sm"> Home - Invoices</span>
                </div>
                {/* <button className="bg-primary-base text-white hover:bg-primary-dark transition-all rounded-lg p-3">
                    Add Invoices
                </button> */}
            </div>
            {invoices && invoices?.length > 0 ?
                <div id="invoices_table" className="bg-white shadow-lg rounded-xl justify-start h-full flex flex-col">
                    <div id="table_functions" className="flex flex-row items-center pl-5 pr-5 py-3  justify-between h-auto">
                        <div className="flex flex-row bg-[#f5f5f5]  h-10 space-x-4 p-2 w-1/4  rounded-lg">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17.5 17.5L14.5834 14.5833M16.6667 9.58333C16.6667 13.4954 13.4954 16.6667 9.58333 16.6667C5.67132 16.6667 2.5 13.4954 2.5 9.58333C2.5 5.67132 5.67132 2.5 9.58333 2.5C13.4954 2.5 16.6667 5.67132 16.6667 9.58333Z" stroke="#6F6E6E" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>

                            <input type="text" onChange={(e) => {
                                setFilter(e.currentTarget.value);
                            }} placeholder="Search for an invoice" className="w-full text-sm bg-transparent text-neutral-dark placeholder:text-neutral-dark focus:border-transparent outline-none " />

                        </div>
                        <div className="flex flex-row space-x-4 w-3/5 p-2 items-center justify-end">

                            <div className="flex flex-row space-x-4 text-sm">
                                <button onClick={() => {
                                    setCurrTab('All')
                                }} className={`underline-offset-4 hover:opacity-75 transition-all ${currTab == "All" ? 'underline decoration-primary-dark text-primary-dark' : ''}`}>All</button>
                                <button onClick={() => {
                                    setCurrTab('Paid');
                                }} className={`underline-offset-4 hover:opacity-75  transition-all ${currTab == "Paid" ? 'underline decoration-primary-dark text-primary-dark' : ''}`}>Paid</button>
                                <button onClick={() => {
                                    setCurrTab('Overdue');
                                }} className={`underline-offset-4 hover:opacity-75  transition-all ${currTab == "Overdue" ? 'underline decoration-primary-dark text-primary-dark' : ''}`}>Overdue</button>
                                <button onClick={() => {
                                    setCurrTab('Sent');
                                }} className={`underline-offset-4 hover:opacity-75  transition-all ${currTab == "Sent" ? 'underline decoration-primary-dark text-primary-dark' : ''}`}>Sent</button>
                            </div>
                            {/* <div className="flex flex-row space-x-4 items-start">
                                <FilterButton />
                                <ExportButton />
                                <DeleteButton />
                            </div> */}

                        </div>
                    </div>

                    <div className={`hidden sm:table p-3 rounded-xl h-[75vh] max-h-[75vh] mt-1`}>
                        <table className={`w-full max-h-[70vh] overflow-y-scroll sm:block table-auto text-xs text-left text-black`}>
                            <tbody className='sm:block z-10 table-row-group'>
                                <tr className={` z-20 bg-white border-b text-secondary-text sm:flex sm:flex-row w-full transition-all sticky top-0    dark:hover:bg-gray-600`}>
                                    <th scope="row" className="px-2 py-4 w-full font-medium text-center whitespace-nowrap">
                                        <div className="flex flex-row z-50 w-auto justify-start items-center space-x-2">
                                            <input type="checkbox"></input>
                                            <h1 className={`hover:opacity-80 cursor-pointer ${currSortType == "invoice_number" ? 'text-black' : ''} hover:text-black transition-colors`} onClick={(e) => {
                                                setCurrSort('invoice_number')
                                            }}>INVOICE NUMBER</h1>
                                            {currSortType == "invoice_number" && <SortButton onClick={() => {
                                                setSortAsc(!sortAsc)
                                            }} expanded={sortAsc}></SortButton>}
                                        </div>
                                    </th>
                                    <th scope="row" className="px-2 text-center py-4 w-full  font-medium  whitespace-nowrap">
                                        <div className="flex flex-row space-x-2 justify-center items-center">
                                            <h1 className={`hover:opacity-80 cursor-pointer ${currSortType == "customer_name" ? 'text-black' : ''} hover:text-black transition-colors`} onClick={(e) => {
                                                setCurrSort('customer_name')
                                            }}>COMPANY NAME</h1>
                                            {currSortType == "customer_name" && <SortButton onClick={() => {
                                                setSortAsc(!sortAsc)
                                            }} expanded={sortAsc}></SortButton>}
                                        </div>

                                    </th>
                                    <th scope="row" className="px-2 py-4 w-full font-medium text-center ">
                                        <div className="flex flex-row space-x-2 justify-center items-center">
                                            <h1 className={`hover:opacity-80 cursor-pointer ${currSortType == "total" ? 'text-black' : ''} hover:text-black transition-colors`} onClick={(e) => {
                                                setCurrSort('total')

                                            }}>TOTAL AMOUNT</h1>
                                            {currSortType == "total" && <SortButton onClick={() => {
                                                setSortAsc(!sortAsc)
                                            }} expanded={sortAsc}></SortButton>}
                                        </div>

                                    </th>
                                    <th scope="row" className="px-2 py-4 w-full font-medium text-center ">
                                        <div className="flex flex-row space-x-2 justify-center items-center">
                                            <h1 className={`hover:opacity-80 cursor-pointer ${currSortType == "balance" ? 'text-black' : ''} hover:text-black transition-colors`} onClick={(e) => {
                                                setCurrSort('balance')
                                            }}>BALANCE AMOUNT</h1>
                                            {currSortType == "balance" && <SortButton onClick={() => {
                                                setSortAsc(!sortAsc)
                                            }} expanded={sortAsc}></SortButton>}
                                        </div>

                                    </th>
                                    <th scope="row" className="px-2 py-4 w-full font-medium text-center  ">
                                        <div className="flex flex-row space-x-2 justify-center items-center">
                                            <h1 className={`hover:opacity-80 cursor-pointer ${currSortType == "date" ? 'text-black' : ''} hover:text-black transition-colors`} onClick={(e) => {
                                                setCurrSort('date');

                                            }}>CREATED DATE</h1>
                                            {currSortType == "date" && <SortButton onClick={() => {
                                                setSortAsc(!sortAsc)
                                            }} expanded={sortAsc}></SortButton>}
                                        </div>

                                    </th>
                                    <th scope="row" className="px-2 py-4 w-full font-medium text-center  whitespace-nowrap">
                                        <div className="flex flex-row space-x-2 justify-center items-center">
                                            <h1 className={`hover:opacity-80 cursor-pointer ${currSortType == "due_date" ? 'text-black' : ''} hover:text-black transition-colors`} onClick={(e) => {
                                                setCurrSort('due_date')
                                            }}>DUE DATE</h1>
                                            {currSortType == "due_date" && <SortButton onClick={() => {
                                                setSortAsc(!sortAsc)
                                            }} expanded={sortAsc}></SortButton>}
                                        </div>

                                    </th>
                                    <th scope="row" className="px-2 py-4  w-full font-medium text-center whitespace-nowrap">
                                        STATUS
                                    </th>
                                </tr>
                                {currView?.filter((invoice) => {
                                    return invoice?.customer_name?.toLowerCase().includes(filter.toLowerCase());
                                }).sort(currSort(currSortType)).slice(startOffset, endOffset).map((invoice, index) => {
                                    return (
                                        <tr key={invoice?.invoice_id} className={`border-b border-dashed sm:flex sm:flex-row h-24  sm:justify-evenly sm:items-center w-full border-gray-400 dark:bg-gray-800 dark:border-gray-700 transition-all hover:bg-opacity-50 hover:border-primary-dark`}>
                                            <td scope="row" className="px-2 py-4 w-full font-gilroy-regular text-center  whitespace-nowrap">
                                                <div className="flex flex-row w-auto justify-start space-x-2">
                                                    <input type="checkbox"></input>
                                                    <h1 >{invoice?.invoice_number}</h1>
                                                </div>
                                            </td>
                                            <td className="px-2 py-4 w-full text-center flex flex-col space-y-2  ">
                                                {/* {invoice?.company_name} */}
                                                <span className=" text-secondary-text ">{invoice?.customer_name}</span>
                                            </td>
                                            <td className="px-2 py-4 font-gilroy-regular  w-full text-center ">
                                                Rs. {Number(invoice?.total).toLocaleString('en-IN')}
                                            </td>
                                            <td className="px-2 py-4 font-gilroy-regular  w-full text-center ">
                                                Rs. {Number(invoice?.balance).toLocaleString('en-IN')}
                                            </td>
                                            <td className="px-2 py-4 font-gilroy-regular  w-full text-center ">
                                                {new Date(invoice?.date).toLocaleDateString('en-IN', { dateStyle: "long" })}
                                            </td>
                                            <td className="  px-2 py-4 w-full font-gilroy-regular  text-center  items-center ">
                                                {new Date(invoice?.due_date).toLocaleDateString('en-IN', { dateStyle: "long" })}
                                            </td>
                                            <td className="  px-2 py-4 w-full font-gilroy-regular flex-row flex justify-center   text-center">
                                                {invoice?.status == "overdue" ? <InvoiceOverdueStatus /> : invoice?.status == "paid" ? <InvoicePaidStatus /> : <InvoiceSentStatus />}

                                            </td>
                                            {/* <td className='px-2 py-4 w-full min-w-[160px] flex flex-row justify-center '>
                                            <select className="bg-[#f5f5f5] p-3 rounded-xl text-secondary-text outline-none">
                                                <option value="" disabled selected className="hidden">Actions</option>
                                                <option>View</option>
                                                <option>Delete</option>
                                            </select>
                                        </td> */}
                                        </tr>)
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
                        <NucleiPagination items={currView} pageSize={50} pagesDisplayed={2} startPage={0} startState={[startOffset, setStart]} endState={[endOffset, setEnd]} />
                        {/* 
                        <div className="flex flex-row space-x-4 items-center">
                            {Array.from(Array(pages)).map((_, index) => {
                                if(index < paginationLimit){
                                    return (
                                        <div key={index} className={`h-10 w-10 pl-4 pt-2 ${page == index ? 'bg-primary-base' : 'bg-neutral-light'} rounded-xl`}>{index + 1}</div>
                                    )
                                }
                            })} 
                        </div>
                    */}
                    </div>
                </div> : <NucleiZeroState entity={"invoices"} />
            }
        </div >


    )
}