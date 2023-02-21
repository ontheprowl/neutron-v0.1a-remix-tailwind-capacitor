import { LoaderFunction, redirect } from "@remix-run/server-runtime";



export const loader: LoaderFunction = async ({ request, params }) => {


    const ZOHO_CLIENT_ID = '1000.V5XRG4XMLEGK3RGPD2P5VB563DU8WR'
    const ZOHO_CLIENT_SECRET = '6d0d8c5e6effbb5b7af87c83c7f29e0b48dc053d2c'
    const ZOHO_GRANT_TOKEN_URL = `https://accounts.zoho.com/oauth/v2/auth?scope=ZohoBooks.invoices.CREATE,ZohoBooks.invoices.READ,ZohoBooks.invoices.UPDATE,ZohoBooks.invoices.DELETE&client_id=${ZOHO_CLIENT_ID}&state=testing&response_type=code&redirect_uri=http://localhost:3000/zoho/access_granted&access_type=offline`;

    if (ZOHO_CLIENT_ID && ZOHO_CLIENT_SECRET) {
        const response = await fetch(ZOHO_GRANT_TOKEN_URL, {
            method: "POST",
        });
        return redirect(response.url)
    }
}