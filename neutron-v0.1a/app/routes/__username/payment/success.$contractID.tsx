import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime"
import { createHmac } from "crypto";
import { env } from "process";
import { getSingleDoc, sendEvent } from "~/firebase/queries.server";
import type { NeutronEvent } from "~/models/events";
import { ContractEvent, EventType } from "~/models/events";
import { requireUser } from "~/session.server";
import { validateRazorpaySignature } from "~/utils/utils.server";





/** The payment success handler is currently being tuned to work with Razorpay's ultra-specific payment processing paradigm 
 * 
 * If you're wondering why its so convoluted, check out the following link {@link https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/build-integration}
 * 
*/

export const action: ActionFunction = async ({ request, params }) => {

    const session = await requireUser(request, true);

    const url = new URL(request.url);
    const orderID = url.searchParams.get("order_id");
    const orderToken = url.searchParams.get("order_token");

    const key_secret = env.RAZORPAY_TEST_KEY_SECRET

    if (session) {
        const contractID = params.contractID;
        const ownerUsername = params.username;

        // * Specific to Razorpay integration. The following block will verify the signature of the transaction
        const data = await request.formData()
        const razorpayData: {
            razorpay_payment_id: string,
            razorpay_order_id: string,
            razorpay_signature: string
        } = JSON.parse(data.get("response"))
        
        console.dir(razorpayData)
        try {
            console.log(`Razorpay transaction is - ${validateRazorpaySignature(key_secret, razorpayData)}`)
        } catch (e) {
            throw e
        }

        // // * After verification of Razorpay signature, proceed as before
        const uidMapping = await getSingleDoc(`/userUIDS/${ownerUsername}`);
        const ownerUID = uidMapping?.uid;
        const queuedContract = await getSingleDoc(`${session?.metadata?.defaultTestMode ? 'testContracts' : 'contracts'}/${contractID}`);

        if (queuedContract?.milestones?.advance) {
            const queuedMilestone = queuedContract?.milestones?.advance;
            const nextMilestoneIndex = 0;
            const beneficiaryMetadata = await getSingleDoc(`beneficiaries/${queuedContract.providerEmail}`);

            const payinCompletedAndAdvanceQueuedEvent: NeutronEvent = { event: ContractEvent.ContractPayinCompleted, type: EventType.ContractEvent, payload: { data: { contractID: contractID, order_id: orderID, order_token: orderToken, queuedMilestone: queuedMilestone, milestones: queuedContract?.milestones, beneficiaryData: beneficiaryMetadata, milestoneType: 'advance', nextMilestoneIndex: nextMilestoneIndex, ownerUsername: ownerUsername }, message: 'Payin was completed for a contract. Queuing advance payout next...' }, uid: ownerUID, id: contractID }
            await sendEvent(payinCompletedAndAdvanceQueuedEvent, queuedContract?.viewers, session?.metadata?.defaultTestMode);

        } else {
            const queuedMilestone = queuedContract?.milestones?.workMilestones['0'];
            const nextMilestoneIndex = 0;
            const payinCompletedAndFirstMilestoneEvent: NeutronEvent = { event: ContractEvent.ContractPayinCompleted, type: EventType.ContractEvent, payload: { data: { contractID: contractID, order_id: orderID, order_token: orderToken, queuedMilestone: queuedMilestone, milestones: queuedContract?.milestones, milestoneType: 'deliverable', nextMilestoneIndex: nextMilestoneIndex, ownerUsername: ownerUsername }, message: 'Payin was completed for a contract. Queuing first milestone next...' }, uid: ownerUID, id: contractID }
            await sendEvent(payinCompletedAndFirstMilestoneEvent, queuedContract?.viewers, session?.metadata?.defaultTestMode);
        }

        return redirect(`/${ownerUsername}/contracts/${contractID}`)
    }


}


export default function SuccessfulPayment() {

    return (<p> Successful Payment </p>)
}