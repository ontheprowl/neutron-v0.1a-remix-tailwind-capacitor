import { ActionFunction, json } from "@remix-run/server-runtime";
import { RSA_PKCS1_OAEP_PADDING } from "constants";
import { publicEncrypt, randomUUID } from "crypto";
import { readFileSync } from "fs";

import moment from 'moment'
import { Beneficiary } from "~/models/user";

const PAYOUTS_TEST_CLIENT_ID = 'CF129414CB1AVAM7ILBNF68P879G';
const PAYOUTS_TEST_CLIENT_SECRET = '0cf612cee0fc074d6f7306d7da05e42bd302ab14';
const PAYOUTS_TEST_GET_BENFICIARY_ENDPOINT = 'https://payout-gamma.cashfree.com/payout/v1/getBeneficiary/';
const PAYOUTS_TEST_ADD_BENEFICIARY_ENDPOINT = 'https://payout-gamma.cashfree.com/payout/v1/addBeneficiary';
const PAYOUTS_TEST_AUTHORIZE_ENDPOINT = 'https://payout-gamma.cashfree.com/payout/v1/authorize';
const PAYOUTS_TEST_REQUEST_TRANSFER_ENDPOINT = 'https://payout-gamma.cashfree.com/payout/v1/requestTransfer';
const PAYOUTS_PROD_CLIENT_ID = 'CF178581CB767HVOSD88JSNK6VEG';
const PAYOUTS_PROD_CLIENT_SECRET = 'bc040974304c2b6bb91174370ae10d7373088594';
const PAYOUTS_PROD_GET_BENFICIARY_ENDPOINT = 'https://payout-api.cashfree.com/payout/v1/getBeneficiary/';
const PAYOUTS_PROD_ADD_BENEFICIARY_ENDPOINT = 'https://payout-api.cashfree.com/payout/v1/addBeneficiary';
const PAYOUTS_PROD_AUTHORIZE_ENDPOINT = 'https://payout-api.cashfree.com/payout/v1/authorize';
const PAYOUTS_PROD_REQUEST_TRANSFER_ENDPOINT = 'https://payout-api.cashfree.com/payout/v1/requestTransfer';

// const beneficiary = {
//     "beneId": "JOHN18011344",
//     "name": "john doe",
//     "email": "johndoe@cashfree.com",
//     "phone": "9876543210",
//     "bankAccount": "00011020001772",
//     "ifsc": "HDFC0000001",
//     "address1": "ABC Street",
//     "city": "Bangalore",
//     "state": "Karnataka",
//     "pincode": "560001"
// }


export const action: ActionFunction = async ({ request }) => {

    const payload = await request.json();
    console.log(payload)
    const beneficiary : Beneficiary = payload.beneficiary;


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
    console.log("FETCHING AUTH TOKEN")
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

    const beneficiaryDetails = await getCashfreeBeneficiary(beneficiary,token);
    console.log("Beneficiary retrieved :")
    console.dir(beneficiary)


    const responseRequestTransfer = await fetch(PAYOUTS_PROD_REQUEST_TRANSFER_ENDPOINT, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
            beneId: beneficiaryDetails.data.beneId,
            amount: "1",
            transferId: randomUUID()
        }),

    })

    const responseRequestTransferBody = await responseRequestTransfer.json();
    return json(responseRequestTransferBody);
    // if (responseBody["payment_link"]) {
    //     return redirect(responseBody["payment_link"]);
    // } else {
    //     return json(responseBody)
    // }
}




async function getCashfreeBeneficiary(beneficiary: Beneficiary, token: string) {

    const responseGetBeneficiary = await fetch(PAYOUTS_PROD_GET_BENFICIARY_ENDPOINT + `${beneficiary.beneId}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    })

    let beneficiaryDetails = await responseGetBeneficiary.json();

    if (beneficiaryDetails.subCode && beneficiaryDetails.subCode == "404") {
        const responseAddBeneficiary = await fetch(PAYOUTS_PROD_ADD_BENEFICIARY_ENDPOINT, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(beneficiary)
        })
        const responseAddBeneficiaryBody = await responseAddBeneficiary.json();
        console.log('response (add beneficiary) is : ')
        console.log(responseAddBeneficiaryBody)

        const responseGetBeneficiary2 = await fetch(PAYOUTS_PROD_GET_BENFICIARY_ENDPOINT + `${beneficiary.beneId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            }
        })

        let beneficiaryDetails2 = await responseGetBeneficiary2.json();
        return beneficiaryDetails2
    }
    return beneficiaryDetails;
}