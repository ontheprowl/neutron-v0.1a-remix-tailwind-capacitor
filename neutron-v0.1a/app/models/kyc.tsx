export const PAYOUTS_PROD_GET_BENFICIARY_ENDPOINT = 'https://payout-api.cashfree.com/payout/v1/getBeneficiary/';
export const PAYOUTS_PROD_ADD_BENEFICIARY_ENDPOINT = 'https://payout-api.cashfree.com/payout/v1/addBeneficiary';
export const PAYOUTS_PROD_AUTHORIZE_ENDPOINT = 'https://payout-api.cashfree.com/payout/v1/authorize';
export const PAYOUTS_PROD_REQUEST_TRANSFER_ENDPOINT = 'https://payout-api.cashfree.com/payout/v1/requestTransfer';
export const PAYOUTS_PROD_BANK_ACCOUNT_VERIFICATION_ENDPOINT = 'https://payout-api.cashfree.com/payout/v1.2/validation/bankDetails';
export const VERIFICATION_PROD_PAN_VERIFICATION_ENDPOINT = 'https://api.cashfree.com/verification/pan';
export const VERIFICATION_PROD_AADHAAR_VERIFICATION_ENDPOINT = 'https://api.cashfree.com/verification/aadhaar';


export enum KYCStatus {
    NotSubmitted,
    Submitted,
    Verified,
    Rejected
}


export const KYCVerificationStatus = ({ status }: { status?: KYCStatus }) => {

    switch (status) {
        case KYCStatus.NotSubmitted:
            return <p className="font-gilroy-regular text-black bg-white p-4 rounded-full my-2"> KYC details not submitted </p>;
        case KYCStatus.Submitted:
            return <p className="font-gilroy-regular text-white bg-green-500 p-4 rounded-full my-2"> KYC details submitted </p>;
        case KYCStatus.Verified:
            return <p className="font-gilroy-regular text-white bg-green-500 p-4 rounded-full my-2"> KYC details verified </p>;
        case KYCStatus.Rejected:
            return <p className="font-gilroy-regular text-white bg-red-600 p-4 rounded-full my-2"> KYC details Rejected </p>
        default:
            return <p className="font-gilroy-regular text-black bg-white p-4 rounded-full my-2"> KYC details not submitted </p>;
    }

}