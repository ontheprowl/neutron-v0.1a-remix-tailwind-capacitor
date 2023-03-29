import { ActionFunction, json } from "@remix-run/server-runtime";
import moment from "moment";
import { addFirestoreDocFromData, addFirestoreDocsAndReturnIDs, getSingleDoc, setFirestoreDocFromData, updateFirestoreDocFromData, uploadBulkToCollection } from "~/firebase/queries.server";
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
            if (expired) {
                const response = await fetch(prependBaseURLForEnvironment(`/integrations/zoho/refresh?refresh_token=${zohoCreds.refresh_token}&business_id=${business_id}`), {
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


                const receivableInvoices = await executePaginatedRequestandAggregate(async (page: number) => {
                    const receivablesRequestResponse = await fetch(`${apiDomain}/books/v3/invoices?organization_id=${organization_id}&status=overdue&page=${page}`, {
                        method: "GET",
                        headers: new Headers({
                            'Authorization': `Zoho-oauthtoken ${access_token}`
                        })
                    })

                    const response: { code: number, invoices: [{ [x: string]: any }], page_context: { has_more_page: boolean } } = await receivablesRequestResponse.json();

                    const reducedInvoices = response?.invoices?.map((invoice) => {
                        return {
                            invoice_id: invoice.invoice_id,
                            date: invoice.date,
                            due_date: invoice.due_date,
                            due_days: invoice.due_days,
                            status: invoice.status,
                            invoice_number: invoice.invoice_number,
                            company_name: invoice.company_name,
                            customer_name: invoice.customer_name,
                            customer_id: invoice.customer_id,
                            total: invoice.total,
                            balance: invoice.balance
                        }

                    })

                    return { page_result: reducedInvoices, has_more_page: response?.page_context?.has_more_page }
                });




                const receivables30Days = receivableInvoices?.filter((invoice) => {
                    return invoice?.due_date > returnNormalizedDateString(moment().subtract(31, 'days').toDate())
                });

                const receivables60Days = receivableInvoices?.filter((invoice) => {
                    return invoice?.due_date > returnNormalizedDateString(moment().subtract(61, 'days').toDate()) && invoice?.due_date < returnNormalizedDateString(moment().subtract(30, 'days').toDate());
                });

                const receivables90Days = receivableInvoices?.filter((invoice) => {
                    return invoice?.due_date > returnNormalizedDateString(moment().subtract(91, 'days').toDate()) && invoice?.due_date < returnNormalizedDateString(moment().subtract(60, 'days').toDate());
                });

                const receivablesExcess = receivableInvoices?.filter((invoice) => {
                    return invoice?.due_date < returnNormalizedDateString(moment().subtract(90, 'days').toDate())
                });

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



                const paidInvoices = await executePaginatedRequestandAggregate(async (page: number) => {
                    const paidInvoicesRequest = await fetch(`${apiDomain}/books/v3/invoices?organization_id=${organization_id}&status=paid&page=${page}`, {
                        method: "GET",
                        headers: new Headers({
                            'Authorization': `Zoho-oauthtoken ${access_token}`
                        })
                    })

                    const response: { code: number, invoices: [{ [x: string]: any }], page_context: { has_more_page: boolean } } = await paidInvoicesRequest.json();

                    const reducedInvoices = response?.invoices?.map((invoice) => {
                        return {
                            invoice_id: invoice.invoice_id,
                            date: invoice.date,
                            due_date: invoice.due_date,
                            due_days: invoice.due_days,
                            status: invoice.status,
                            invoice_number: invoice.invoice_number,
                            company_name: invoice.company_name,
                            customer_name: invoice.customer_name,
                            customer_id: invoice.customer_id,
                            total: invoice.total,
                            balance: invoice.balance
                        }

                    })

                    return { page_result: reducedInvoices, has_more_page: response?.page_context?.has_more_page }

                });

                console.dir(paidInvoices);
                const paidInvoices30Days = paidInvoices?.filter((invoice) => {
                    return invoice?.due_date > returnNormalizedDateString(moment().subtract(31, 'days').toDate())
                });

                const paidInvoices60Days = paidInvoices?.filter((invoice) => {
                    return invoice?.due_date > returnNormalizedDateString(moment().subtract(61, 'days').toDate()) && invoice?.due_date < returnNormalizedDateString(moment().subtract(30, 'days').toDate());
                });

                const paidInvoices90Days = paidInvoices?.filter((invoice) => {
                    return invoice?.due_date > returnNormalizedDateString(moment().subtract(91, 'days').toDate()) && invoice?.due_date < returnNormalizedDateString(moment().subtract(60, 'days').toDate());
                });

                const paidInvoicesExcess = paidInvoices?.filter((invoice) => {
                    return invoice?.due_date < returnNormalizedDateString(moment().subtract(90, 'days').toDate())
                });

                const revenue30Days = paidInvoices30Days.reduce((first, last) => {
                    if (last.total) return first + last.total
                    return first
                }, 0)
                const revenue60Days = paidInvoices60Days.reduce((first, last) => {
                    if (last.total) return first + last.total
                    return first
                }, 0)
                const revenue90Days = paidInvoices90Days.reduce((first, last) => {
                    if (last.total) return first + last.total
                    return first
                }, 0)
                const revenueExcess = paidInvoicesExcess.reduce((first, last) => {
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

                // * Delete previously synced documents



                const receivables30daysIDS = await uploadBulkToCollection(receivables30Days, `receivables/${business_id}/30d`, 500,'invoice_id');
                const receivables60daysIDS = await uploadBulkToCollection(receivables60Days, `receivables/${business_id}/60d`, 500,'invoice_id')
                const receivables90daysIDS = await uploadBulkToCollection(receivables90Days, `receivables/${business_id}/90d`, 500, 'invoice_id')
                const receivablesExcessIDS = await uploadBulkToCollection(receivablesExcess, `receivables/${business_id}/excess`, 500, 'invoice_id')

                const paidInvoices30daysIDS = await uploadBulkToCollection(paidInvoices30Days, `paid/${business_id}/30d`, 500, 'invoice_id');
                const paidInvoices60daysIDS = await uploadBulkToCollection(paidInvoices60Days, `paid/${business_id}/60d`, 500, 'invoice_id')
                const paidInvoices90daysIDS = await uploadBulkToCollection(paidInvoices90Days, `paid/${business_id}/90d`, 500, 'invoice_id')
                const paidInvoicesExcessIDS = await uploadBulkToCollection(paidInvoicesExcess, `paid/${business_id}/excess`, 500, 'invoice_id')

                const allInvoices = [...new Set([...receivables30Days, ...receivables60Days, ...receivables90Days, ...receivablesExcess, ...paidInvoices30Days, ...paidInvoices60Days, ...paidInvoices90Days, ...paidInvoicesExcess])];
                // const allClearedIDS = [...new Set([...paidInvoices30daysIDS, ...paidInvoices60daysIDS, ...paidInvoices90daysIDS, ...paidInvoicesExcessIDS])];

                console.log("FETCHING INVOICES PER CUSTOMER...")
                let customerIndexes: { [x: string]: any } = {};
                for (const customer of allCustomers) {
                    const customerInvoices = allInvoices.filter((invoice) => {
                        return (invoice?.customer_id == customer?.contact_id);
                    })
                    if (customerInvoices.length > 0) {
                        customer['invoices'] = customerInvoices.map((invoice) => invoice?.invoice_id);
                        customerIndexes[customer?.contact_id] = { id: customer?.contact_id, type: "Customer", index: customer?.vendor_name };
                    }
                }
                const customerCollectionRef = await uploadBulkToCollection(allCustomers, `customers/business/${business_id}`, 500,'contact_id');



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
                const businessIndexesSetRef = await setFirestoreDocFromData(customerIndexes, 'indexes', `${business_id}`);
                const businessDataUpdateRef = await updateFirestoreDocFromData(dataToBeSynced, 'businesses', `${business_id}`);

                return json({ status: 1 })
            }
        }
    }


    return json({ status: 0 })


}