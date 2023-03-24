import { LoaderFunction, json } from "@remix-run/server-runtime";
import { getSingleDoc } from "~/firebase/queries.server";
import { requireUser } from "~/session.server";
import { prependBaseURLForEnvironment } from "~/utils/utils.server";



export const loader: LoaderFunction = async ({ request, params }) => {
    const ZOHO_CLIENT_ID = '1000.V5XRG4XMLEGK3RGPD2P5VB563DU8WR'
    const ZOHO_CLIENT_SECRET = '6d0d8c5e6effbb5b7af87c83c7f29e0b48dc053d2c'

    const session = await requireUser(request);

    const businessData = await getSingleDoc(`businesses/${session?.metadata?.businessID}`)
    // console.log("GENERATING ACCESS AND REFRESH TOKENS...")
    const creds = businessData?.creds;
    if (creds) {
        const tokenURL = new URL(`${creds.accountsServer}/oauth/v2/token`);
        tokenURL.searchParams.set('refresh_token', creds.refresh_token);
        tokenURL.searchParams.set('client_id', ZOHO_CLIENT_ID);
        tokenURL.searchParams.set('client_secret', ZOHO_CLIENT_SECRET);
        tokenURL.searchParams.set('grant_type', 'refresh_token');
        tokenURL.searchParams.set('redirect_uri', prependBaseURLForEnvironment('/integrations/zoho/access_granted'));


        const response = await fetch(tokenURL, {
            method: "POST",
        })

        const data = await response.json();

        return json(data)
    }

    return null;

}