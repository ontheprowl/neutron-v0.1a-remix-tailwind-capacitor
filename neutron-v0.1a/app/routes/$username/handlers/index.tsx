import { redirect } from "@remix-run/server-runtime";
import { oAuth2Client } from "~/firebase/gapis-config.server";
import fs from 'fs';
import { requireUser } from "~/session.server";

const TOKEN_PATH = "tokens.json"


export async function action({ request }: { request: Request }) {
    const session = await requireUser(request, true);
    return redirect(`/${session?.metadata?.displayName}/dashboard`)

}

export async function loader({ request }: { request: Request }) {

    const session = await requireUser(request, true);

    //TODO : pull cookie from request, add tokens to session, forward

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


    return redirect(`/${session?.metadata?.displayName}/dashboard`)
}