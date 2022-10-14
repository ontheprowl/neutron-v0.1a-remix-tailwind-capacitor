import { redirect } from "@remix-run/server-runtime";
import { generateAuthUrl, oAuth2Client } from "~/firebase/gapis-config.server";
import { adminFirestore } from "~/firebase/neutron-config.server";
import { requireUser } from "~/session.server";

export async function loader({ request }: { request: Request }) {
}

export async function action({ request }: { request: Request }) {
    
    const session = await requireUser(request);

    if (!session) {
        return redirect(generateAuthUrl());
    }
    else {
        return redirect(`/${session?.metadata?.displayName}/dashboard`);

    }
}