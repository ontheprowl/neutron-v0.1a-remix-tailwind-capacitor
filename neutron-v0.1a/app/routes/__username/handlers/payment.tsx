import { ActionFunction, json } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { randomUUID } from "crypto";
import { env } from "process";
import { requireUser } from "~/session.server";


const appID = '12941442dc7e98be1c7fa15822414921';
const appSecret = 'TEST9b544dc2c2625964029bd3e5869cff5e6a120ac1';





/** Process Neutron Order - Marshalls information and passes it to the checkout provider (current : Razorpay) */
export const action: ActionFunction = async ({ request }) => {


    const NODE_ENV = env.NODE_ENV;
    // * Bifurcate payment API flow based on testMode vs Production check


    const session = await requireUser(request);

    const testMode = session?.metadata?.defaultTestMode;

    if (!testMode) {
        const PAYMENTS_KEY_ID = env.RAZORPAY_TEST_KEY_ID;
        const PAYMENTS_KEY_SECRET = env.RAZORPAY_TEST_KEY_SECRET;
        if (PAYMENTS_KEY_ID && PAYMENTS_KEY_SECRET) {

            console.log("PAYMENTS_KEY_ID")

            const payloadString = (await request.formData()).get("payload");

            const payload = JSON.parse(payloadString)

            console.log(payload)

            console.log("CREATING RELEVANT ORDER ON RAZORPAY")

            const response = await fetch("https://api.razorpay.com/v1/orders", {

                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + Buffer.from(PAYMENTS_KEY_ID + ":" + PAYMENTS_KEY_SECRET).toString('base64'),
                },
                redirect: 'follow',
                body: JSON.stringify(payload),
            });

            console.log("REQUESTED ORDER CREATION....")
            const responseBody = await response.json();

            console.log(responseBody)
            return json(responseBody)
        } else {
            return null
        }

    } else {
        const payloadString = (await request.formData()).get("payload");

        const payload = JSON.parse(payloadString);


        const successHandlerURL = new URL(`https://${NODE_ENV === "development" ? "localhost:3000" : "app.neutron.money"}/${session?.metadata?.displayName}/payment/success/${payload?.order_meta?.order_token}`);
        const params = successHandlerURL.searchParams;
        params.set("order_id", randomUUID());
        params.set("order_token", randomUUID());
        return redirect(successHandlerURL.href);

    }



}