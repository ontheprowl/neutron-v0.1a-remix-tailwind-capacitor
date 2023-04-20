import { useLocation, useOutletContext } from "@remix-run/react";
import { useMemo, useState } from "react";
import NucleiPagination from "~/components/inputs/pagination/NucleiPagination";
import { InvoiceOverdueStatus, InvoicePaidStatus, InvoiceSentStatus } from "~/components/layout/Statuses";


// export const loader: LoaderFunction = async ({ request, params }) => {
//     const session = await requireUser(request);

//     const customerID = params.customerID;

//     const customer = await getSingleDoc(`customers/business/${session?.metadata?.businessID}/${customerID}`);

//     const invoiceIDs: string[] = customer?.invoices;

//     const invoices: Array<{ [x: string]: any }> = []
//     for (const invoice of invoiceIDs) {
//         const invoiceData = await getSingleDoc(``)
//     }
// }




export default function CustomerOverview() {


    const customerData: { [x: string]: any } = useOutletContext();

    const { pathname } = useLocation();


    const [startOffset, setStart] = useState(0);
    const [endOffset, setEnd] = useState(50)
    const [filter, setFilter] = useState('');


    const receivables = useMemo(() => customerData?.invoices?.filter((invoice) => invoice?.status == "overdue" || invoice?.status == "sent"), [customerData?.invoices])
    const paid = useMemo(() => customerData?.invoices?.filter((invoice) => invoice?.status == "paid"), [customerData?.invoices])

    const [currTab, setCurrTab] = useState('All')

    const currView = function (currTab: string) {
        switch (currTab) {
            case "All":
                return customerData?.invoices;
            case "Overdue":
                return receivables.filter((receivable) => receivable?.status == "overdue");
            case "Paid":
                return paid;
            case "Sent":
                return receivables.filter((receivable) => receivable?.status == "sent");
        }
    }(currTab);

    return (

        <>
            <div id="invoices_table" className="bg-white shadow-lg rounded-xl justify-between h-full flex flex-col">
                <div id="table_functions" className="flex flex-row items-center  pl-5 py-3 pr-5  justify-between h-auto">
                    <div className="flex flex-row bg-[#f5f5f5]  h-10 space-x-4 p-2 w-2/5  rounded-lg">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.5 17.5L14.5834 14.5833M16.6667 9.58333C16.6667 13.4954 13.4954 16.6667 9.58333 16.6667C5.67132 16.6667 2.5 13.4954 2.5 9.58333C2.5 5.67132 5.67132 2.5 9.58333 2.5C13.4954 2.5 16.6667 5.67132 16.6667 9.58333Z" stroke="#6F6E6E" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>

                        <input type="text" onChange={(e) => {
                            setFilter(e.currentTarget.value)
                        }} placeholder="Search for an invoice by the date it was created" className="w-full bg-transparent text-neutral-dark placeholder:text-neutral-dark focus:border-transparent outline-none " />

                    </div>
                    <div className="flex flex-row space-x-4 w-auto items-center justify-center">
                        <div className="flex flex-row space-x-4 self-end my-4">
                            <div className="flex flex-row space-x-4">
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
                        </div>
                        {/* <div className="flex flex-row space-x-4 items-center">
                            <FilterButton />
                            <ExportButton />
                            <DeleteButton />
                        </div> */}
                    </div>
                </div>

                <div className={`hidden sm:table p-3 rounded-xl h-[900px] mt-1`}>
                    <table className={`w-full h-full overflow-y-scroll sm:block table-auto text-sm text-left text-black`}>
                        <tbody className='sm:block table-row-group'>
                            <tr className={` bg-white border-b text-secondary-text sm:flex sm:flex-row w-full transition-all sticky top-0 pointer-events-none bg-bg-secondary-dark z-20  hover:bg-opacity-50  dark:hover:bg-gray-600`}>

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
                                <th scope="row" className="px-2 py-4 w-full font-medium text-center ">
                                    BALANCE AMOUNT
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
                            </tr>
                            {currView?.filter((invoice) => {
                                return new Date(invoice?.date).toLocaleDateString('en-IN', { dateStyle: "long" }).includes(filter);
                            }).sort((a, b) => {
                                if (a?.date > b.date) {
                                    return -1
                                } else {
                                    return 1
                                }
                            }).slice(startOffset, endOffset).map((invoice, index) => {
                                return (
                                    <tr key={invoice.invoice_id} className={`border-b border-dashed sm:flex sm:flex-row  sm:justify-evenly sm:items-center w-full border-gray-400 dark:bg-gray-800 dark:border-gray-700 transition-all hover:bg-bg-primary-dark hover:bg-opacity-50 hover:border-primary-dark`}>
                                        <td scope="row" className="px-2 py-4 w-full font-gilroy-regular text-center  whitespace-nowrap">
                                            <div className="flex flex-row w-auto justify-start space-x-4">
                                                <input type="checkbox"></input>
                                                <h1>#{startOffset + index}</h1>
                                            </div>
                                        </td>
                                        <td className="px-2 py-4 w-full text-left flex flex-col space-y-2  ">
                                            {/* {invoice?.company_name} */}
                                            <span className=" text-secondary-text text-md">{invoice?.customer_name}</span>
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
                                        <td className="  px-2 py-4 w-full font-gilroy-regular  text-center justify-center items-center flex-row flex ">
                                            {new Date(invoice?.due_date).toLocaleDateString('en-IN', { dateStyle: "long" })}
                                        </td>
                                        <td className="  px-2 py-4 w-full font-gilroy-regular justify-center flex flex-row  text-center">
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
                <div className="flex flex-row justify-between items-center px-3 mb-2 h-12 w-full self-end" id="invoices_pagination">
                    <select className="bg-[#f5f5f5] p-2 rounded-xl text-secondary-text outline-none">
                        <option value="" disabled selected className="hidden">Actions</option>
                        <option>View</option>
                        <option>Delete</option>
                    </select>
                    <NucleiPagination items={customerData?.invoices} startPage={0} pageSize={50} pagesDisplayed={2} startState={[startOffset, setStart]} endState={[endOffset, setEnd]} />
                </div>
            </div>
        </>
    )

}