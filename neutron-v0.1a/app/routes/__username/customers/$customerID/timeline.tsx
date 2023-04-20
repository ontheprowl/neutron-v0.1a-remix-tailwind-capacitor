import { useParams } from "@remix-run/react";
import NucleiTimeline from "~/components/milestones/NucleiTimeline";



// export const loader: LoaderFunction = async ({ request, params }) => {
//     console.log("SIMULATING EVENT ON REAL TIME DB")
//     const session = await requireUser(request);

//     const customerID = params.customerID;
//     console.log("SIMULATING EVENT ON REAL TIME DB")

//     const eventRef = await sendEvent({ id: "23232323232", uid: customerID, customer_id: customerID, event: DunningEvent.MessageSent, type: EventType.DunningEvent }, ['1', '2'])
//     return null;
// }



export default function CustomerInsights() {


    const params = useParams();
    const customerID = params.customerID;

    return <NucleiTimeline id={customerID} />
}




