import { Link, Outlet, useLoaderData, useLocation, useOutletContext, useParams } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { getSingleDoc } from "~/firebase/queries.server";
import { requireUser } from "~/session.server";



export const loader: LoaderFunction = async ({ request, params }) => {
    const session = await requireUser(request);
    const workflowID = params.workflowID;
    const workflow = await getSingleDoc(`workflows/business/${session?.metadata?.businessID}/${workflowID}`);

    return json(workflow);
}


export default function WorkflowsDetailsScreen() {

    const params = useParams();

    const workflowID = params.workflowID;
    const workflowData = useLoaderData();

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
            <Link to="customers" preventScrollReset className={`transition-all text-neutral-dark py-3 border-b-2 hover:opacity-70 ${pathname.includes('customers') ? 'text-primary-base border-primary-base font-bold' : 'border-transparent '}`}>Customers</Link>
            <Link to="timeline" preventScrollReset className={`transition-all text-neutral-dark py-3 border-b-2 hover:opacity-70 ${pathname.includes('timeline') ? 'text-primary-base border-primary-base font-bold' : 'border-transparent '}`}>Timeline</Link>

        </div>

        <div id="settings_panel" className="h-full overflow-y-scroll">
            <Outlet context={{ ...workflowData, id: workflowID }}></Outlet>
        </div>


    </div>)

}