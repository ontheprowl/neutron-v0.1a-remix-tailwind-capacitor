import { ActionFunction, json } from "@remix-run/server-runtime";
import moment from "moment";
import { addFirestoreDocFromData, addFirestoreDocsAndReturnIDs, getSingleDoc, setFirestoreDocFromData, updateFirestoreDocFromData } from "~/firebase/queries.server";
import { requireUser } from "~/session.server";
import { executePaginatedRequestandAggregate, prependBaseURLForEnvironment, returnNormalizedDateString } from "~/utils/utils.server";




/**
 * 
 *
 */
export const action: ActionFunction = async ({ request, params }) => {


    const session = await requireUser(request);

    const ZOHO_CLIENT_ID = '1000.V5XRG4XMLEGK3RGPD2P5VB563DU8WR'
    const ZOHO_CLIENT_SECRET = '6d0d8c5e6effbb5b7af87c83c7f29e0b48dc053d2c'

    const formData = await request.formData();
    const business_id = formData.get('business_id');

    let contacts: { code: number, message: string, contacts: Array<{ [x: string]: any }>, page_context: { [x: string]: any } } | null;
    let customers: Array<{ [x: string]: any }> | null | undefined = null;


    // // * Generate Business Metadata and Metrics from integration
    let receivables: { code: number, message: string, invoices: Array<{ [x: string]: any }>, page_context: { [x: string]: any } } | null = null;
    let total_outstanding = null;

    if (business_id) {
        console.log("BUSINESS_ID DETECTED")
        console.log(business_id)
        const businessDataRef = await getSingleDoc(`businesses/${business_id}`)

        // * Refresh Zoho creds if required
        let zohoCreds = businessDataRef?.creds;
        if (zohoCreds) {

            // ? Right now, pull data only from default organization. Will this need to be expanded in the future? 
            const defaultOrganization = zohoCreds?.organizations?.filter((organization) => {
                return organization?.is_default_org === true
            })[0]
            console.log(defaultOrganization)
            const organization_id = defaultOrganization.organization_id;

            console.log("DEFAULT ORGANIZATION")
            console.dir(defaultOrganization, { depth: null })
            // const expired = true;
            const expired = ((new Date().getTime() - zohoCreds.timestamp) / (10 ** 3)) > 3600;
            console.log("TOKEN EXPIRED : " + expired);
            if (expired) {
                console.log("RENEWING ZOHO CREDS...")
                const response = await fetch(prependBaseURLForEnvironment(`/integrations/zoho/refresh?refresh_token=${zohoCreds.refresh_token}`), {
                    method: "GET"
                })

                const newCreds = await response.json();
                console.log(newCreds)
                if (newCreds) {
                    zohoCreds = { ...newCreds, refresh_token: zohoCreds.refresh_token, timestamp: new Date().getTime() };
                    const newZohoCredsUpdateRef = await updateFirestoreDocFromData({ creds: zohoCreds }, 'businesses', business_id)
                }
            }

            if (zohoCreds?.access_token) {
                const access_token = zohoCreds?.access_token;
                const apiDomain = zohoCreds?.api_domain;


                // * Fetch receivables according to four brackets ( 0-30days ( due date after 30 days before today), 30-60 days, 60-90 days, 90+)
                console.log("FETCHING INVOICES")

                // ? Is there a better way to implement pagination


                const receivables30Days = await executePaginatedRequestandAggregate(async (page: number) => {
                    const receivablesRequestResponse30Days = await fetch(`${apiDomain}/books/v3/invoices?organization_id=${organization_id}&due_date_after=${returnNormalizedDateString(moment().subtract(31, 'days').toDate())}&status=overdue&page=${page}`, {
                        method: "GET",
                        headers: new Headers({
                            'Authorization': `Zoho-oauthtoken ${access_token}`
                        })
                    })

                    const response: { code: number, invoices: [{ [x: string]: any }], page_context: { has_more_page: boolean } } = await receivablesRequestResponse30Days.json();


                    return { page_result: response?.invoices, has_more_page: response?.page_context?.has_more_page }
                });

                const receivables60Days = await executePaginatedRequestandAggregate(async (page: number) => {
                    const receivablesRequestResponse60Days = await fetch(`${apiDomain}/books/v3/invoices?organization_id=${organization_id}&due_date_after=${returnNormalizedDateString(moment().subtract(61, 'days').toDate())}&due_date_before=${returnNormalizedDateString(moment().subtract(30, 'days').toDate())}&status=overdue&page=${page}`, {
                        method: "GET",
                        headers: new Headers({
                            'Authorization': `Zoho-oauthtoken ${access_token}`
                        })
                    })

                    const response: { code: number, invoices: [{ [x: string]: any }], page_context: { has_more_page: boolean } } = await receivablesRequestResponse60Days.json();


                    return { page_result: response?.invoices, has_more_page: response?.page_context?.has_more_page }

                });


                const receivables90Days = await executePaginatedRequestandAggregate(async (page: number) => {
                    const receivablesRequestResponse90Days = await fetch(`${apiDomain}/books/v3/invoices?organization_id=${organization_id}&due_date_after=${returnNormalizedDateString(moment().subtract(91, 'days').toDate())}&due_date_before=${returnNormalizedDateString(moment().subtract(60, 'days').toDate())}&status=overdue&page=${page}`, {
                        method: "GET",
                        headers: new Headers({
                            'Authorization': `Zoho-oauthtoken ${access_token}`
                        })
                    })

                    const response: { code: number, invoices: [{ [x: string]: any }], page_context: { has_more_page: boolean } } = await receivablesRequestResponse90Days.json();


                    return { page_result: response?.invoices, has_more_page: response?.page_context?.has_more_page }

                });

                const receivablesExcess = await executePaginatedRequestandAggregate(async (page: number) => {
                    const receivablesRequestResponseExcess = await fetch(`${apiDomain}/books/v3/invoices?organization_id=${organization_id}&due_date_before=${returnNormalizedDateString(moment().subtract(90, 'days').toDate())}&status=overdue&page=${page}`, {
                        method: "GET",
                        headers: new Headers({
                            'Authorization': `Zoho-oauthtoken ${access_token}`
                        })
                    })

                    const response: { code: number, invoices: [{ [x: string]: any }], page_context: { has_more_page: boolean } } = await receivablesRequestResponseExcess.json();


                    return { page_result: response?.invoices, has_more_page: response?.page_context?.has_more_page }

                });


                console.dir('PAGINATED AND AGGREGATED RECEIVABLES...');
                console.dir(receivables30Days.length)



                const outstanding30Days = receivables30Days?.reduce((first, last) => {
                    if (last.balance) return first + last.balance
                    return first
                }, 0)
                const outstanding60Days = receivables60Days?.reduce((first, last) => {
                    if (last.balance) return first + last.balance
                    return first
                }, 0)
                const outstanding90Days = receivables90Days?.reduce((first, last) => {
                    if (last.balance) return first + last.balance
                    return first
                }, 0)
                const outstandingExcess = receivablesExcess?.reduce((first, last) => {
                    if (last.balance) return first + last.balance
                    return first
                }, 0)

                const total_outstanding = outstanding30Days + outstanding60Days + outstanding90Days + outstandingExcess



                const paidInvoices30Days = await executePaginatedRequestandAggregate(async (page: number) => {
                    const paidInvoicesRequest30Days = await fetch(`${apiDomain}/books/v3/invoices?organization_id=${organization_id}&due_date_after=${returnNormalizedDateString(moment().subtract(31, 'days').toDate())}&status=paid&page=${page}`, {
                        method: "GET",
                        headers: new Headers({
                            'Authorization': `Zoho-oauthtoken ${access_token}`
                        })
                    })

                    const response: { code: number, invoices: [{ [x: string]: any }], page_context: { has_more_page: boolean } } = await paidInvoicesRequest30Days.json();


                    return { page_result: response?.invoices, has_more_page: response?.page_context?.has_more_page }

                });

                const paidInvoices60Days = await executePaginatedRequestandAggregate(async (page: number) => {
                    const paidInvoicesRequest60Days = await fetch(`${apiDomain}/books/v3/invoices?organization_id=${organization_id}&due_date_after=${returnNormalizedDateString(moment().subtract(61, 'days').toDate())}&due_date_before=${returnNormalizedDateString(moment().subtract(30, 'days').toDate())}&status=paid&page=${page}`, {
                        method: "GET",
                        headers: new Headers({
                            'Authorization': `Zoho-oauthtoken ${access_token}`
                        })
                    })

                    const response: { code: number, invoices: [{ [x: string]: any }], page_context: { has_more_page: boolean } } = await paidInvoicesRequest60Days.json();


                    return { page_result: response?.invoices, has_more_page: response?.page_context?.has_more_page }

                });

                const paidInvoices90Days = await executePaginatedRequestandAggregate(async (page: number) => {
                    const paidInvoicesRequest90Days = await fetch(`${apiDomain}/books/v3/invoices?organization_id=${organization_id}&due_date_after=${returnNormalizedDateString(moment().subtract(91, 'days').toDate())}&due_date_before=${returnNormalizedDateString(moment().subtract(60, 'days').toDate())}&status=paid&page=${page}`, {
                        method: "GET",
                        headers: new Headers({
                            'Authorization': `Zoho-oauthtoken ${access_token}`
                        })
                    })

                    const response: { code: number, invoices: [{ [x: string]: any }], page_context: { has_more_page: boolean } } = await paidInvoicesRequest90Days.json();


                    return { page_result: response?.invoices, has_more_page: response?.page_context?.has_more_page }

                });

                const paidInvoicesExcess = await executePaginatedRequestandAggregate(async (page: number) => {
                    const paidInvoicesRequestExcess = await fetch(`${apiDomain}/books/v3/invoices?organization_id=${organization_id}&due_date_before=${returnNormalizedDateString(moment().subtract(90, 'days').toDate())}&status=paid&page=${page}`, {
                        method: "GET",
                        headers: new Headers({
                            'Authorization': `Zoho-oauthtoken ${access_token}`
                        })
                    })

                    const response: { code: number, invoices: [{ [x: string]: any }], page_context: { has_more_page: boolean } } = await paidInvoicesRequestExcess.json();


                    return { page_result: response?.invoices, has_more_page: response?.page_context?.has_more_page }
                });



                const revenue30Days = paidInvoices30Days?.reduce((first, last) => {
                    if (last.total) return first + last.total
                    return first
                }, 0)
                const revenue60Days = paidInvoices60Days?.reduce((first, last) => {
                    if (last.total) return first + last.total
                    return first
                }, 0)
                const revenue90Days = paidInvoices90Days?.reduce((first, last) => {
                    if (last.total) return first + last.total
                    return first
                }, 0)
                const revenueExcess = paidInvoicesExcess?.reduce((first, last) => {
                    if (last.total) return first + last.total
                    return first
                }, 0)

                const total_revenue = revenue30Days + revenue60Days + revenue90Days + revenueExcess


                console.log("FETCHING All CONTACTS")

                const allCustomers = await executePaginatedRequestandAggregate(async (page: number) => {

                    const customersRequestResponse = await fetch(`${apiDomain}/books/v3/contacts?organization_id=${organization_id}&page=${page}`, {
                        method: "GET",
                        headers: new Headers({
                            'Authorization': `Zoho-oauthtoken ${access_token}`
                        })
                    });

                    const contacts: { code: number, contacts: [{ [x: string]: any }], page_context: { has_more_page: boolean } } = await customersRequestResponse.json();
                    const customers: Array<{ [x: string]: any }> = contacts?.contacts.filter((contact) => {
                        return contact?.contact_type == "customer"
                    });
                    return { page_result: customers, has_more_page: contacts?.page_context?.has_more_page }

                })








                // // * Write all records to respective collections, and then add keys to the business_data
                // ? Is there 


                const receivables30daysIDS = await addFirestoreDocsAndReturnIDs(receivables30Days, `receivables/${business_id}`, `30d`)
                const receivables60daysIDS = await addFirestoreDocsAndReturnIDs(receivables60Days, `receivables/${business_id}`, `60d`)
                const receivables90daysIDS = await addFirestoreDocsAndReturnIDs(receivables90Days, `receivables/${business_id}`, `90d`)
                const receivablesExcessIDS = await addFirestoreDocsAndReturnIDs(receivablesExcess, `receivables/${business_id}`, `excess`)

                // const paidInvoices30daysIDS = await addFirestoreDocsAndReturnIDs(paidInvoices30Days, `cleared/${business_id}`, `30d`);
                // const paidInvoices60daysIDS = await addFirestoreDocsAndReturnIDs(paidInvoices60Days, `cleared/${business_id}`, `60d`)
                // const paidInvoices90daysIDS = await addFirestoreDocsAndReturnIDs(paidInvoices90Days, `cleared/${business_id}`, `90d`)
                // const paidInvoicesExcessIDS = await addFirestoreDocsAndReturnIDs(paidInvoicesExcess, `cleared/${business_id}`, `excess`)

                const allReceivables = [...new Set([...receivables30Days, ...receivables60Days, ...receivables90Days, ...receivablesExcess])];
                const allReceivableIDS = [...new Set([...receivables30daysIDS, ...receivables60daysIDS, ...receivables90daysIDS, ...receivablesExcessIDS])];
                // const allClearedIDS = [...new Set([...paidInvoices30daysIDS, ...paidInvoices60daysIDS, ...paidInvoices90daysIDS, ...paidInvoicesExcessIDS])];

                console.log("FETCHING INVOICES PER CUSTOMER...")
                let allCustomerIDS = [];
                for (const customer of allCustomers) {
                    const customerInvoices = allReceivables.filter((invoice) => {
                        return (invoice?.customer_id == customer?.contact_id);
                    })
                    if (customerInvoices.length > 0) {
                        customer['invoices'] = customerInvoices;
                        const customerCollectionRef = await addFirestoreDocFromData({ ...customer }, 'customers/business', `${business_id}`);
                        allCustomerIDS.push(customerCollectionRef.id);
                    }
                }



                // //     // const customerInvoicesRequest = await fetch(`${apiDomain}/books/v3/invoices?organization_id=${organization_id}&customer_id=${customer?.contact_id}`, {
                // //     //     method: "GET",
                // //     //     headers: new Headers({
                // //     //         'Authorization': `Zoho-oauthtoken ${access_token}`
                // //     //     })
                // //     // })
                // //     // const invoicesCustomer = await customerInvoicesRequest.json();
                // //     // const invoices = invoicesCustomer?.invoices;
                // //     // customer['invoices'] = invoicesCustomer?.invoices;
                // // }



                const dataToBeSynced = {
                    receivables: allReceivableIDS,
                    customers: allCustomerIDS,
                    outstanding: {
                        '30d': outstanding30Days, '60d': outstanding60Days, '90d': outstanding90Days, 'excess': outstandingExcess, 'total': total_outstanding
                    },
                    revenue: {
                        '30d': revenue30Days, '60d': revenue60Days, '90d': revenue90Days, 'excess': revenueExcess, 'total': total_revenue
                    },
                    dso: {
                        '30d': revenue30Days ? (outstanding30Days / revenue30Days) * 365 : 0,
                        '60d': revenue60Days ? (outstanding60Days / revenue60Days) * 365 : 0,
                        '90d': revenue90Days ? (outstanding90Days / revenue90Days) * 365 : 0,
                        'excess': revenueExcess ? (outstandingExcess / revenueExcess) * 365 : 0
                    }
                };



                if (businessDataRef?.outstanding && businessDataRef?.revenue && businessDataRef?.dso) {
                    dataToBeSynced['last_outstanding'] = businessDataRef?.outstanding;
                    dataToBeSynced['last_revenue'] = businessDataRef?.revenue;
                    dataToBeSynced['last_dso'] = businessDataRef?.dso;

                }
                // console.dir(dataToBeSynced, { depth: null })
                const businessDataUpdateRef = await updateFirestoreDocFromData(dataToBeSynced, 'businesses', `${business_id}`)

                return json({ status: 1 })
            }
        }
    }


    return json({ status: 0 })


}