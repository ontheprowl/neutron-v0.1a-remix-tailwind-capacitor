import type { LoaderFunction } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { applyActionCode, confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from '~/firebase/neutron-config.server'

export const loader: LoaderFunction = async ({ request }) => {
    const queryStringParams = new URL(request.url).searchParams;
    const mode = queryStringParams.get('mode');
    const oobCode = queryStringParams.get('oobCode')
    console.log(mode)
    try {
        if (mode && oobCode) {
            switch (mode) {
                case "verifyEmail":
                    console.log("Verifying email... oobCode retrieved " + oobCode);
                    applyActionCode(auth, oobCode);

                case "resetPassword":
                    console.log("Resetting password... oobCode retrieved " + oobCode);
                    return redirect('/auth/reset_password?oobCode=' + oobCode)

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