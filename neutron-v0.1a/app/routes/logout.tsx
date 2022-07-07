// import type { ActionFunction, LoaderFunction } from "@remix-run/node";
// import { redirect } from "@remix-run/node";

import type { ActionFunction, LoaderFunction} from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { logout } from "~/session.server";

export const action: ActionFunction = async ({ request }) => {
    return logout(request);
};

export const loader: LoaderFunction = async () => {
    return redirect("/");
};


