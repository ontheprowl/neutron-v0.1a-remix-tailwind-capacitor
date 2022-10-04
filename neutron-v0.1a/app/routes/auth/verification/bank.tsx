import { ActionFunction, json } from "@remix-run/server-runtime";
import { publicEncrypt } from "crypto";
import { readFileSync } from "fs";
import moment from "moment";
import { env } from "process";
import { sendEvent, updateFirestoreDocFromData } from "~/firebase/queries.server";
import { EventType, KYCEvent, NeutronEvent } from "~/models/events";
import { PAYOUTS_PROD_AUTHORIZE_ENDPOINT, PAYOUTS_PROD_BANK_ACCOUNT_VERIFICATION_ENDPOINT } from "~/models/kyc";
import { requireUser } from "~/session.server";






/**
 * Action Function - Verify Bank Account Number
 */
export const action: ActionFunction = async ({ request, params }) => {

    const session = await requireUser(request, true);
    const data = await request.formData();
    const name = data.get('name');
    const phone = data.get('phone');
    const ifsc = data.get('ifsc');
    const bankAccount = data.get('bankAccount');
    console.log(`ACCOUNT NO IS : ` + bankAccount);
    const PAYOUTS_PROD_CLIENT_ID = env.PAYOUTS_PROD_CLIENT_ID;
    const PAYOUTS_PROD_CLIENT_SECRET = env.PAYOUTS_PROD_CLIENT_SECRET;

    if (PAYOUTS_PROD_CLIENT_ID && PAYOUTS_PROD_CLIENT_SECRET && bankAccount) {



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
        const response = await fetch(PAYOUTS_PROD_AUTHORIZE_ENDPOINT, {
            method: "POST",
            headers: {
                "X-Client-Id": PAYOUTS_PROD_CLIENT_ID,
                "X-Client-Secret": PAYOUTS_PROD_CLIENT_SECRET,
                "X-Cf-Signature": encryptedData.toString("base64")
            },
        });
        const responseBody = await response.json();
        console.log(responseBody)
        const token = responseBody.data.token;

        console.log(token)

        console.log('\n PROCEEDING TO BANK ACCOUNT VERIFICATION \n');

        const bankAccountVerificationURL = PAYOUTS_PROD_BANK_ACCOUNT_VERIFICATION_ENDPOINT + '?' + new URLSearchParams({
            phone: phone,
            name: name,
            bankAccount: bankAccount,
            ifsc: ifsc
        }).toString();

        console.log(bankAccountVerificationURL);

        const bankAccountVerificationResponse = await fetch(bankAccountVerificationURL, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            },

        })

        const bankAccountResponseBody = await bankAccountVerificationResponse.json();
        console.log(bankAccountResponseBody);

        if (bankAccountResponseBody.accountStatus == "VALID") {
            const bankAccountVerified: NeutronEvent = { uid: session?.metadata?.id, type: EventType.KYCEvent, event: KYCEvent.BankAccountDetailsVerified, payload: { data: {}, message: "A bank account has been successfully verified " } };
            // const updateRef = await updateFirestoreDocFromData({ bankVerified: true }, 'metadata', `${session?.metadata?.id}`);
            await sendEvent(bankAccountVerified, [session?.metadata?.id]);
        }
        else {
            const bankAccountRejected: NeutronEvent = { uid: session?.metadata?.id, type: EventType.KYCEvent, event: KYCEvent.BankAccountDetailsRejected, payload: { data: {}, message: "A bank account has been rejected " } };
            // const updateRef = await updateFirestoreDocFromData({ bankVerified: false }, 'metadata', `${session?.metadata?.id}`);
            await sendEvent(bankAccountRejected, [session?.metadata?.id]);
        }

        return json(bankAccountResponseBody);

    }
    return null;
}
