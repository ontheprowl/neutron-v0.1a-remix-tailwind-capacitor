import { DeliverableStatus } from "~/models/contracts";





function StatusGenerator({ status }: { status: DeliverableStatus }) {

    switch (status) {
        case DeliverableStatus.NotSubmitted:
            return <h3 className="font-medium text-black bg-gray-100 text-center rounded-lg p-1"> Not Submitted </h3>
        case DeliverableStatus.SubmittedForApproval:
            return <h3 className="font-medium text-black bg-gray-100 text-center rounded-lg p-1"> Submitted </h3>

        case DeliverableStatus.Approved:
            return <h3 className="font-medium text-white bg-green-500 text-center rounded-lg p-1"> Approved </h3>
        case DeliverableStatus.Rejected:
            return <h3 className="font-medium text-white bg-red-500 text-center rounded-lg p-1"> Rejected </h3>
    }

}


export const SubmittedStatus = () => {

    return <StatusGenerator status={DeliverableStatus.SubmittedForApproval}></StatusGenerator>
}

export const NotSubmittedStatus = () => {

    return <StatusGenerator status={DeliverableStatus.NotSubmitted}></StatusGenerator>
}

export const ApprovedStatus = () => {

    return <StatusGenerator status={DeliverableStatus.Approved}></StatusGenerator>
}

export const RejectedStatus = () => {

    return <StatusGenerator status={DeliverableStatus.Rejected}></StatusGenerator>
}