import { createHmac, randomUUID } from "crypto"
import moment from "moment"
import type { EmailPayloadStructure, WhatsappPayloadStructure } from "~/models/dunning";
import { templates } from "~/models/dunning"
import { fetch } from "@remix-run/web-fetch";
import { env } from "process"


export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const validateRazorpaySignature = (key_secret: string | undefined, razorpayData: {
    razorpay_payment_id: string,
    razorpay_order_id: string,
    razorpay_signature: string
}): boolean | Error => {
    if (key_secret) {
        const hmac = createHmac('sha256', key_secret)
        hmac.update(`${razorpayData.razorpay_order_id}|${razorpayData.razorpay_payment_id}`)
        const generated_signature = hmac.digest('hex')
        return generated_signature == razorpayData.razorpay_signature
    } else {
        return Error('Razorpay secret not provided...cannot verify payment signature')
    }
}


export const trimNullValues = (obj: { [x: string]: any }) => {
    for (const [key, value] of Object.entries(obj)) {
        if (value === '' || value === null || value == '0') {
            delete obj[key];
        } else if (Object.prototype.toString.call(value) === '[object Object]') {
            trimNullValues(value);
        } else if (Array.isArray(value)) {
            if (value.length == 1 && (value[0] == '' || String(value[0]).trim() == '')) {
                delete obj[key]
            }
            for (const subvalue of value) {
                trimNullValues(subvalue);
            }

        }

    }
}


export function prependBaseURLForEnvironment(slug: string): string {

    let baseUrl: string;
    console.log("NODE ENV VALUE IS : ");
    console.log(env.NODE_ENV);
    switch (env.NODE_ENV) {
        case "development":
            baseUrl = 'http://localhost:3000';
            break;
        case 'test':
            baseUrl = 'https://neutron-alpha-working.fly.dev';
            break;
        case 'production':
            baseUrl = 'https://app.neutron.money';
            break;
    }

    return `${baseUrl}${slug}`;

}


export async function executePaginatedRequestandAggregate(callback: (page: number) => Promise<{ page_result: any[], has_more_page: boolean }>) {
    let page = 1;
    let has_more_page = true;
    let result: any[] = [];
    while (has_more_page) {
        const callResult = await callback(page);
        result.push(...callResult.page_result)
        has_more_page = callResult.has_more_page
        page += 1;
    }
    return result
}


export async function executeDunningPayloads(dunningPayloads: Array<WhatsappPayloadStructure | EmailPayloadStructure>): Promise<Array<any>> {
    for (const payload of dunningPayloads) {
        if (!payload?.data?.contact) {
            console.log("GONNA BREAK...")
            break;
        }
        const queueDunningOperationRequest = await fetch('https://neutron-knock.fly.dev/jobs/create', {
            method: "POST",
            body: JSON.stringify(payload),
            headers: new Headers({
                'Content-Type': 'application/json',
                'Connection': 'close'
            })
        })
        delay(60);
        const result = await queueDunningOperationRequest.json();
        console.dir(result, { depth: null })
    }
    return []
}


export function returnNormalizedDateString(date: Date) {
    const offset = date.getTimezoneOffset();
    date = new Date(date.getTime() + (offset * 60 * 1000));
    return date.toISOString().split('T')[0]
}


/**
 * 
 */
export function getScheduleForActionAndInvoice(invoice: any, senderInfo: { caller_id: string, company_name: string, assigned_to: string, assigned_to_contact: string }, customer: any, action: { action: string, action_type: string, days: string, template: string, time: string, trigger: string }): { dunningPayload: WhatsappPayloadStructure | EmailPayloadStructure, targetDate: Date } {

    let referenceDate: Date;
    let operation: string;
    switch (action.trigger) {
        case "After Issue Date":
            referenceDate = new Date(invoice?.date);
            operation = "+";
            break;
        case "Before Due Date":
            referenceDate = new Date(invoice?.due_date);
            operation = "-";
            break;
        case "After Due Date":
            referenceDate = new Date(invoice?.due_date);
            operation = "+";
            break;
        default:
            throw new Error("This trigger is not supported...");
    }

    const activeTemplate = templates[action?.template][action?.action]

    const [hours, minutes] = action?.time?.split(":");

    const targetDate: Date = operation === "+" ? moment(new Date(referenceDate)).add(action?.days, 'days').set('hours', Number(hours)).set('minutes', Number(minutes)).toDate() : moment(new Date(referenceDate)).subtract(action?.days, 'days').set('hours', Number(hours)).set('minutes', Number(minutes)).toDate();

    const targetCron = dateToCron(targetDate);


    let finalPayload: WhatsappPayloadStructure | EmailPayloadStructure

    if (action?.action === "Whatsapp") {

        finalPayload = {
            id: randomUUID(),
            callerID: senderInfo?.caller_id,
            jobType: 1,
            data: {
                contact: customer?.mobile,
                message: activeTemplate,
                data: action?.template == "Early Reminder" ? [
                    customer?.first_name + customer?.last_name,
                    senderInfo?.company_name,
                    invoice?.invoice_number,
                    invoice?.due_date,
                    String(invoice?.balance),
                    senderInfo?.assigned_to,
                    senderInfo?.assigned_to_contact,
                    senderInfo?.company_name,
                ] : [
                    customer?.first_name + customer?.last_name,
                    senderInfo?.company_name,
                    invoice?.invoice_number,
                    String(invoice?.balance),
                    senderInfo?.assigned_to,
                    senderInfo?.assigned_to_contact,
                    senderInfo?.company_name,
                ]


            },
            schedule: targetCron
        }


    } else {
        finalPayload = {
            id: randomUUID(),
            callerID: senderInfo?.caller_id,
            jobType: 1,
            data: {
                contact: customer?.email,
                data: {
                    templateID: activeTemplate,
                    params: {
                        RECEIVER_NAME: customer?.first_name + customer?.last_name,
                        COMPANY_NAME: senderInfo?.company_name,
                        INVOICE_NUMBER: invoice?.invoice_number,
                        AMOUNT_DUE: String(invoice?.balance),
                        COMPANY_POC: senderInfo?.assigned_to,
                        COMPANY_CONTACT: senderInfo?.assigned_to_contact,
                        DUE_DATE: invoice?.due_date


                    }
                }

            },
            schedule: targetCron
        }
    }

    return { dunningPayload: finalPayload, targetDate: targetDate };
}


const dateToCron: (date: Date) => string = (date: Date) => {
    const minutes = date.getMinutes();
    const hours = date.getHours();
    const days = date.getDate();
    const months = date.getMonth() + 1;
    const dayOfWeek = date.getDay();

    return `${minutes} ${hours} ${days} ${months} ${dayOfWeek}`;
};
