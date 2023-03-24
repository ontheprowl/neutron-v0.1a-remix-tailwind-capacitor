import { Link, Outlet, useLocation, useOutletContext, useParams } from "@remix-run/react";
import { useMemo, useState } from "react";
import DeleteButton from "~/components/inputs/buttons/DeleteButton";
import ExportButton from "~/components/inputs/buttons/ExportButton";
import FilterButton from "~/components/inputs/buttons/FilterButton";
import { InvoiceClearedStatus } from "~/components/layout/Statuses";



export default function CustomerOverview() {

    const { metadata, businessData } = useOutletContext();
    const params = useParams();

    const contactID = params.customerID;


    const { pathname } = useLocation();

    const currentCustomer: { [x: string]: any } | null = useMemo(() => {
        for (const key of Object.keys(businessData?.customers)) {
            if (businessData?.customers[key]?.contact_id == contactID) {
                console.log("FOUND THE CUSTOMER");
                return businessData?.customers[key];
            }
        }
        return null
    }, [businessData?.customers, contactID]);


    const currentCustomerInvoices = useMemo(() => {
        for (const key of Object.keys(businessData?.customers)) {
            if (businessData?.customers[key]?.contact_id == contactID) {
                console.log("FOUND THE CUSTOMER");
                return businessData?.customers[key];
            }
        }
        return null
    }, [businessData?.customers, contactID]);

    console.log(currentCustomer)

    const [page, setPage] = useState(0);

    return (
        <div className=" h-full flex flex-col space-y-4">
            <div className="flex flex-row justify-between">
                <div id="page_title" className="flex flex-col">
                    <h1 className="text-lg">Customer Details</h1>
                    <span className="text-neutral-base"> Home - Customers - Wayne Enterprises</span>
                </div>
                <button className="bg-primary-base text-white hover:bg-primary-dark transition-all rounded-lg p-3">
                    Add Invoices
                </button>
            </div>
            <div id="settings_tabs" className=" flex flex-row font-gilroy-medium text-base space-x-6">
                <Link to="overview" preventScrollReset className={`transition-all text-neutral-dark py-3 border-b-2 hover:opacity-70 ${pathname.includes('overview') ? 'text-primary-base border-primary-base font-bold' : 'border-transparent '}`}>Overview</Link>
                <Link to="contacts" preventScrollReset className={`transition-all text-neutral-dark py-3 border-b-2 hover:opacity-70 ${pathname.includes('contacts') ? 'text-primary-base border-primary-base font-bold' : 'border-transparent '}`}>Contacts</Link>
                <Link to="insights" preventScrollReset className={`transition-all text-neutral-dark py-3 border-b-2 hover:opacity-70 ${pathname.includes('insights') ? 'text-primary-base border-primary-base font-bold' : 'border-transparent '}`}>Insights</Link>

            </div>
            <div id="customer_details_content" className="h-full flex flex-col space-y-6  overflow-y-scroll">
                <div className="flex flex-row space-x-3 w-2/3  h-1/5">
                    <div id="primary_metric" className="w-1/3 bg-primary-base flex flex-col text-white p-5 space-y-6 justify-between shadow-lg rounded-xl">
                        <h1 className=" text-5xl">Rs. {Number(currentCustomer?.outstanding_receivable_amount
                        ).toLocaleString('en-IN')}</h1>
                        <div className="flex flex-row justify-between">
                            <span className=" text-lg">
                                Total Outstanding
                            </span>
                        </div>
                    </div>
                    <div id="secondary_metric" className="w-1/3 bg-white flex flex-col text-black p-5 space-y-6 justify-between shadow-lg rounded-xl">
                        <h1 className=" text-5xl">Random</h1>
                        <div className="flex flex-row justify-between">
                            <span className=" text-lg">
                                [Need a secondary metric here]
                            </span>
                        </div>
                    </div>
                    <div id="tertiary_metric" className="w-1/3 flex flex-col bg-white p-5 space-y-6 justify-between text-black shadow-lg rounded-xl">
                        <h1 className=" text-5xl">80</h1>
                        <div className="flex flex-row justify-between">
                            <span className=" text-lg">
                                Average Days Delinquent
                            </span>
                            <span className=" text-2xl">
                                +15%
                            </span>
                        </div>
                    </div>
                </div>
                <Outlet context={{ metadata: metadata, businessData: businessData }}></Outlet>
            </div>


        </div >
    )
}