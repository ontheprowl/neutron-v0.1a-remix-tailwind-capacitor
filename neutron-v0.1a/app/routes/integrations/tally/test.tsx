import type { ActionFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { parseString, parseStringPromise } from 'xml2js';
import { setFirestoreDocFromData, updateFirestoreDocFromData } from "~/firebase/queries.server";
import { requireUser } from "~/session.server";
import { trimNullValues } from "~/utils/utils.server";



/**
 * Test Tally Connection, and set currently active integration as tally.
 */
export const action: ActionFunction = async ({ request, params }) => {

    const session = await requireUser(request);

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

        const businessUIDRef = await updateFirestoreDocFromData({ integration: 'tally', creds: { hostname: hostname, port: port } }, 'businesses', `${session?.metadata?.businessID}`)



        return json({ status: Number(testTallyDataJSON['RESPONSE'] == "Unknown Request, cannot be processed") })

    } catch (e) {
        console.log("Error")
        return json({ status: 0, reason: e })
    }



}