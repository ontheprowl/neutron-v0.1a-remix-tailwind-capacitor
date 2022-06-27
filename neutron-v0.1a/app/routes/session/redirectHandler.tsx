import { useActionData, useLoaderData } from "@remix-run/react";
import { redirect } from "@remix-run/server-runtime";
import { json } from "remix-utils";
import { credentials, oAuth2Client } from "~/firebase/gapis-config.server";
import fs from 'fs';

const TOKEN_PATH = "tokens.json"


export async function action({ request }: { request: Request }) {
    console.log(await request.json());

    return redirect('/session/dashboard')

}

export async function loader({ request }: { request: Request }) {

    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const scope = url.searchParams.get("scope")
    try {
        if (code) {
            const { tokens } = await oAuth2Client.getToken(code)
            console.log(tokens);
            fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
            console.log('Token stored to', TOKEN_PATH);

            oAuth2Client.setCredentials(tokens);
        }
    } catch (e) {
        if (e) return console.error(e);

    }


    return redirect('/session/dashboard');
}

export default function RedirectComponent() {


    const action = useLoaderData();
    return <p> {action}</p>
}