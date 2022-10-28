import type { ActionFunction } from "@remix-run/server-runtime";
import { publicEncrypt } from "crypto";
import { readFileSync } from "fs";
import moment from "moment";
import { env } from "process";
import { json } from "remix-utils";
import { VERIFICATION_PROD_AADHAAR_OTP_REQUEST_ENDPOINT } from "~/constants/cashfree";
import { requireUser } from "~/session.server";



export const action: ActionFunction = async ({ request, params }) => {
    const session = await requireUser(request);
    const data = await request.formData();
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

        console.log("\n SUBMITTING AADHAAR FOR VERIFICATION \n ")
        const response = await fetch(VERIFICATION_PROD_AADHAAR_OTP_REQUEST_ENDPOINT, {
            method: "POST",
            headers: {
                "x-client-id": PAYOUTS_PROD_CLIENT_ID,
                "x-client-secret": PAYOUTS_PROD_CLIENT_SECRET,
                "Content-Type": "application/json",
                "x-cf-signature": encryptedData.toString("base64"),

            },
            body: JSON.stringify({ aadhaar_number: aadhaarNumber })
        });
        const responseBody = await response.json();
        console.log(responseBody)
        const status = responseBody.status == "SUCCESS";


        if (status) {
            return json({ status: true, ref_id: responseBody.ref_id })
        }
        else {
            return json({ status: false });
        }

    }
    return null;

}