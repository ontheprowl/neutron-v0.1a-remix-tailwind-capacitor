
import type { LoaderFunction } from "@remix-run/server-runtime";
import type { ExternalScriptsFunction } from "remix-utils";

import PDFViewer from "~/components/deliverables/PDFViewer.client";



export const loader: LoaderFunction = async ({ params }) => {
    console.log("params!!!", params);
    return {
        paper: {
            link: "https://firebasestorage.googleapis.com/v0/b/neutron-expo.appspot.com/o/documents%2FTrips_Flight_DownloadETicket.pdf?alt=media&token=4955c3b7-cd00-49cb-885e-151b167d3352#toolbar=0"
        }
    };
};

// export const loader: LoaderFunction = async ({ request }) => {

//     const PDF =
//         <canvas onContextMenu={(e) => e.preventDefault()}>
//             <embed
//                 src={"https://firebasestorage.googleapis.com/v0/b/neutron-expo.appspot.com/o/documents%2FTrips_Flight_DownloadETicket.pdf?alt=media&token=4955c3b7-cd00-49cb-885e-151b167d3352#toolbar=0"}
//                 type="application/pdf"
//                 height={800}
//                 width={500}
//             />
//         </canvas>

//     console.log(request)
//     return new Response(, {
//         status: 200,
//         headers: {
//             "Content-Type": "application/pdf",
//         },
//     });
// }




//import { pdfjs } from "react-pdf";
//pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";



export default function PaperRender() {
    return <PDFViewer />

}


