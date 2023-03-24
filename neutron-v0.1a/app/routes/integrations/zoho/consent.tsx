import { ActionFunction, LoaderFunction, redirect } from "@remix-run/server-runtime";
import { prependBaseURLForEnvironment } from "~/utils/utils.server";



export const action: ActionFunction = async ({ request, params }) => {

    const data = await request.formData();
    const redirect_uri = data.get('redirect_uri');
    console.log("REDIRECT URI :" + redirect_uri)
    const ZOHO_CLIENT_ID = '1000.V5XRG4XMLEGK3RGPD2P5VB563DU8WR'
    const ZOHO_CLIENT_SECRET = '6d0d8c5e6effbb5b7af87c83c7f29e0b48dc053d2c'
    const ZOHO_GRANT_TOKEN_URL = `https://accounts.zoho.com/oauth/v2/auth?scope=ZohoBooks.contacts.Create,ZohoBooks.contacts.UPDATE,ZohoBooks.contacts.READ,ZohoBooks.contacts.DELETE,ZohoBooks.invoices.Create,ZohoBooks.invoices.UPDATE,ZohoBooks.invoices.READ,ZohoBooks.fullaccess.all,ZohoBooks.invoices.DELETE&client_id=${ZOHO_CLIENT_ID}&state=${redirect_uri?redirect_uri:'/onboarding/integrations'}&response_type=code&redirect_uri=${prependBaseURLForEnvironment('/integrations/zoho/access_granted')}&access_type=offline&prompt=consent`;

    if (ZOHO_CLIENT_ID && ZOHO_CLIENT_SECRET) {
        const response = await fetch(ZOHO_GRANT_TOKEN_URL, {
            method: "POST",
        });
        return redirect(response.url)
    }
}