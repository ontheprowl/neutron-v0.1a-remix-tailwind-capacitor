import { ActionFunction } from "@remix-run/server-runtime";
import { json } from "remix-utils";
import { getFirebaseDocs, setFirestoreDocFromData, updateFirestoreDocFromData } from "~/firebase/queries.server";
import { requireUser } from "~/session.server";


export const action: ActionFunction = async ({ request, params }) => {
    console.log('request received at beneficiary updation handler');
    const session = await requireUser(request);
    const submissionData = await request.formData();
    const beneficiary = submissionData.get('beneficiary') as string;
    const beneficiaryData = JSON.parse(beneficiary);

    if (session && session.metadata) {
        const existingBeneficiaryEmails = await getFirebaseDocs('beneficiaries', true);
        console.dir(existingBeneficiaryEmails);
        if (existingBeneficiaryEmails.includes((elem) => elem.email == beneficiaryData?.email)) {
            const updateBeneficiaryRef = await updateFirestoreDocFromData(beneficiaryData, 'beneficiaries', beneficiaryData?.email);

        } else {
            const addBeneficiaryRef = await setFirestoreDocFromData(beneficiaryData, 'beneficiaries', beneficiaryData?.email);

        }

        return json({status: 'success', message: ' Beneficiary added/updated successfully!' });
    } else {
        return json({ status: 'failed', message: " Don't have the privilege to perform this operation" });
    }
}