import { Link, Outlet, useLocation, useOutletContext, useParams } from "@remix-run/react";
import { useMemo } from "react";
import ErrorIcon from '~/assets/images/errorIcon.svg';
import CustomerDetailsMissingPanel from "~/components/layout/CustomerDetailsMissingPanel";



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

    console.log("INVOICES ARE")
    console.dir(invoices)


    return (
        <div className=" h-screen overflow-y-scroll flex flex-col space-y-4">
            <div className="flex flex-row justify-between">
                <div id="page_title" className="flex flex-col">
                    <h1 className="text-base">Customer Details</h1>
                    {/* <BreadCrumbs segments={[{ name: 'Home', slug: '/dashboard' }, { name: 'Customers', slug: '/dashboard/customers' }]} /> */}
                    <div className="text-neutral-base text-sm"> Home - Customers - <span className="font-gilroy-bold text-black">{currentCustomer?.vendor_name}</span></div>
                </div>
                {/* <button className="bg-primary-base text-white hover:bg-primary-dark transition-all rounded-lg p-3">
                    Add Invoices
                </button> */}
            </div>
            <div className="flex flex-row space-x-4 w-full items-end justify-between">
                <div className="flex flex-col space-y-3  w-4/6">
                    <div id="settings_tabs" className=" flex flex-row font-gilroy-medium text-sm space-x-6">
                        <Link to="overview" preventScrollReset className={`transition-all text-neutral-dark py-3 border-b-2 hover:opacity-70 ${pathname.includes('overview') ? 'text-primary-base border-primary-base font-bold' : 'border-transparent '}`}>Overview</Link>
                        <Link to="contacts" preventScrollReset className={`transition-all text-neutral-dark py-3 border-b-2 hover:opacity-70 ${pathname.includes('contacts') ? 'text-primary-base border-primary-base font-bold' : 'border-transparent '}`}>Contacts</Link>
                        <Link to="timeline" preventScrollReset className={`transition-all text-neutral-dark py-3 border-b-2 hover:opacity-70 ${pathname.includes('timeline') ? 'text-primary-base border-primary-base font-bold' : 'border-transparent '}`}>Timeline</Link>
                        <Link to="details" preventScrollReset className={`transition-all text-neutral-dark py-3 border-b-2 hover:opacity-70 ${pathname.includes('details') ? 'text-primary-base border-primary-base font-bold' : 'border-transparent '}`}>Details</Link>

                    </div>
                    <div className="flex flex-row space-x-3 w-full h-1/5 min-h-[160px]">
                        <div id="primary_metric" className="w-1/3 bg-primary-base flex   flex-col text-white p-5 space-y-6 justify-between shadow-lg rounded-xl">
                            <h1 className=" text-4xl">Rs. {Number(currentCustomer?.outstanding
                            ).toLocaleString('en-IN')}</h1>
                            <div className="flex flex-row h-fit justify-between">
                                <span className=" text-base">
                                    Total Outstanding
                                </span>
                            </div>

                        </div>
                        <div id="secondary_metric" className="w-1/3 bg-white flex flex-col text-black p-5 space-y-6 justify-between shadow-lg rounded-xl">
                            <h1 className=" text-4xl">{currentCustomer?.dso == "No data" ? 'No data' : Math.floor(Number(currentCustomer?.dso))}</h1>
                            <div className="flex flex-row justify-between">
                                <span className=" text-base">
                                    Day Sales Outstanding
                                </span>
                            </div>
                        </div>
                        <div id="tertiary_metric" className="w-1/3 flex flex-col bg-white p-5 space-y-6 justify-between text-black shadow-lg rounded-xl">
                            <h1 className=" text-4xl">Rs. {Number(currentCustomer?.revenue
                            ).toLocaleString('en-IN')}</h1>
                            <div className="flex flex-row justify-between">
                                <span className=" text-base">
                                    Revenue (Realized)
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white shadow-lg rounded-xl flex flex-col space-y-2 divide-y divide-dashed divide-neutral-light p-1 w-2/6">
                    <div className="text-left p-6 flex flex-col space-y-2 text-sm ">
                        <h1>{currentCustomer?.vendor_name}</h1>
                        <h1 className="font-gilroy-medium text-secondary-text">Contact - {currentCustomer?.first_name && currentCustomer?.last_name ? currentCustomer?.first_name + " " + currentCustomer?.last_name : 'Data missing'}</h1>
                        {currentCustomer?.assigned_workflow && <div className="text-primary-base bg-primary-light  w-fit rounded-lg p-3">{currentCustomer?.assigned_workflow}</div>}

                    </div>
                    <div className="text-left text-sm p-6 flex flex-row justify-between ">
                        <div className="flex flex-col justify-between">
                            <h1 >Email</h1>
                            <span className=" font-gilroy-medium text-secondary-text">{currentCustomer?.email ? currentCustomer?.email : 'Data Missing'}</span>
                        </div>
                        <div className="flex flex-col justify-between items-end">
                            <h1 >Whatsapp Mobile Number</h1>
                            <span className="font-gilroy-medium text-secondary-text">{currentCustomer?.mobile ? currentCustomer?.mobile : 'Data missing'}</span>
                        </div>
                    </div>
                </div>

            </div>
            <CustomerDetailsMissingPanel email={currentCustomer?.email == ""} phone={currentCustomer?.mobile == ""} firstName={currentCustomer?.first_name == ""} lastName={currentCustomer?.last_name == ""} />

            <div id="customer_details_content" className="h-full flex flex-col space-y-6 ">
                <Outlet context={currentCustomer}></Outlet>
            </div>


        </div >
    )
}