import type { Query } from "firebase/database";
import type { EventType } from "~/models/events";
import { clientQuery, clientRef, db } from "./neutron-config.client";
import { clientDatabase } from "./firebase-exports.client";

export function generateEventsQuery(type: EventType, id?: string, byUser?: boolean): Query {
    let eventsQuery
    if (id) {
        if (byUser) {
            eventsQuery = clientQuery(clientRef(db, 'events/' + type), clientDatabase.orderByChild("uid"), clientDatabase.equalTo(id));
        }
        else {
            eventsQuery = clientQuery(clientRef(db, 'events/' + type), clientDatabase.orderByChild("id"), clientDatabase.equalTo(id));
        }
    } else {
        eventsQuery = clientQuery(clientRef(db, 'events/' + type));
    }
    return eventsQuery
}