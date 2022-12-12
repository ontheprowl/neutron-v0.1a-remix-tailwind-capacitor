import type { LoaderFunction} from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { applyActionCode } from "firebase/auth";
import { auth } from '~/firebase/neutron-config.server'

export const loader: LoaderFunction = async ({ request }) => {
    const queryStringParams = new URL(request.url).searchParams;
    const mode = queryStringParams.get('mode');
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


    return redirect('/emailVerified')
    // await checkActionCode(auth)
}