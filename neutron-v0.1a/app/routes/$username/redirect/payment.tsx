import { ActionFunction, LoaderFunction, redirect } from "@remix-run/server-runtime";
import { json } from "remix-utils";


const appID = '12941442dc7e98be1c7fa15822414921';
const appSecret = 'TEST9b544dc2c2625964029bd3e5869cff5e6a120ac1';
const prod_appID = '1785815d5ddb6cf020fdaaf47a185871';
const prod_appSecret = '4e287021ea5b09522df4324556d21db45071ab83';




export const action: ActionFunction = async ({ request }) => {
    console.log('request received!!!')
    console.log('payload is :')
    const payloadString = (await request.formData()).get("payload");
    console.log(payloadString)

    const payload = JSON.parse(payloadString)

    const response = await fetch("https://api.cashfree.com/pg/orders", {
        method: "POST",
        headers: {
            "x-client-id": prod_appID,
            "x-client-secret": prod_appSecret,
            "x-api-version":'2022-01-01',
            'Content-Type':'application/json',
            'Accept':'application/json'
        },
        body: JSON.stringify(payload),
    });
    const responseBody = await response.json();
    console.log('response body is : ')
    console.log(responseBody)
    if (responseBody["payment_link"]) {
        return redirect(responseBody["payment_link"]);
    } else {
        return json(responseBody)
    }
}