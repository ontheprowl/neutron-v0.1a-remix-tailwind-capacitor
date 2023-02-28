import type { ActionFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { parseString, parseStringPromise } from 'xml2js';
import { trimNullValues } from "~/utils/utils.server";


export const action: ActionFunction = async ({ request, params }) => {

    console.log("SYNC TALLY DATA WITH INSTANCE REQUEST RECEIVED...")

    const salesVouchersTallyRequest = "<ENVELOPE>\r\n    <HEADER>\r\n        <TALLYREQUEST>Export Data</TALLYREQUEST>\r\n    </HEADER>\r\n    <BODY>\r\n        <EXPORTDATA>\r\n            <REQUESTDESC>\r\n <!--Specify the Report Name here-->\r\n                <REPORTNAME>Ledger Masters</REPORTNAME>\r\n            </REQUESTDESC>\r\n        </EXPORTDATA>\r\n    </BODY>\r\n</ENVELOPE>";


    const TALLY_ENDPOINT = 'http://localhost:9000';
    const response = await fetch(TALLY_ENDPOINT, {
        method: 'POST',
        headers: new Headers({
            'Content-Type': 'application/xml',
        }),
        body: salesVouchersTallyRequest,
        redirect: 'follow'
    })

    console.log()

    const salesVouchersData = await response.text();
    const salesVouchersDataJSON = await parseStringPromise(salesVouchersData, { preserveChildrenOrder: true, normalize: true })
    console.log("DATA FROM TALLY")

    trimNullValues(salesVouchersDataJSON)

    return json({
        invoices: salesVouchersDataJSON["ENVELOPE"]
        // , receivables: 
    })

}