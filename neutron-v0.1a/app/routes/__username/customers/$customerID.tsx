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

    const receivables = useMemo(() => { return [...new Set([...businessData?.receivables['30d'], ...businessData?.receivables['60d'], ...businessData?.receivables['90d'], ...businessData?.receivables['excess']])] }, [businessData?.receivables])
    const paid = useMemo(() => { return [...new Set([...businessData?.paid['excess'], ...businessData?.paid['90d'], ...businessData?.paid['60d'], ...businessData?.paid['30d']])] }, [businessData?.paid])

    const invoices = useMemo(() => [...receivables, ...paid], [receivables, paid]);

    const { pathname } = useLocation();

    const currentCustomer: { [x: string]: any } | null = useMemo(() => {
        for (const key of Object.keys(businessData?.customers)) {
            const currentCustomer = businessData?.customers[key];
            if (currentCustomer.contact_id == contactID) {
                console.log("FOUND THE CUSTOMER");
                currentCustomer['invoices'] = invoices?.filter((invoice) => invoice?.customer_id == businessData?.customers[key]?.contact_id);
                return businessData?.customers[key];
            }
        }
        return null
    }, [businessData?.customers, contactID, invoices]);

    console.log("THE CURRENT CUSTOMER IS")
    console.dir(currentCustomer)

    return (
        <div className=" h-full flex flex-col space-y-4">
            <div className="flex flex-row justify-between">
                <div id="page_title" className="flex flex-col">
                    <h1 className="text-lg">Customer Details</h1>
                    <span className="text-neutral-base"> Home - Customers - {currentCustomer?.vendor_name}</span>
                </div>
                {/* <button className="bg-primary-base text-white hover:bg-primary-dark transition-all rounded-lg p-3">
                    Add Invoices
                </button> */}
            </div>
            <div id="settings_tabs" className=" flex flex-row font-gilroy-medium text-base space-x-6">
                <Link to="overview" preventScrollReset className={`transition-all text-neutral-dark py-3 border-b-2 hover:opacity-70 ${pathname.includes('overview') ? 'text-primary-base border-primary-base font-bold' : 'border-transparent '}`}>Overview</Link>
                <Link to="contacts" preventScrollReset className={`transition-all text-neutral-dark py-3 border-b-2 hover:opacity-70 ${pathname.includes('contacts') ? 'text-primary-base border-primary-base font-bold' : 'border-transparent '}`}>Contacts</Link>
                <Link to="insights" preventScrollReset className={`transition-all text-neutral-dark py-3 border-b-2 hover:opacity-70 ${pathname.includes('insights') ? 'text-primary-base border-primary-base font-bold' : 'border-transparent '}`}>Insights</Link>

            </div>
            <div id="customer_details_content" className="h-full flex flex-col space-y-6  overflow-y-scroll">
                <div className="flex flex-row space-x-3 w-2/3 h-1/5 min-h-[160px]">
                    <div id="primary_metric" className="w-1/3 bg-primary-base flex h-full min-h-fit flex-col text-white p-5 space-y-6 justify-between shadow-lg rounded-xl">
                        <h1 className=" text-4xl">Rs. {Number(currentCustomer?.outstanding
                        ).toLocaleString('en-IN')}</h1>
                        <div className="flex flex-row h-fit justify-between">
                            <span className=" text-lg">
                                Total Outstanding
                            </span>
                        </div>

                    </div>
                    <div id="secondary_metric" className="w-1/3 bg-white flex flex-col text-black p-5 space-y-6 justify-between shadow-lg rounded-xl">
                        <h1 className=" text-4xl">{currentCustomer?.dso} days</h1>
                        <div className="flex flex-row justify-between">
                            <span className=" text-lg">
                                Day Sales Outstanding
                            </span>
                        </div>
                    </div>
                    <div id="tertiary_metric" className="w-1/3 flex flex-col bg-white p-5 space-y-6 justify-between text-black shadow-lg rounded-xl">
                        <h1 className=" text-4xl">Rs. {Number(currentCustomer?.revenue
                        ).toLocaleString('en-IN')}</h1>
                        <div className="flex flex-row justify-between">
                            <span className=" text-lg">
                                Revenue (Realized)
                            </span>
                            <span className=" text-2xl">
                                +15%
                            </span>
                        </div>
                    </div>
                </div>
                <Outlet context={currentCustomer}></Outlet>
            </div>


        </div >
    )
}