import { useParams } from "@remix-run/react";
import { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import DefaultSpinner from "~/components/layout/DefaultSpinner";
import NucleiTimeline from "~/components/milestones/NucleiTimeline";
import { client_onValue } from "~/firebase/neutron-config.client";
import { generateEventsQuery } from "~/firebase/queries.client";
import { sendEvent } from "~/firebase/queries.server";
import type { NeutronEvent } from "~/models/events";
import { DunningEvent, EventType } from "~/models/events";
import { requireUser } from "~/session.server";



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




