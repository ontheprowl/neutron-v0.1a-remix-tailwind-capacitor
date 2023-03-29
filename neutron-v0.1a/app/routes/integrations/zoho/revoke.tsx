import { ActionFunction, redirect } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { deleteCollection, deleteFirestoreDoc, getSingleDoc, updateFirestoreDocFromData } from "~/firebase/queries.server";
import { DEFAULT_BUSINESS_DATA_STATE } from "~/models/business";



export const action: ActionFunction = async ({ request, params }) => {

    const ZOHO_CLIENT_ID = '1000.V5XRG4XMLEGK3RGPD2P5VB563DU8WR'
    const ZOHO_CLIENT_SECRET = '6d0d8c5e6effbb5b7af87c83c7f29e0b48dc053d2c'
    const searchParams = new URL(request.url).searchParams
    const business_id = searchParams.get('business_id')
    const redirect_uri = searchParams.get('redirect_uri')

    if (business_id) {
        const businessData = await getSingleDoc(`businesses/${business_id}`);

        const creds = businessData?.creds;
        const tokenURL = new URL(`${creds.accountsServer}/oauth/v2/token/revoke`);
        tokenURL.searchParams.set('token', creds.refresh_token);
        tokenURL.searchParams.set('client_id', ZOHO_CLIENT_ID);
        tokenURL.searchParams.set('client_secret', ZOHO_CLIENT_SECRET);


        const response = await fetch(tokenURL, {
            method: "POST",
        })

        // * Purge all business-related data

        const businessDataResetRef = await updateFirestoreDocFromData({ creds: {}, ...DEFAULT_BUSINESS_DATA_STATE }, 'businesses', business_id);
        const receivablesReset30Ref = await deleteCollection(`receivables/${business_id}/30d`, 500);
        const receivablesReset60Ref = await deleteCollection(`receivables/${business_id}/60d`, 500);
        const receivablesReset90Ref = await deleteCollection(`receivables/${business_id}/90d`, 500);
        const receivablesResetExcessRef = await deleteCollection(`receivables/${business_id}/excess`, 500);

        const indexesResetRef = await deleteFirestoreDoc('indexes', business_id);

        const customersResetRef = await deleteCollection(`customers/business/${business_id}`, 500);


        return redirect(redirect_uri ? redirect_uri : '/settings/integrations')
    }

}