import type { ActionFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import moment from "moment";
import { getSingleDoc, setFirestoreDocFromData, updateFirestoreDocFromData, uploadBulkToCollection } from "~/firebase/queries.server";
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

    try {
        if (business_id) {
            const syncRoutine = new Promise(async (resolve, reject) => {
                console.log("BUSINESS_ID DETECTED")
                console.log(business_id)
                const businessDataRef = await getSingleDoc(`businesses/${business_id}`);

                // * Refresh Zoho creds if required
                let zohoCreds = businessDataRef?.creds;
                if (zohoCreds) {
                    const organizations = zohoCreds?.organizations
                    // ? Right now, pull data only from default organization. Will this need to be expanded in the future? 
                    const defaultOrganization = organizations?.filter((organization) => {
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
                            zohoCreds = { ...newCreds, accountsServer: zohoCreds.accountsServer, api_domain: zohoCreds.api_domain, refresh_token: zohoCreds.refresh_token, timestamp: new Date().getTime(), organizations: organizations };
                            const newZohoCredsUpdateRef = await updateFirestoreDocFromData({ creds: zohoCreds }, 'businesses', business_id)
                        }
                    }

                    if (zohoCreds?.access_token) {
                        const access_token = zohoCreds?.access_token;
                        const apiDomain = zohoCreds?.api_domain;


                        // * Fetch receivables according to four brackets ( 0-30days ( due date after 30 days before today), 0-60 days, 0-90 days, All)
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
                                    balance: invoice.balance,
                                }

                            })

                            return { page_result: reducedInvoices, has_more_page: response?.page_context?.has_more_page }
                        });

                        const sentInvoices = await executePaginatedRequestandAggregate(async (page: number) => {
                            const sentInvoicesRequest = await fetch(`${apiDomain}/books/v3/invoices?organization_id=${organization_id}&status=sent&page=${page}`, {
                                method: "GET",
                                headers: new Headers({
                                    'Authorization': `Zoho-oauthtoken ${access_token}`
                                })
                            })

                            const response: { code: number, invoices: [{ [x: string]: any }], page_context: { has_more_page: boolean } } = await sentInvoicesRequest.json();

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
                                    balance: invoice.balance,
                                }

                            })

                            return { page_result: reducedInvoices, has_more_page: response?.page_context?.has_more_page }
                        });


                        const allReceivables = [...receivableInvoices, ...sentInvoices]

                        const due = sentInvoices.reduce((first, last) => {
                            if (last.total) return first + last.total
                            return first
                        }, 0);

                        const oldestReceivableDate = allReceivables?.sort((a, b) => {
                            if (a?.date && b?.date) {
                                if (a?.date < b?.date) {
                                    return -1;
                                } else {
                                    return 1;
                                }
                            }
                            return 0;
                        })[0]?.date;

                        console.log(oldestReceivableDate)

                        const receivables30Days = allReceivables?.filter((invoice) => {
                            return invoice?.due_date > returnNormalizedDateString(moment().subtract(31, 'days').toDate())
                        });

                        const receivables60Days = allReceivables?.filter((invoice) => {
                            return invoice?.due_date > returnNormalizedDateString(moment().subtract(61, 'days').toDate()) && invoice?.due_date < returnNormalizedDateString(moment().subtract(30, 'days').toDate());
                        });

                        const receivables90Days = allReceivables?.filter((invoice) => {
                            return invoice?.due_date > returnNormalizedDateString(moment().subtract(91, 'days').toDate()) && invoice?.due_date < returnNormalizedDateString(moment().subtract(60, 'days').toDate());
                        });

                        const receivablesExcess = allReceivables?.filter((invoice) => {
                            return invoice?.due_date < returnNormalizedDateString(moment().subtract(90, 'days').toDate())
                        });

                        const outstanding30Days = receivables30Days?.reduce((first, last) => {
                            if (last.balance) return first + last.balance
                            return first
                        }, 0)
                        const outstanding60Days = [...receivables60Days, ...receivables30Days]?.reduce((first, last) => {
                            if (last.balance) return first + last.balance
                            return first
                        }, 0)
                        const outstanding90Days = [...receivables30Days, ...receivables60Days, ...receivables90Days]?.reduce((first, last) => {
                            if (last.balance) return first + last.balance
                            return first
                        }, 0)
                        const outstandingExcess = allReceivables?.reduce((first, last) => {
                            if (last.balance) return first + last.balance
                            return first
                        }, 0)

                        const total_outstanding = outstandingExcess





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
                                    balance: invoice.balance,
                                }

                            })

                            return { page_result: reducedInvoices, has_more_page: response?.page_context?.has_more_page }

                        });

                        const allInvoices = [...new Set([...allReceivables, ...paidInvoices])];

                        // // * Obtain Payments for paid invoices (https://www.zoho.com/books/api/v3/invoices/#list-invoice-payments)


                        const oldestPaidDate = paidInvoices?.sort((a, b) => {
                            if (a?.date && b?.date) {
                                if (a?.date < b?.date) {
                                    return -1;
                                } else {
                                    return 1;
                                }
                            }
                            return 0;
                        })[0]?.date;

                        console.log(oldestPaidDate)
                        const oldestInvoice = oldestPaidDate < oldestReceivableDate ? oldestPaidDate : oldestReceivableDate;

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
                        }, 0);
                        const revenue60Days = [...paidInvoices30Days, ...paidInvoices60Days].reduce((first, last) => {
                            if (last.total) return first + last.total
                            return first
                        }, 0);

                        const revenue90Days = [...paidInvoices30Days, ...paidInvoices60Days, ...paidInvoices90Days].reduce((first, last) => {
                            if (last.total) return first + last.total
                            return first
                        }, 0);

                        const revenueExcess = paidInvoices.reduce((first, last) => {
                            if (last.total) return first + last.total
                            return first
                        }, 0);

                        const total_revenue = revenueExcess;

                        // * credit sales (for a time period) = (outstanding + revenue) where due_date - issue_date >0 

                        const creditSales30 = [...receivables30Days, ...paidInvoices30Days]?.filter((invoice) => invoice?.date != invoice?.due_date).reduce((first, last) => {
                            if (last.total) return first + last.total
                            return first
                        }, 0);

                        const creditSales60 = [...receivables60Days, ...receivables30Days, ...paidInvoices30Days, ...paidInvoices60Days]?.filter((invoice) => invoice?.date != invoice?.due_date).reduce((first, last) => {
                            if (last.total) return first + last.total
                            return first
                        }, 0);

                        const creditSales90 = [...receivables30Days, ...receivables60Days, ...receivables90Days, ...paidInvoices30Days, ...paidInvoices60Days, ...paidInvoices90Days]?.filter((invoice) => invoice?.date != invoice?.due_date).reduce((first, last) => {
                            if (last.total) return first + last.total
                            return first
                        }, 0);

                        const creditSalesExcess = allInvoices?.filter((invoice) => invoice?.date != invoice?.due_date).reduce((first, last) => {
                            if (last.total) return first + last.total
                            return first
                        }, 0);


                        console.log(`TOTAL OUTSTANDING FOR 30 DAYS : ${outstanding30Days}, CREDIT SALES FOR 30 DAYS : ${creditSales30}`)
                        console.log(`TOTAL OUTSTANDING FOR 60 DAYS : ${outstanding60Days}, CREDIT SALES FOR 30 DAYS : ${creditSales60}`)

                        console.log(`TOTAL OUTSTANDING FOR 90 DAYS : ${outstanding90Days}, CREDIT SALES FOR 30 DAYS : ${creditSales90}`)

                        console.log(`TOTAL OUTSTANDING FOR ALL TIME : ${outstandingExcess}, CREDIT SALES FOR 30 DAYS : ${creditSalesExcess}`)

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


                        console.log("ASYNCHRONOUSLY UPLOADING ALL ZOHO DATA TO FIRESTORE...")

                        uploadBulkToCollection(receivables30Days, `receivables/${business_id}/30d`, 500, 'invoice_id');
                        uploadBulkToCollection(receivables60Days, `receivables/${business_id}/60d`, 500, 'invoice_id')
                        uploadBulkToCollection(receivables90Days, `receivables/${business_id}/90d`, 500, 'invoice_id')
                        uploadBulkToCollection(receivablesExcess, `receivables/${business_id}/excess`, 500, 'invoice_id')

                        uploadBulkToCollection(paidInvoices30Days, `paid/${business_id}/30d`, 500, 'invoice_id');
                        uploadBulkToCollection(paidInvoices60Days, `paid/${business_id}/60d`, 500, 'invoice_id')
                        uploadBulkToCollection(paidInvoices90Days, `paid/${business_id}/90d`, 500, 'invoice_id')
                        uploadBulkToCollection(paidInvoicesExcess, `paid/${business_id}/excess`, 500, 'invoice_id')

                        // const allClearedIDS = [...new Set([...paidInvoices30daysIDS, ...paidInvoices60daysIDS, ...paidInvoices90daysIDS, ...paidInvoicesExcessIDS])];


                        console.log("FETCHING INVOICES PER CUSTOMER...")
                        let customerIndexes: { [x: string]: any } = {};
                        for (const customer of allCustomers) {
                            const customerInvoices = allInvoices.filter((invoice) => {
                                return (invoice?.customer_id == customer?.contact_id);
                            });

                            if (customerInvoices.length > 0) {
                                customer['invoices'] = customerInvoices.map((invoice) => invoice?.invoice_id);
                                const customerReceivables = customerInvoices.filter((invoice) => invoice?.status == "overdue" || invoice?.status == "sent");
                                const customerPaid = customerInvoices.filter((invoice) => invoice?.status == "paid");
                                const outstanding = customerReceivables.reduce((first, last) => {
                                    if (last?.balance) return first + last.balance
                                    return first
                                }, 0);

                                const creditSales = customerInvoices.filter((invoice) => invoice.due_date != invoice?.date).reduce((first, last) => {
                                    if (last?.total) return first + last.total
                                    return first;
                                }, 0);
                                customer['outstanding'] = outstanding
                                customer['revenue'] = customerPaid.reduce((first, last) => {
                                    if (first?.total) return first.total + last.total
                                    return first + last.total
                                }, 0);
                                customer['dso'] = creditSales > 0 ? (customer['outstanding'] / creditSales) * 30 : 'Insufficient data'
                                customerIndexes[customer?.contact_id] = { id: customer?.contact_id, type: "Customer", index: customer?.vendor_name };
                            }
                        }
                        uploadBulkToCollection(allCustomers, `customers/business/${business_id}`, 500, 'contact_id');



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


                        const daysSinceEarliestInvoice = -Number(moment(oldestInvoice).diff(moment(), "days"));

                        const dataToBeSynced = {
                            due: due,
                            outstanding: {
                                '30d': outstanding30Days, '60d': outstanding60Days, '90d': outstanding90Days, 'excess': outstandingExcess, 'total': total_outstanding
                            },
                            revenue: {
                                '30d': revenue30Days, '60d': revenue60Days, '90d': revenue90Days, 'excess': revenueExcess, 'total': total_revenue
                            },
                            dso: {
                                '30d': creditSales30 > 0 ? (outstanding30Days / creditSales30) * 30 : 0,
                                '60d': creditSales60 > 0 ? (outstanding60Days / creditSales60) * 60 : 0,
                                '90d': creditSales90 > 0 ? (outstanding90Days / creditSales90) * 90 : 0,
                                'excess': creditSalesExcess > 0 ? (outstandingExcess / creditSalesExcess) * daysSinceEarliestInvoice : 0
                            }
                        };



                        if (businessDataRef?.outstanding && businessDataRef?.revenue && businessDataRef?.dso) {
                            dataToBeSynced['last_outstanding'] = businessDataRef?.outstanding;
                            dataToBeSynced['last_revenue'] = businessDataRef?.revenue;
                            dataToBeSynced['last_dso'] = businessDataRef?.dso;

                        }
                        console.log("UPDATING METADATA...")

                        // console.dir(dataToBeSynced, { depth: null })
                        const businessIndexesSetRef = await setFirestoreDocFromData(customerIndexes, 'indexes', `${business_id}`);
                        const businessDataUpdateRef = await updateFirestoreDocFromData(dataToBeSynced, 'businesses', `${business_id}`);

                        return resolve(json({ status: 1 }))
                    }
                }
            }).then(() => {
                console.log("ROUTINE COMPLETE")
            })
            return json({ status: 1 });

        }
    } catch (e: any) {
        console.dir(e, { depth: null })
        return json({ status: 0 })
    }

}