import { ActionFunction, json } from "@remix-run/server-runtime";
import { RSA_PKCS1_OAEP_PADDING } from "constants";
import { publicEncrypt, randomUUID } from "crypto";
import { readFileSync } from "fs";

import moment from 'moment'

const PAYOUTS_TEST_CLIENT_ID = 'CF129414CB1AVAM7ILBNF68P879G';
const PAYOUTS_TEST_CLIENT_SECRET = '0cf612cee0fc074d6f7306d7da05e42bd302ab14';
const PAYOUTS_TEST_GET_BENFICIARY_ENDPOINT = 'https://payout-gamma.cashfree.com/payout/v1/getBeneficiary/';
const PAYOUTS_TEST_ADD_BENEFICIARY_ENDPOINT = 'https://payout-gamma.cashfree.com/payout/v1/addBeneficiary';
const PAYOUTS_TEST_AUTHORIZE_ENDPOINT = 'https://payout-gamma.cashfree.com/payout/v1/authorize';
const PAYOUTS_TEST_REQUEST_TRANSFER_ENDPOINT = 'https://payout-gamma.cashfree.com/payout/v1/requestTransfer';

const beneficiary = {
    "beneId": "JOHN18011344",
    "name": "john doe",
    "email": "johndoe@cashfree.com",
    "phone": "9876543210",
    "bankAccount": "00011020001772",
    "ifsc": "HDFC0000001",
    "address1": "ABC Street",
    "city": "Bangalore",
    "state": "Karnataka",
    "pincode": "560001"
}


export const action: ActionFunction = async ({ request }) => {

    const UNIX_TIMESTAMP = moment().unix();
    const payload = PAYOUTS_TEST_CLIENT_ID + "." + UNIX_TIMESTAMP;

    const publicKey = readFileSync('cf-test-payouts.pem', { encoding: "utf8" });
    // if (err) return getAccessToken(oAuth2Client, callback);
    const encryptedData = publicEncrypt(
        {
            key: publicKey,

        },
        // We convert the data string to a buffer using `Buffer.from`
        Buffer.from(payload)
    );
    const response = await fetch(PAYOUTS_TEST_AUTHORIZE_ENDPOINT, {
        method: "POST",
        headers: {
            "X-Client-Id": PAYOUTS_TEST_CLIENT_ID,
            "X-Client-Secret": PAYOUTS_TEST_CLIENT_SECRET,
            "X-Cf-Signature": encryptedData.toString("base64")
        },
    });
    const responseBody = await response.json();
    const token = responseBody.data.token;

    const beneficiary = await getCashfreeBeneficiary(token);
    console.log("Beneficiary retrieved :")
    console.dir(beneficiary)


    const responseRequestTransfer = await fetch(PAYOUTS_TEST_REQUEST_TRANSFER_ENDPOINT, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
            beneId: beneficiary.data.beneId,
            amount: "10000",
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




async function getCashfreeBeneficiary(token: string) {

    const responseGetBeneficiary = await fetch(PAYOUTS_TEST_GET_BENFICIARY_ENDPOINT + `${beneficiary.beneId}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    })

    let beneficiaryDetails = await responseGetBeneficiary.json();

    if (beneficiaryDetails.subCode && beneficiaryDetails.subCode == "404") {
        const responseAddBeneficiary = await fetch(PAYOUTS_TEST_ADD_BENEFICIARY_ENDPOINT, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(beneficiary)
        })
        const responseAddBeneficiaryBody = await responseAddBeneficiary.json();
        console.log('response (add beneficiary) is : ')
        console.log(responseAddBeneficiaryBody)

        const responseGetBeneficiary2 = await fetch(PAYOUTS_TEST_GET_BENFICIARY_ENDPOINT + `${beneficiary.beneId}`, {
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