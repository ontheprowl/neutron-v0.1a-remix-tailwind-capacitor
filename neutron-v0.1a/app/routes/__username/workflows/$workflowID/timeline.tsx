import { useParams } from "@remix-run/react";
import NucleiTimeline from "~/components/milestones/NucleiTimeline";




export default function CustomerInsights() {


    const params = useParams();
    const workflowID = params.workflowID;

    return <NucleiTimeline id={workflowID} />
}




