import { ActionFunction } from "@remix-run/server-runtime";




/**
 * Action Function - Verify UPI VPA (Virtual Payment Address)
 */

export const action: ActionFunction = async ({request, params}) => {

    console.log("Verifying VPA....");

    return null;
}