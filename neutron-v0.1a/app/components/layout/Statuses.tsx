import { ContractStatus, DeliverableStatus } from "~/models/contracts";
import { primaryGradientDark } from "~/utils/neutron-theme-extensions";





export function DeliverableStatusGenerator({ status }: { status: DeliverableStatus }) {

    switch (status) {
        case DeliverableStatus.NotSubmitted:
            return <h3 className="font-medium text-black bg-gray-100 text-center rounded-lg p-1"> Not Submitted </h3>
        case DeliverableStatus.SubmittedForApproval:
            return <h3 className="font-medium text-black bg-gray-100 text-center rounded-lg p-1"> Submitted </h3>

        case DeliverableStatus.Approved:
            return <h3 className="font-medium text-white bg-green-500 text-center rounded-lg p-1"> Approved </h3>
        case DeliverableStatus.Rejected:
            return <h3 className="font-medium text-white bg-red-500 text-center rounded-lg p-1"> Rejected </h3>
        default:
            return <h3 className="font-medium text-black bg-gray-100 text-center rounded-lg p-1"> Not Submitted </h3>
    }
}


export function ContractStatusGenerator({ status }: { status: ContractStatus }) {

    switch (status) {
        case ContractStatus.Draft:
            return <h3 className="font-medium text-black bg-gray-100 text-center rounded-lg p-1"> Draft </h3>
        case ContractStatus.Published:
            return <h3 className={`font-medium text-black ${primaryGradientDark}  text-center rounded-lg p-1`}> Published </h3>
        default:
            return <h3 className="font-medium text-black bg-gray-100 text-center rounded-lg p-1"> Invalid State </h3>

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