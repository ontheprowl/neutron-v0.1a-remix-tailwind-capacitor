import { Link, Outlet, useLocation, useOutletContext } from "@remix-run/react";






export default function WorkflowsDetailsScreen() {


    const context = useOutletContext();

    const { pathname } = useLocation();


    return (<div className=" h-full flex flex-col space-y-4">
        <div className="flex flex-row justify-between">
            <div id="page_title" className="flex flex-col">
                <h1 className="text-lg">Workflow Details</h1>
                <span className="text-neutral-base text-sm font-gilroy-medium"> Home - Workflows - Workflow Details</span>
            </div>
        </div>

        <div id="settings_tabs" className=" flex flex-row font-gilroy-medium text-base space-x-6">
            <Link to="overview" preventScrollReset className={`transition-all text-neutral-dark py-3 border-b-2 hover:opacity-70 ${pathname.includes('overview') ? 'text-primary-base border-primary-base font-bold' : 'border-transparent '}`}>Overview</Link>
            <Link to="customers" className={`transition-all text-neutral-dark py-3 border-b-2 hover:opacity-70 ${pathname.includes('customers') ? 'text-primary-base border-primary-base font-bold' : 'border-transparent '}`}>Customers</Link>
        </div>

        <div id="settings_panel" className="h-full overflow-y-scroll">
            <Outlet context={context}></Outlet>
        </div>


    </div>)

}