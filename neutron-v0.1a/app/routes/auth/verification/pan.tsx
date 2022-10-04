import { ActionFunction, json } from "@remix-run/server-runtime";
import { publicEncrypt } from "crypto";
import { readFileSync } from "fs";
import moment from "moment";
import { env } from "process";
import { sendEvent, updateFirestoreDocFromData } from "~/firebase/queries.server";
import { EventType, KYCEvent, NeutronEvent } from "~/models/events";
import { PAYOUTS_PROD_AUTHORIZE_ENDPOINT, PAYOUTS_PROD_BANK_ACCOUNT_VERIFICATION_ENDPOINT, VERIFICATION_PROD_PAN_VERIFICATION_ENDPOINT } from "~/models/kyc";
import { requireUser } from "~/session.server";



/**
 * Action Function - Verify PAN Number
 */
export const action: ActionFunction = async ({ request, params }) => {

    const session = await requireUser(request);
    const data = await request.formData();
    const name = data.get('name');
    const pan = data.get('pan');
    console.log(`PAN IS : ` + pan);
    const PAYOUTS_PROD_CLIENT_ID = env.PAYOUTS_PROD_CLIENT_ID;
    const PAYOUTS_PROD_CLIENT_SECRET = env.PAYOUTS_PROD_CLIENT_SECRET;

    if (PAYOUTS_PROD_CLIENT_ID && PAYOUTS_PROD_CLIENT_SECRET && pan) {

        const UNIX_TIMESTAMP = moment().unix();
        const authorizationPayload = PAYOUTS_PROD_CLIENT_ID + "." + UNIX_TIMESTAMP;

        const publicKey = readFileSync('cf-production-payouts.pem', { encoding: "utf8" });
        // if (err) return getAccessToken(oAuth2Client, callback);
        const encryptedData = publicEncrypt(
            {
                key: publicKey,

            },
            // We convert the data string to a buffer using `Buffer.from`
            Buffer.from(authorizationPayload)
        );

        console.log("\n FETCHING AUTH TOKEN \n ")
        const response = await fetch(VERIFICATION_PROD_PAN_VERIFICATION_ENDPOINT, {
            method: "POST",
            headers: {
                "x-client-id": PAYOUTS_PROD_CLIENT_ID,
                "x-client-secret": PAYOUTS_PROD_CLIENT_SECRET,
                "x-cf-signature": encryptedData.toString("base64"),
                "Content-Type": "application/json",
                "x-api-version":'2022-10-26'
            },
            body: JSON.stringify({ name: name, pan: pan })
        });
        const responseBody = await response.json();
        console.log(responseBody)
        const valid = responseBody.valid;

        if (valid) {
            const panVerified: NeutronEvent = { uid: session?.metadata?.id, type: EventType.KYCEvent, event: KYCEvent.PANVerified, payload: { data: {}, message: "A PAN number has been successfully verified " } };
            // const updateRef = await updateFirestoreDocFromData({ panVerified: true }, 'metadata', `${session?.metadata?.id}`);
            await sendEvent(panVerified, [session?.metadata?.id]);
        }
        else {
            const panRejected: NeutronEvent = { uid: session?.metadata?.id, type: EventType.KYCEvent, event: KYCEvent.PANRejected, payload: { data: {}, message: "A PAN number has been rejected " } };
            // const updateRef = await updateFirestoreDocFromData({ panVerified: false }, 'metadata', `${session?.metadata?.id}`);
            await sendEvent(panRejected, [session?.metadata?.id]);
        }

        return json(responseBody);

    }
    return null;
}