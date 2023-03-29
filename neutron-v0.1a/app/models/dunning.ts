

export const templates : {[x:string] : any} = {
    "Early Reminder" : {
        Whatsapp: '13eea102-0175-488e-8634-d28bd90e178e',
        Email:'4'
    },
    "On Due Date": {
        Whatsapp: '82950750-3173-475f-9ace-b079ce4c3d6e',
        Email:'5'

    },
    "Overdue Reminder":{
        Whatsapp: 'fad8ae4c-c7ba-4b11-8a07-d936c4049384',
        Email:'6'
    }
}


export type WhatsappPayloadStructure = {
        "id": string,
        "callerID": string,
        "jobType": 0 | 1 | 2,
        "data": {
            "contact": string,
            "message": string,
            "data": string[]
        },
        "schedule": string
    }

    export type EmailPayloadStructure = {
        "id": string,
        "callerID": string,
        "jobType": 0 | 1 | 2,
        "data": {
            "contact": string
            "data": {
                "templateID":string,
                "params":{
                    RECEIVER_NAME: string,
                    INVOICE_NUMBER: string,
                    AMOUNT_DUE: string,
                    DUE_DATE?: string,
                    COMPANY_POC: string,
                    COMPANY_CONTACT: string,
                    COMPANY_NAME: string
                }
            }
        },
        "schedule": string
    }
