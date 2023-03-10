import { ActionFunction, json } from "@remix-run/server-runtime";
import { updateFirestoreDocFromData } from "~/firebase/queries.server";
import { requireUser } from "~/session.server";




/**
 * 
 *
 */
export const action: ActionFunction = async ({ request, params }) => {

    const ZOHO_CLIENT_ID = '1000.V5XRG4XMLEGK3RGPD2P5VB563DU8WR'
    const ZOHO_CLIENT_SECRET = '6d0d8c5e6effbb5b7af87c83c7f29e0b48dc053d2c'

    const access_token = new URL(request.url).searchParams.get('access_token');
    const business_id = new URL(request.url).searchParams.get('business_id');

    let receivables: { code: number, message: string, invoices: Array<{ [x: string]: any }>, page_context: { [x: string]: any } } | null = null;
    let contacts: { code: number, message: string, contacts: Array<{ [x: string]: any }>, page_context: { [x: string]: any } } | null;
    let customers: Array<{ [x: string]: any }> | null | undefined = null;
    let total_outstanding = null;


    // // * Generate Business Metadata and Metrics from integration
    // let receivables: { code: number, message: string, invoices: Array<{ [x: string]: any }>, page_context: { [x: string]: any } } | null = null;
    // let total_outstanding = null;
    // // * Refresh Zoho creds if required
    // let zohoCreds = session?.metadata?.zoho_creds
    // if (zohoCreds) {
    //     const expired = true;
    //     // const expired = ((new Date().getTime() - zohoCreds.timestamp) / (10 ** 3)) > 3600;
    //     console.log("TOKEN EXPIRED : " + expired);
    //     if (expired) {
    //         console.log("RENEWING ZOHO CREDS...")
    //         const response = await fetch(`http://localhost:3000/integrations/zoho/refresh?refresh_token=${zohoCreds.refresh_token}`, {
    //             method: "GET"
    //         })

    //         const newCreds = await response.json();
    //         console.log(newCreds)
    //         if (newCreds) {
    //             zohoCreds = { ...newCreds, refresh_token: zohoCreds.refresh_token, timestamp: new Date().getTime() };
    //             const newZohoCredsUpdateRef = await updateFirestoreDocFromData({ zoho_creds: zohoCreds }, 'metadata', session?.metadata?.id)
    //         }
    //     }
    //     const response = await fetch(`http://localhost:3000/integrations/zoho/sync?access_token=${zohoCreds.access_token}&business_id=${session?.metadata?.businessID}`, {
    //         method: "POST"
    //     })

    //     // receivables = await response.json();
    //     // total_outstanding = receivables?.invoices.reduce((first, last) => {
    //     //     if (last.total) return first + last.total
    //     //     return first
    //     // }, 0)
    //     // console.log("TOTAL OUTSTANDING IS : " + total_outstanding)
    // }



    if (access_token) {
        console.log("FETCHING INVOICES")
        const receivablesRequestResponse = await fetch("https://www.zohoapis.in/books/v3/invoices?organization_id=60019353124&filter_by=Status.OverDue", {
            method: "GET",
            headers: new Headers({
                'Authorization': `Zoho-oauthtoken ${access_token}`
            })
        })

        receivables = await receivablesRequestResponse.json();
        total_outstanding = receivables?.invoices.reduce((first, last) => {
            if (last.total) return first + last.total
            return first
        }, 0)


        const paidInvoicesRequestResponse = await fetch("https://www.zohoapis.in/books/v3/invoices?organization_id=60019353124&filter_by=Status.Paid", {
            method: "GET",
            headers: new Headers({
                'Authorization': `Zoho-oauthtoken ${access_token}`
            })
        })

        const paidInvoices: { code: number, message: string, invoices: Array<{ [x: string]: any }>, page_context: { [x: string]: any } } | null = await paidInvoicesRequestResponse.json();
        const total_revenue = paidInvoices?.invoices.reduce((first, last) => {
            if (last.total) return first + last.total
            return first
        }, 0)

        console.log("FETCHING CUSTOMERS")

        const customersRequestResponse = await fetch("https://www.zohoapis.in/books/v3/contacts?organization_id=60019353124", {
            method: "GET",
            headers: new Headers({
                'Authorization': `Zoho-oauthtoken ${access_token}`
            })
        })

        contacts = await customersRequestResponse.json()
        customers = contacts?.contacts.filter((contact) => {
            return contact?.contact_type == "customer"
        })


        const businessDataRef = await updateFirestoreDocFromData({ receivables: receivables?.invoices, outstanding: total_outstanding, cleared: paidInvoices?.invoices, revenue: total_revenue, customers: customers }, 'businesses', `${business_id}`)

        return json({ status: 0 })
    }

    return json({ status: -1 })


}