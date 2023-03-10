import { ActionFunction, LoaderFunction, json, redirect } from "@remix-run/server-runtime"
import { encodeBase64 } from "bcryptjs"





export const action: ActionFunction = async ({ request, params }) => {

    return null
}

export const loader: LoaderFunction = async ({ request, params }) => {

    const ZOHO_CLIENT_ID = '1000.V5XRG4XMLEGK3RGPD2P5VB563DU8WR'
    const ZOHO_CLIENT_SECRET = '6d0d8c5e6effbb5b7af87c83c7f29e0b48dc053d2c'

    console.dir("Request received at access_granted loader function")
    const accessGrantParams = new URL(request.url).searchParams

    let result: { [x: string]: any } = {}
    for (const [key, value] of accessGrantParams) {
        result[key] = value
    }

    console.dir(result)
    // console.log("GENERATING ACCESS AND REFRESH TOKENS...")

    const tokenURL = new URL('https://accounts.zoho.in/oauth/v2/token');
    tokenURL.searchParams.set('code', result['code']);
    tokenURL.searchParams.set('client_id', ZOHO_CLIENT_ID);
    tokenURL.searchParams.set('client_secret', ZOHO_CLIENT_SECRET);
    tokenURL.searchParams.set('grant_type', 'authorization_code');
    tokenURL.searchParams.set('redirect_uri', 'http://localhost:3000/integrations/zoho/access_granted')

    console.log("FINAL URL IS ")
    console.log(tokenURL.toString())

    const response = await fetch(tokenURL, {
        method: "POST",
    })

    const data = await response.json();

    console.log(data)
    return json(data)
    // return new Response(null, {
    //     status: 303,
    //     headers: {
    //         Location: `/onboarding/integrations?data=${JSON.stringify({timestamp:new Date().getTime(),...data})}`,
    //     },
    // });
}