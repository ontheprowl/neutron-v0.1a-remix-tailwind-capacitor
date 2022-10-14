import type { ActionFunction } from "@remix-run/server-runtime"
import { Url } from "url";


export const action: ActionFunction = async ({ request }) => {

    const data = await request.formData();

    fetch("https://murmuring-sea-76770.herokuapp.com/https://api.cashfree.com/api/v1/order/create", {
        method: "POST",
        headers: {
            "Origin": "https://test.neutron.money/",
        },
        body: data,
    }).then((response) => {
        let data = response.json();
        return data;
    }).then((data) => {
        window.location.replace(data.paymentLink);
    });

}


const handleOrderDetails = ({ orderAmount, transactionID, redirectURL, customerEmail, customerName, customerPhone, contractID, milestoneID }: { orderAmount: number, transactionID: string, redirectURL: string, customerEmail: string, customerName: string, customerPhone: string, contractID: string, milestoneID: string }) => {
    //Load any data 


    
    let formData = new FormData();
    formData.append('appId', '13176989b9ab51d065b9a10c40967131');
    formData.append('secretKey', 'e1ed43ef423305d2d340d920a78eb19a5cd83d76');
    formData.append('orderId', transactionID);
    formData.append('returnUrl', redirectURL)
    formData.append('orderAmount', orderAmount.toString());
    formData.append('orderNote', contractID);
    formData.append('customerEmail', customerEmail);
    formData.append('customerPhone', customerPhone);
    formData.append('customerName', customerName);
    return formData
}



export default function PaymentComponent() {


    return (<p></p>)
}