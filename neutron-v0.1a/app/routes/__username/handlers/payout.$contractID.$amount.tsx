import type { ActionFunction} from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { publicEncrypt, randomUUID } from "crypto";
import { readFileSync } from "fs";

import moment from 'moment'
import { env } from "process";
import { getSingleDoc, sendEvent } from "~/firebase/queries.server";
import type { NeutronEvent } from "~/models/events";
import { ContractEvent, EventType } from "~/models/events";
import type { Beneficiary } from "~/models/user";

// const PAYOUTS_TEST_CLIENT_ID = 'CF129414CB1AVAM7ILBNF68P879G';
// const PAYOUTS_TEST_CLIENT_SECRET = '0cf612cee0fc074d6f7306d7da05e42bd302ab14';
// const PAYOUTS_TEST_GET_BENFICIARY_ENDPOINT = 'https://payout-gamma.cashfree.com/payout/v1/getBeneficiary/';
// const PAYOUTS_TEST_ADD_BENEFICIARY_ENDPOINT = 'https://payout-gamma.cashfree.com/payout/v1/addBeneficiary';
// const PAYOUTS_TEST_AUTHORIZE_ENDPOINT = 'https://payout-gamma.cashfree.com/payout/v1/authorize';
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


export const action: ActionFunction = async ({ request, params }) => {

    const payoutValue = params.amount?.replace('₹','');
    const contractID = params.contractID;
    const ownerUsername = params.username;
    const PAYOUTS_PROD_CLIENT_ID = env.PAYOUTS_PROD_CLIENT_ID;
    const PAYOUTS_PROD_CLIENT_SECRET = env.PAYOUTS_PROD_CLIENT_SECRET;

    if (PAYOUTS_PROD_CLIENT_ID && PAYOUTS_PROD_CLIENT_SECRET && payoutValue) {
        const data = await request.formData();
        const payload = data.get('beneficiary');
        const beneficiary: Beneficiary = JSON.parse(payload);

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

        const response = await fetch(PAYOUTS_PROD_AUTHORIZE_ENDPOINT, {
            method: "POST",
            headers: {
                "X-Client-Id": PAYOUTS_PROD_CLIENT_ID,
                "X-Client-Secret": PAYOUTS_PROD_CLIENT_SECRET,
                "X-Cf-Signature": encryptedData.toString("base64")
            },
        });
        const responseBody = await response.json();
        const token = responseBody.data.token;


        const beneficiaryDetails = await getCashfreeBeneficiary(beneficiary, token);

        const responseRequestTransfer = await fetch(PAYOUTS_PROD_REQUEST_TRANSFER_ENDPOINT, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
                beneId: beneficiaryDetails.data.beneId,
                amount: payoutValue,
                transferId: randomUUID()
            }),

        })

        const responseRequestTransferBody = await responseRequestTransfer.json();
        const uidMapping = await getSingleDoc(`/userUIDS/${ownerUsername}`);
        const ownerUID = uidMapping?.uid;
        const payoutCompletedEvent: NeutronEvent = { id: contractID, uid: ownerUID, type: EventType.ContractEvent, event: ContractEvent.ContractPayoutCompleted, payload: { data: responseRequestTransferBody, message: "Contract payout has been completed" } }
        const eventAdded = await sendEvent(payoutCompletedEvent);
        return json(responseRequestTransferBody);
        // if (responseBody["payment_link"]) {
        //     return redirect(responseBody["payment_link"]);
        // } else {
        //     return json(responseBody)
        // }
    }


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