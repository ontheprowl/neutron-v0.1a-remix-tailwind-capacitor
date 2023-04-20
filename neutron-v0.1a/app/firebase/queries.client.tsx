import type { Query } from "firebase/database";
import type { EventType } from "~/models/events";
import { clientQuery, clientRef, db } from "./neutron-config.client";
import { clientDatabase } from "./firebase-exports.client";

export function generateEventsQuery(type: EventType, id?: string, byKey?: string): Query {
    let eventsQuery
    if (id) {
        if (byKey) {
            eventsQuery = clientQuery(clientRef(db, type + "/" + id));
        }
        else {
            eventsQuery = clientQuery(clientRef(db, type + "/" + id));
        }
    } else {
        eventsQuery = clientQuery(clientRef(db, 'events/' + type));
    }
    return eventsQuery
}