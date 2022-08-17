import { ActionFunction, LoaderFunction, redirect } from "@remix-run/server-runtime"
import { applyActionCode, checkActionCode } from "firebase/auth"
import { auth } from "~/firebase/neutron-config.server"



export const loader: LoaderFunction = async ({ request }) => {
    console.log("VERIFICATION REQUEST RECEIVED");
    const queryStringParams = new URL(request.url).searchParams;
    const mode = queryStringParams.get('mode');
    console.log("mode is " + mode);
    try {
        if (mode) {
            switch (mode) {
                case "verifyEmail":
                    const oobCode = queryStringParams.get('oobCode')
                    if (oobCode) {
                        console.log("oobCode retrieved " + oobCode);

                        applyActionCode(auth, oobCode);
                    }
            }
        }
    }
    catch (e) {
        console.log("Error occured during email verification process")
        throw e
    }


    return redirect('/login')
    // await checkActionCode(auth)
}


export const action: ActionFunction = async ({ request }) => {
    console.log("VERIFICATION REQUEST RECEIVED");
    return null;
    // await checkActionCode(auth)
}