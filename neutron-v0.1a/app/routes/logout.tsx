// import type { ActionFunction, LoaderFunction } from "@remix-run/node";
// import { redirect } from "@remix-run/node";

import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { trackJuneEvent } from "~/analytics/june-config.server";
import { logtailServer } from "~/logging/logtail-config.server";
import { logout, requireUser } from "~/session.server";

export const action: ActionFunction = async ({ request }) => {
    const session = await requireUser(request);
    trackJuneEvent(session?.metadata?.id, 'User Logged Out', { userId: session?.metadata?.id }, 'userEvents');

    logtailServer.info(`User ${session?.metadata?.id} has logged out...`,);
    return logout(request);
};

export const loader: LoaderFunction = async () => {
    return redirect("/");
};


