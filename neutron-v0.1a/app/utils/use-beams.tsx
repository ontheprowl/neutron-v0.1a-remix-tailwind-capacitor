import type { Client } from "@pusher/push-notifications-web";
import { useEffect } from "react";
import { beamsClient, isSafari } from "~/components/notifications/pusher-config.client";


/**
 * This hook initializes the Pusher Beams client and registers a topic against the current user's UID
 * @param userID The current user's UID
 */
export function useBeams(userID: string) {


    useEffect(() => {
        if (!isSafari) {
            console.log("BEAMS HOOK ACTIVE")
            beamsClient.start().then(() => {
                beamsClient.addDeviceInterest(userID)
                console.log(`User with ID ${userID} registered...`)
            });
        }


        return () => {
            if (!isSafari) {
                beamsClient.stop();
                console.log(`User with ID ${userID} deregistered...`)

            }
        }
    }, [userID])
}