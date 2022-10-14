import type { ActionFunction } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { env } from "process";
import { json } from "remix-utils";


const appID = '12941442dc7e98be1c7fa15822414921';
const appSecret = 'TEST9b544dc2c2625964029bd3e5869cff5e6a120ac1';





export const action: ActionFunction = async ({ request }) => {

    const PAYMENTS_PROD_APP_ID = env.PAYMENTS_PROD_APP_ID;
    const PAYMENTS_PROD_APP_SECRET = env.PAYMENTS_PROD_APP_SECRET;

    if (PAYMENTS_PROD_APP_ID && PAYMENTS_PROD_APP_SECRET) {
        console.log('request received!!!')
        console.log('payload is :')
        const payloadString = (await request.formData()).get("payload");
        console.log(payloadString)

        const payload = JSON.parse(payloadString)

        const response = await fetch("https://api.cashfree.com/pg/orders", {
            method: "POST",
            headers: {
                "x-client-id": PAYMENTS_PROD_APP_ID,
                "x-client-secret": PAYMENTS_PROD_APP_SECRET,
                "x-api-version": '2022-01-01',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload),
        });
        const responseBody = await response.json();
        console.log('response body is : ')
        console.log(responseBody)
        if (responseBody["payment_link"]) {
            console.log("payment link exists....")
            console.log(responseBody.payment_link)
            return redirect(responseBody["payment_link"]);
        } else {
            return json(responseBody)
        }
    }


}