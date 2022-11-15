import { ActionFunction, json } from "@remix-run/server-runtime";
import { publicEncrypt } from "crypto";
import { readFileSync } from "fs";
import moment from "moment";
import { env } from "process";
import { sendEvent } from "~/firebase/queries.server";
import type { NeutronEvent } from "~/models/events";
import { EventType, KYCEvent } from "~/models/events";
import { VERIFICATION_PROD_PAN_VERIFICATION_ENDPOINT } from "~/constants/cashfree";
import { requireUser } from "~/session.server";
import { trackJuneEvent } from "~/analytics/june-config.server";



/**
 * Action Function - Verify PAN Number
 */
export const action: ActionFunction = async ({ request, params }) => {

    const session = await requireUser(request);
    const data = await request.formData();
    const name = data.get('name');
    const pan = data.get('pan');
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

        const response = await fetch(VERIFICATION_PROD_PAN_VERIFICATION_ENDPOINT, {
            method: "POST",
            headers: {
                "x-client-id": PAYOUTS_PROD_CLIENT_ID,
                "x-client-secret": PAYOUTS_PROD_CLIENT_SECRET,
                "x-cf-signature": encryptedData.toString("base64"),
                "Content-Type": "application/json",
                "x-api-version": '2022-10-26'
            },
            body: JSON.stringify({ name: name, pan: pan })
        });
        const responseBody = await response.json();
        const valid = responseBody.valid;

        if (valid) {
            const panVerified: NeutronEvent = { uid: session?.metadata?.id, type: EventType.KYCEvent, event: KYCEvent.PANVerified, payload: { data: {}, message: "A PAN number has been successfully verified " } };
            // const updateRef = await updateFirestoreDocFromData({ panVerified: true }, 'metadata', `${session?.metadata?.id}`);
            trackJuneEvent(session?.metadata?.id, 'PAN verified', { pan: pan, name: name }, 'kycEvents');

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