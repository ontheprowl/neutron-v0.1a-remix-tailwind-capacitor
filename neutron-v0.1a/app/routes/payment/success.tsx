import { ActionFunction, LoaderFunction, redirect } from "@remix-run/server-runtime"
import { requireUser } from "~/session.server";




export const loader: LoaderFunction = async ({ request, params }) => {

    console.log(params)
    const session = await requireUser(request, true);
    if (session) {
        return redirect(`/${session?.metadata?.displayName}/dashboard`)
    }
}


export const action: ActionFunction = async ({ request, params }) => {

    console.log(params)
    const session = await requireUser(request, true);
    if (session) {
        return redirect(`/${session?.metadata?.displayName}/dashboard`)
    }

}

export default function SuccessfulPayment() {

    return (<p> Successful Payment </p>)
}