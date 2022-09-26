import { ActionFunction, json } from "@remix-run/server-runtime";
import { publicEncrypt } from "crypto";
import { readFileSync } from "fs";
import moment from "moment";
import { env } from "process";
import { requireUser } from "~/session.server";



const PAYOUTS_PROD_GET_BENFICIARY_ENDPOINT = 'https://payout-api.cashfree.com/payout/v1/getBeneficiary/';
const PAYOUTS_PROD_ADD_BENEFICIARY_ENDPOINT = 'https://payout-api.cashfree.com/payout/v1/addBeneficiary';
const PAYOUTS_PROD_AUTHORIZE_ENDPOINT = 'https://payout-api.cashfree.com/payout/v1/authorize';
const PAYOUTS_PROD_REQUEST_TRANSFER_ENDPOINT = 'https://payout-api.cashfree.com/payout/v1/requestTransfer';
const PAYOUTS_PROD_BANK_ACCOUNT_VERIFICATION_ENDPOINT = 'https://payout-api.cashfree.com/payout/v1.2/validation/bankDetails';


/**
 * Action Function - Verify Bank Account Number
 */
export const action: ActionFunction = async ({ request, params }) => {

    // const session = await requireUser(request, true);
    const data = await request.json();
    const name = data['name'];
    const phone = data['phone'];
    const ifsc = data['ifsc'];
    const bankAccount = data['bankAccount'];
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
                "Content-Type": 'application/json'
            },

        })

        const bankAccountResponseBody = await bankAccountVerificationResponse.json();
        console.log(bankAccountResponseBody)
        return json(bankAccountResponseBody);

    }
}