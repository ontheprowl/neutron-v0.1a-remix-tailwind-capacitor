import type { ActionFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { publicEncrypt } from "crypto";
import { readFileSync } from "fs";
import moment from "moment";
import { env } from "process";
import { trackJuneEvent } from "~/analytics/june-config.server";
import { VERIFICATION_PROD_AADHAAR_OTP_VERIFY_ENDPOINT } from "~/constants/cashfree";
import { sendEvent } from "~/firebase/queries.server";
import type { NeutronEvent } from "~/models/events";
import { EventType, KYCEvent } from "~/models/events";
import { requireUser } from "~/session.server";



export const action: ActionFunction = async ({ request, params }) => {
    const session = await requireUser(request);
    const data = await request.formData();
    const otp = data.get('otp');
    const ref_id = data.get('ref_id');
    console.log(`OTP IS : ` + otp);
    const PAYOUTS_PROD_CLIENT_ID = env.PAYOUTS_PROD_CLIENT_ID;
    const PAYOUTS_PROD_CLIENT_SECRET = env.PAYOUTS_PROD_CLIENT_SECRET;

    if (PAYOUTS_PROD_CLIENT_ID && PAYOUTS_PROD_CLIENT_SECRET && otp && ref_id) {

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

        console.log("\n SUBMITTING AADHAAR FOR VERIFICATION \n ")
        const response = await fetch(VERIFICATION_PROD_AADHAAR_OTP_VERIFY_ENDPOINT, {
            method: "POST",
            headers: {
                "x-client-id": PAYOUTS_PROD_CLIENT_ID,
                "x-client-secret": PAYOUTS_PROD_CLIENT_SECRET,
                "Content-Type": "application/json",
                "x-cf-signature": encryptedData.toString("base64"),

            },
            body: JSON.stringify({ otp: otp, ref_id: ref_id })
        });
        const responseBody = await response.json();
        console.log(responseBody)
        const valid = responseBody.status == "VALID";


        if (valid) {
            const aadhaarVerified: NeutronEvent = { uid: session?.metadata?.id, type: EventType.KYCEvent, event: KYCEvent.AadhaarVerified, payload: { data: {}, message: "An Aadhaar number has been successfully verified " } };
            // const updateRef = await updateFirestoreDocFromData({ aadhaarVerified: true }, 'metadata', `${session?.metadata?.id}`);
            trackJuneEvent(session?.metadata?.id, 'Aadhaar verified', { ref_id: ref_id }, 'kycEvents');

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