import { ActionFunction, json } from "@remix-run/server-runtime";
import { parseStringPromise } from "xml2js";
import { parseNumbers } from "xml2js/lib/processors";
import { updateFirestoreDocFromData } from "~/firebase/queries.server";
import { requireUser } from "~/session.server";
import { trimNullValues } from "~/utils/utils.server";



export const action: ActionFunction = async ({ request, params }) => {

    const session = await requireUser(request);
    console.log("SYNC TALLY DATA WITH INSTANCE REQUEST RECEIVED...")



    const receivablesTallyRequest = "<ENVELOPE>\r\n    <HEADER>\r\n        <TALLYREQUEST>Export Data</TALLYREQUEST>\r\n    </HEADER>\r\n    <BODY>\r\n        <EXPORTDATA>\r\n            <REQUESTDESC>\r\n                <STATICVARIABLES>\r\n                    <!--Specify the period here-->\r\n                    <!--Specify the Export format here  HTML or XML or SDF-->\r\n                    <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>\r\n                </STATICVARIABLES>\r\n                <!--Specify the Report Name here-->\r\n                <REPORTNAME>Bills Receivable</REPORTNAME>\r\n            </REQUESTDESC>\r\n        </EXPORTDATA>\r\n    </BODY>\r\n</ENVELOPE>";
    const sundryDebtorsTallyRequest = "<!--This XML document contains tags to fetch Group Summary from Tally-->\r\n<!--It is equivalent to using the following option in Tally Software manually-->\r\n<!--Option: Gateway of Tally @Display @Account Books @Group Summary  -->\r\n<ENVELOPE>\r\n    <HEADER>\r\n        <TALLYREQUEST>Export Data</TALLYREQUEST>\r\n    </HEADER>\r\n    <BODY>\r\n        <EXPORTDATA>\r\n            <REQUESTDESC>\r\n                <STATICVARIABLES>\r\n                    <!--Specify the Period here-->\r\n\r\n                    <!--Specify the GroupName here-->\r\n                    <GROUPNAME>SUNDRY DEBTORS</GROUPNAME>\r\n                </STATICVARIABLES>\r\n                <!--Report Name-->\r\n                <REPORTNAME>Group Summary</REPORTNAME>\r\n            </REQUESTDESC>\r\n        </EXPORTDATA>\r\n    </BODY>\r\n</ENVELOPE>";
    const vouchersByLedgersRequest = (ledgerName: string) => {
        return `<ENVELOPE>\r\n    <HEADER>\r\n        <TALLYREQUEST>Export Data</TALLYREQUEST>\r\n    </HEADER>\r\n    <BODY>\r\n        <EXPORTDATA>\r\n            <REQUESTDESC>\r\n                <STATICVARIABLES>\r\n                    <!-- Specify the period here -->\r\n                    <!-- F12 @ Show billwise is set to Yes -->\r\n                    <DBBILLEXPLODEFLAG>YES</DBBILLEXPLODEFLAG>\r\n                    <!-- Specify the Ledger Name here -->\r\n                    <LEDGERNAME>${ledgerName}</LEDGERNAME>\r\n                </STATICVARIABLES>\r\n                <REPORTNAME>Ledger Vouchers</REPORTNAME>\r\n            </REQUESTDESC>\r\n        </EXPORTDATA>\r\n    </BODY>\r\n</ENVELOPE>`
    };

    const allReceiptVouchersRequest = "<!-- \r\nGenerated Using TallyConnector - https://github.com/Accounting-Companion/TallyConnector\r\nIncase of any errors raise a issue here - https://github.com/Accounting-Companion/TallyXmlsGenerator\r\n\r\n-->\r\n<ENVELOPE Action=\"\">\r\n    <HEADER>\r\n        <VERSION>1</VERSION>\r\n        <TALLYREQUEST>EXPORT</TALLYREQUEST>\r\n        <TYPE>COLLECTION</TYPE>\r\n        <ID>CustomVoucherCollection</ID>\r\n    </HEADER>\r\n    <BODY>\r\n        <DESC>\r\n            <STATICVARIABLES>\r\n      </STATICVARIABLES>\r\n            <TDL>\r\n                <TDLMESSAGE>\r\n                    <COLLECTION ISMODIFY=\"No\" ISFIXED=\"No\" ISINITIALIZE=\"No\" ISOPTION=\"No\" ISINTERNAL=\"No\" NAME=\"CustomVoucherCollection\">\r\n                        <TYPE>Vouchers : VoucherType</TYPE>\r\n                        <FETCH>AMOUNT</FETCH>\r\n                        <CHILDOF>$$VchTypeReceipt</CHILDOF>\r\n                        <BELONGSTO>Yes</BELONGSTO>\r\n                        <NATIVEMETHOD>*, *.*</NATIVEMETHOD>\r\n                    </COLLECTION>\r\n                </TDLMESSAGE>\r\n            </TDL>\r\n        </DESC>\r\n    </BODY>\r\n</ENVELOPE>";


    const TALLY_ENDPOINT = 'http://localhost:9000';
    const responseReceivables = await fetch(TALLY_ENDPOINT, {
        method: 'POST',
        headers: new Headers({
            'Content-Type': 'application/xml',
        }),
        body: receivablesTallyRequest,
        redirect: 'follow'
    })

    await new Promise(r => setTimeout(r, 100));


    const responseDebtors = await fetch(TALLY_ENDPOINT, {
        method: 'POST',
        headers: new Headers({
            'Content-Type': 'application/xml',
        }),
        body: sundryDebtorsTallyRequest,
        redirect: 'follow'
    })

    await new Promise(r => setTimeout(r, 100));


    const responseReceipts = await fetch(TALLY_ENDPOINT, {
        method: 'POST',
        headers: new Headers({
            'Content-Type': 'application/xml',
        }),
        body: allReceiptVouchersRequest,
        redirect: 'follow'
    })

    await new Promise(r => setTimeout(r, 100));


    // * Process Receipt Vouchers (Cleared Invoices)
    let paidInvoices: any[] = []
    const receiptsData = await responseReceipts.text();
    const receiptsDataJSON = await parseStringPromise(receiptsData, { preserveChildrenOrder: true, normalize: true })
    console.log("DATA FROM TALLY")

    trimNullValues(receiptsDataJSON)

    const receiptsDataJSONCollection = receiptsDataJSON["ENVELOPE"]["BODY"][0]["DATA"][0]["COLLECTION"]


    if (receiptsDataJSONCollection[0]) {
        let finalReceiptsVouchers: [{ [x: string]: any }] = receiptsDataJSONCollection[0]["VOUCHER"]
        paidInvoices = finalReceiptsVouchers.map((voucher) => {
            console.log("VOUCHER DETECTED...")
            return { date: voucher['DATE'][0], effectiveDate: voucher['EFFECTIVEDATE'][0], customer: voucher['PARTYLEDGERNAME'][0], note: voucher['NARRATION'][0], number: voucher['VOUCHERNUMBER'][0], id: voucher['VOUCHERKEY'][0], amount: voucher['AMOUNT'][0]['_'] }
        })
    } else {
        paidInvoices = []
    }

    console.dir(paidInvoices, { depth: null })

    const total_revenue = paidInvoices.reduce((first, last) => {
        if (last.amount) return first + Number(last.amount)
        return first
    }, 0)

    // const finalReceivablesData = receivablesDataJSONParsed?.BILLFIXED?.map((receivablesEntry, entryIndex) => {
    //     return { ...receivablesEntry, BILLCL: receivablesDataJSONParsed?.BILLCL[entryIndex], BILLDUE: receivablesDataJSONParsed?.BILLDUE[entryIndex], BILLOVERDUE: receivablesDataJSONParsed?.BILLOVERDUE[entryIndex] }
    // })

    // const totalRevenue = finalReceivablesData.reduce((first, last) => {
    //     if (last.BILLCL) return first + Number(last.BILLCL)
    //     return first
    // }, 0)





    // * Process Receivables (Pending Invoices)
    const receivablesData = await responseReceivables.text();
    const receivablesDataJSON = await parseStringPromise(receivablesData, { preserveChildrenOrder: true, normalize: true })
    console.log("DATA FROM TALLY")

    trimNullValues(receivablesDataJSON)

    const receivablesDataJSONParsed: {
        'BILLFIXED': Array<{ [x: string]: any }>, 'BILLCL': Array<string>, "BILLDUE": Array<string>,
        "BILLOVERDUE": Array<string>
    } = receivablesDataJSON["ENVELOPE"]

    const finalReceivablesData = receivablesDataJSONParsed?.BILLFIXED?.map((receivablesEntry, entryIndex) => {
        return { date: receivablesEntry['BILLDATE'][0], customer: receivablesEntry['BILLPARTY'][0], refNo: receivablesEntry['BILLREF'][0], amount: -Number(receivablesDataJSONParsed?.BILLCL[entryIndex]), dueDate: receivablesDataJSONParsed?.BILLDUE[entryIndex], overdueDays: receivablesDataJSONParsed?.BILLOVERDUE[entryIndex] }
    })

    const totalOutstanding = finalReceivablesData.reduce((first, last) => {
        if (last.amount) return first + Number(last.amount)
        return first
    }, 0)

    const receivables_revenue_ratio = totalOutstanding / total_revenue
    const dso = {}
    dso['weekly'] = receivables_revenue_ratio * 7
    dso['monthly'] = receivables_revenue_ratio * 30
    dso['annual'] = receivables_revenue_ratio * 365


    // * Process Customers (Ledgers under Group 'Sundry Debtors')
    const debtorsData = await responseDebtors.text();
    const debtorsDataJSON = await parseStringPromise(debtorsData, {
        preserveChildrenOrder: true, normalize: true, trim: true, valueProcessors: [parseNumbers]
    });

    // trimNullValues(debtorsDataJSON)

    const debtorsDataJSONParsed: {
        'DSPACCINFO': Array<{ [x: string]: any }>, 'DSPACCNAME': Array<{ [x: string]: any }>
    } = debtorsDataJSON["ENVELOPE"]

    const customers: [{ name: '', credit: number, debit: number, vouchers: any[] }] = debtorsDataJSONParsed?.DSPACCINFO?.flatMap((info, index) => {
        return { name: debtorsDataJSONParsed?.DSPACCNAME[index]?.DSPDISPNAME[0] }
    })

    // // console.log(finalReceivablesData)


    // * Process Customer-wise Vouchers ( Invoices & Receipts )
    for (const customer of customers) {
        await new Promise(r => setTimeout(r, 100));

        const name = customer?.name;
        let responseForParticularCustomer = await fetch(TALLY_ENDPOINT, {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/xml',
            }),
            body: vouchersByLedgersRequest(name),
            redirect: 'follow'
        })
        const ledgerVouchersData = await responseForParticularCustomer.text();

        const ledgerVouchersDataJSON = await parseStringPromise(ledgerVouchersData, { preserveChildrenOrder: true, normalize: true })
        console.log("DATA FOR NEUTRON CUSTOMERS")

        trimNullValues(ledgerVouchersDataJSON)



        const vouchersDataParsed: {
            [x: string]: Array<string>
        } = ledgerVouchersDataJSON["ENVELOPE"]


        if (vouchersDataParsed) {
            customer["vouchers"] = [];
            vouchersDataParsed['AMOUNT'] = vouchersDataParsed['AMOUNT'].filter((value, index) => {
                if (value == "Dr" || value === "Cr") {
                    return null
                }
                return value
            })

            vouchersDataParsed['DSPVCHDATE'] = vouchersDataParsed['DSPVCHDATE'].filter((value, index) => {
                if (value == '') {
                    return null
                }
                return value
            })
            customer["vouchers"] = vouchersDataParsed['DSPVCHDATE'].map((value, index) => {
                return { date: value, account: vouchersDataParsed['DSPVCHLEDACCOUNT'][index], type: vouchersDataParsed['DSPVCHTYPE'][index], debit: vouchersDataParsed['DSPVCHDRAMT'][index], credit: vouchersDataParsed['DSPVCHCRAMT'][index], name: vouchersDataParsed['NAME'][index], amount: vouchersDataParsed['AMOUNT'][index] }
            })
        }


    }



    console.dir(customers, { depth: null })

    const dataToBeSynced = { receivables: finalReceivablesData, outstanding: totalOutstanding, cleared: paidInvoices, revenue: total_revenue, dso: dso, customers: customers };

    console.dir(dataToBeSynced, { depth: null })
    const businessDataRef = await updateFirestoreDocFromData(dataToBeSynced, 'businesses', `${session?.metadata?.businessID}`)

    return json({ status: 1 })
}