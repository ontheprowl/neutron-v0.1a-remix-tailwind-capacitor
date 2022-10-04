import { ContractStatus, DeliverableStatus } from "~/models/contracts";
import { DisputeSeverity, DisputeStatus } from "~/models/disputes";
import { primaryGradientDark } from "~/utils/neutron-theme-extensions";





export function DeliverableStatusGenerator(status: DeliverableStatus) {

    console.log("Status is :");
    console.log(status)
    switch (status) {
        case DeliverableStatus.NotSubmitted:
            return <h3 className="font-medium text-black bg-gray-100 text-center rounded-full w-[160px] p-3"> Not Submitted </h3>
        case DeliverableStatus.SubmittedForApproval:
            return <h3 className="font-medium text-black bg-gray-100 text-center w-[160px] rounded-full p-3"> Submitted </h3>

        case DeliverableStatus.SubmittedExternally:
            return <h3 className="font-medium text-black bg-gray-200 ring-2 ring-purple-500 w-[160px] text-center rounded-full p-3"> Submitted Externally</h3>
        case DeliverableStatus.Approved:
            return <h3 className="font-medium text-[#027A48] bg-[#ECFDF3] text-center w-[160px] rounded-full p-3"> Approved </h3>
        case DeliverableStatus.Rejected:
            return <h3 className="font-medium text-[#B42318] bg-[#FEF3F2] text-center w-[160px] rounded-full p-3"> Rejected </h3>
        case DeliverableStatus.InFeedback:
            return <h3 className="font-medium text-[#B54708] bg-[#FFFAEB] text-center w-[160px] rounded-full p-3"> In Feedback </h3>
        default:
            return <h3 className="font-medium text-black bg-gray-100 text-center rounded-full w-[160px] p-3"> Not Submitted </h3>

    }
}


export function ContractStatusGenerator({ status }: { status: ContractStatus }) {

    switch (status) {
        case ContractStatus.Draft:
            return <h3 className="font-medium text-black bg-gray-100 w-full max-w-[160px] text-center text-[16px] rounded-lg p-1"> Draft </h3>
        case ContractStatus.Published:
            return <h3 className={`font-medium text-white ${primaryGradientDark} text-[16px] w-full max-w-[160px]  text-center rounded-lg p-1`}> Published </h3>
        default:
            return <h3 className="font-medium text-black bg-gray-100 text-center text-[16px] rounded-lg p-1"> Invalid State </h3>

    }


}


export function DisputeStatusGenerator({ status }: { status: DisputeStatus }) {

    switch (status) {
        case DisputeStatus.Raised:
            return <h3 className="font-medium text-black bg-gray-100 text-center text-[16px] rounded-lg p-1"> Raised </h3>
        case DisputeStatus.Accepted:
            return <h3 className={`font-medium text-black ${primaryGradientDark} text-[16px] w-full max-w-[160px]  text-center rounded-lg p-1`}> Active </h3>
        default:
            return <h3 className="font-medium text-black bg-gray-100 text-center text-[16px] rounded-lg p-1"> Invalid State </h3>

    }


}

export function DisputeSeverityGenerator({ severity }: { severity: DisputeSeverity }) {

    switch (severity) {
        case DisputeSeverity.Low:
            return <h3 className="font-medium text-white bg-[#12B76A] text-center text-[16px] max-h-fit w-full max-w-[160px] rounded-full p-1"> Low </h3>
        case DisputeSeverity.Urgent:
            return <h3 className={`font-medium text-white bg-[#F04438]  text-[16px] w-full max-w-[160px]  text-center rounded-full p-1`}>High </h3>
        case DisputeSeverity.Medium:
            return <h3 className={`font-medium text-white bg-accent-dark text-[16px] w-full max-w-[160px]  text-center rounded-full p-1`}>Standard </h3>

        default:
            return <h3 className="font-medium text-white bg-gray-100 text-center text-[16px] rounded-lg p-1"> Invalid State </h3>

    }


}


export const SubmittedStatus = () => {

    return <DeliverableStatusGenerator status={DeliverableStatus.SubmittedForApproval}></DeliverableStatusGenerator>
}

export const NotSubmittedStatus = () => {

    return <DeliverableStatusGenerator status={DeliverableStatus.NotSubmitted}></DeliverableStatusGenerator>
}

export const ApprovedStatus = () => {

    return <DeliverableStatusGenerator status={DeliverableStatus.Approved}></DeliverableStatusGenerator>
}

export const RejectedStatus = () => {

    return <DeliverableStatusGenerator status={DeliverableStatus.Rejected}></DeliverableStatusGenerator>
}

export const ContractDraftedStatus = () => {

    return <ContractStatusGenerator status={ContractStatus.Draft}></ContractStatusGenerator>
}

export const ContractPublishedStatus = () => {

    return <ContractStatusGenerator status={ContractStatus.Published}></ContractStatusGenerator>
}