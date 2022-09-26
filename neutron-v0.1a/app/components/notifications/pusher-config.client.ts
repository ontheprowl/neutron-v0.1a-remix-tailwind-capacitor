import * as PusherPushNotifications from "@pusher/push-notifications-web";


export const beamsClient = new PusherPushNotifications.Client({
  instanceId: "d45267dd-8950-4cbd-ad07-678a6460917d",
});

// beamsClient
//   .start()
//   .then(() => beamsClient.getDeviceId())
//   .then(() => console.log("Successfully registered and subscribed!"))
//   .catch(console.error);

