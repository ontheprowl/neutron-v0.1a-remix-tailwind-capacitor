import type { LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { useLoaderData } from "@remix-run/react";
import { listEvents } from "~/firebase/calendar-apis.server";
import { authorizeAndExecute } from "~/firebase/gapis-config.server";



export const loader: LoaderFunction = async ({ request }) => {

  const result = await authorizeAndExecute(listEvents, () => {

    return []

  }, true)
  let results = []
  result.forEach((event) => {
    console.log("THIS IS EACH EVENT ON THE CALENDAR")
    console.log(event)
    results.push({
      event_id: event.id,
      title: event.summary,
      start:  new Date(event.start.dateTime),
      end: new Date(event.end.dateTime),
    })
  })
  return json(JSON.stringify(results))
}




// export const EVENTS = [
//   {
//     event_id: 1,
//     title: "Event 1",
//     start: new Date("2021 5 2 09:30"),
//     end: new Date("2021 5 2 10:30")
//   },
//   {
//     event_id: 2,
//     title: "Event 2",
//     start: new Date("2021 5 4 10:00"),
//     end: new Date("2021 5 4 11:00")
//   },
//   {
//     event_id: 3,
//     title: "Event 3",
//     start: new Date("2021 4 27 09:00"),
//     end: new Date("2021 4 28 10:00")
//   },
//   {
//     event_id: 4,
//     title: "Event 4",
//     start: new Date("2021 5 4 9:00"),
//     end: new Date("2021 5 4 10:36")
//   },
//   {
//     event_id: 5,
//     title: "Event 5",
//     start: new Date("2021 5 1 10:00"),
//     end: new Date("2021 5 18 11:00")
//   },
//   {
//     event_id: 6,
//     title: "Event 6",
//     start: new Date("2021 5 2 11:00"),
//     end: new Date("2021 5 2 12:00")
//   },
//   {
//     event_id: 7,
//     title: "Event 7",
//     start: new Date("2021 5 1 12:00"),
//     end: new Date("2021 5 1 13:00")
//   },
//   {
//     event_id: 8,
//     title: "Event 8",
//     start: new Date("2021 5 1 13:00"),
//     end: new Date("2021 5 1 14:00")
//   },
//   {
//     event_id: 9,
//     title: "Event 11",
//     start: new Date("2021 5 5 16:00"),
//     end: new Date("2021 5 5 17:00")
//   },
//   {
//     event_id: 10,
//     title: "Event 9",
//     start: new Date("2021 5 6  15:00"),
//     end: new Date("2021 5 6 16:00")
//   },
//   {
//     event_id: 11,
//     title: "Event 10",
//     start: new Date("2021 5 6 14:00"),
//     end: new Date("2021 5 6 15:00")
//   }
// ];



export default function DragAndDropCalendar(props: any) {

  const data = useLoaderData();

  const EVENTS = JSON.parse(data);
  console.log(EVENTS)



  return (<p></p>
    // <Scheduler
    //   view="week"
    //   events={EVENTS}
    //   selectedDate={new Date(2022, 4, 5)}
    // />
  );
}

