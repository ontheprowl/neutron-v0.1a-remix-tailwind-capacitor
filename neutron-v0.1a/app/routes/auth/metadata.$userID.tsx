import { LoaderSubmission } from "@remix-run/react/transition";
import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { json } from "remix-utils";
import { getSingleDoc } from "~/firebase/queries.server";
import { requireUser } from "~/session.server";




export const loader: LoaderFunction = async ({ request, params }) => {
    const session = await requireUser(request);
    const userID = params.userID;
    const metadata = await getSingleDoc(`metadata/` + userID);
    console.log('Metadata retrieved \n');

    console.dir(metadata)
    return json({ metadata: metadata })

}

export const action: ActionFunction = async ({ request, params }) => {

    return null;
}