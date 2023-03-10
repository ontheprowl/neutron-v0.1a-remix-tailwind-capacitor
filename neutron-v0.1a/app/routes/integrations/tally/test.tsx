import type { ActionFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { parseString, parseStringPromise } from 'xml2js';
import { trimNullValues } from "~/utils/utils.server";


// * Need to finish this first thing in the morning

export const action: ActionFunction = async ({ request, params }) => {

    console.log("TEST TALLY CONNECTION...")
    const formData = await request.formData();
    const hostname = formData.get('tally_host');
    const port = formData.get('tally_port')
    const testTallyRequest = "<ENVELOPE></ENVELOPE>";


    const TALLY_ENDPOINT = `http://${hostname}:${port}`;

    try {
        const response = await fetch(TALLY_ENDPOINT, {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/xml',
            }),
            body: testTallyRequest,
            redirect: 'follow'
        })


        const testTallyData = await response.text();
        const testTallyDataJSON = await parseStringPromise(testTallyData, { preserveChildrenOrder: true, normalize: true })

        console.log(testTallyDataJSON)

        return json({ status: Number(testTallyDataJSON['RESPONSE'] == "Unknown Request, cannot be processed") })

    } catch (e) {
        console.log("Error")
        return json({ status: 0, reason: e })
    }



}