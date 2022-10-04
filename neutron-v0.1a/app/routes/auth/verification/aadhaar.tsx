import { ActionFunction, json } from "@remix-run/server-runtime";
import { publicEncrypt } from "crypto";
import { readFileSync } from "fs";
import moment from "moment";
import { env } from "process";
import { sendEvent, updateFirestoreDocFromData } from "~/firebase/queries.server";
import { EventType, KYCEvent, NeutronEvent } from "~/models/events";
import { VERIFICATION_PROD_AADHAAR_VERIFICATION_ENDPOINT } from "~/models/kyc";
import { requireUser } from "~/session.server";



/**
 * Action Function - Verify Aadhaar Number via OTP 
 */
export const action: ActionFunction = async ({ request, params }) => {

    const session = await requireUser(request);
    const data = await request.formData();
    const name = data.get('name');
    const aadhaarNumber = data.get('aadhaarNumber');
    console.log(`AADHAAR IS : ` + aadhaarNumber);
    const PAYOUTS_PROD_CLIENT_ID = env.PAYOUTS_PROD_CLIENT_ID;
    const PAYOUTS_PROD_CLIENT_SECRET = env.PAYOUTS_PROD_CLIENT_SECRET;

    if (PAYOUTS_PROD_CLIENT_ID && PAYOUTS_PROD_CLIENT_SECRET && aadhaarNumber) {

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
        const response = await fetch(VERIFICATION_PROD_AADHAAR_VERIFICATION_ENDPOINT, {
            method: "POST",
            headers: {
                "x-client-id": PAYOUTS_PROD_CLIENT_ID,
                "x-client-secret": PAYOUTS_PROD_CLIENT_SECRET,
                "x-cf-signature": encryptedData.toString("base64"),
                "Content-Type": "application/json",
                "x-api-version": 'v1'
            },
            body: JSON.stringify({ name: name, aadhaarNumber: aadhaarNumber })
        });
        const responseBody = await response.json();
        console.log(responseBody)
        const valid = responseBody.valid;


        if (valid) {
            const aadhaarVerified: NeutronEvent = { uid: session?.metadata?.id, type: EventType.KYCEvent, event: KYCEvent.AadhaarVerified, payload: { data: {}, message: "An Aadhaar number has been successfully verified " } };
            // const updateRef = await updateFirestoreDocFromData({ aadhaarVerified: true }, 'metadata', `${session?.metadata?.id}`);
            await sendEvent(aadhaarVerified, [session?.metadata?.id]);
        }
        else {
            const aadhaarRejected: NeutronEvent = { uid: session?.metadata?.id, type: EventType.KYCEvent, event: KYCEvent.AadhaarRejected, payload: { data: {}, message: "An Aadhaar number has been rejected " } };
            // const updateRef = await updateFirestoreDocFromData({ aadhaarVerified: false }, 'metadata', `${session?.metadata?.id}`);
            await sendEvent(aadhaarRejected, [session?.metadata?.id]);
        }
        return json(responseBody);

    }
    return null;
}