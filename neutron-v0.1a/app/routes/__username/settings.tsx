import { Link, Outlet, useLocation, useOutletContext } from "@remix-run/react";
import { LoaderFunction, redirect } from "@remix-run/server-runtime";
import { useState } from "react";
import DeleteButton from "~/components/inputs/buttons/DeleteButton";
import ExportButton from "~/components/inputs/buttons/ExportButton";
import FilterButton from "~/components/inputs/buttons/FilterButton";
import { InvoiceClearedStatus } from "~/components/layout/Statuses";
import { requireUser } from "~/session.server";



export default function SettingsLayout() {


    const context = useOutletContext();

    const { pathname } = useLocation();

    const [page, setPage] = useState(0);

    return (
        <div className=" h-full flex flex-col space-y-4">
            <div className="flex flex-row justify-between">
                <div id="page_title" className="flex flex-col">
                    <h1 className="text-lg">Settings</h1>
                    <span className="text-neutral-base text-sm font-gilroy-medium"> Home - Settings</span>
                </div>
            </div>

            <div id="settings_tabs" className=" flex flex-row font-gilroy-medium text-base space-x-6">
                <Link to="basic" className={`transition-all text-neutral-dark py-3 border-b-2 hover:opacity-70 ${pathname.includes('basic') ? 'text-primary-base border-primary-base font-bold' : 'border-transparent '}`}>Basic</Link>
                <Link to="billing" className={`transition-all text-neutral-dark py-3 border-b-2 hover:opacity-70 ${pathname.includes('billing') ? 'text-primary-base border-primary-base font-bold' : 'border-transparent '}`}>Billing</Link>
                <Link to="integrations" className={`transition-all text-neutral-dark py-3 border-b-2 hover:opacity-70 ${pathname.includes('integrations') ? 'text-primary-base border-primary-base font-bold' : 'border-transparent '}`}>Integrations</Link>
                <Link to="permissions" className={`transition-all text-neutral-dark py-3 border-b-2 hover:opacity-70 ${pathname.includes('permissions') ? 'text-primary-base border-primary-base font-bold' : 'border-transparent '}`}>Permissions</Link>

            </div>

            <div id="settings_panel" className="h-full overflow-y-scroll">
                <Outlet context={context}></Outlet>
            </div>


        </div >
    )
}