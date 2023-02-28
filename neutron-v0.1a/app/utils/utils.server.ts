import { createHmac } from "crypto"



export const validateRazorpaySignature = (key_secret : string | undefined, razorpayData : {
    razorpay_payment_id: string,
    razorpay_order_id: string,
    razorpay_signature: string
}) : boolean | Error => {
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
        if (value === '' || value === null || value =='0') {
            delete obj[key];
        } else if (Object.prototype.toString.call(value) === '[object Object]') {
            trimNullValues(value);
        } else if (Array.isArray(value)) {
            if (value.length==1 &&(value[0]==''  || String(value[0]).trim() =='')){
                delete obj[key]
            }            
            for (const subvalue of value) {
                trimNullValues(subvalue);
            }
            
        }

    }
}