



export default function DunningTemplates({ templateName, actionType }: { templateName: string, actionType: string }): JSX.Element {

    switch (templateName) {
        case "Early Reminder":
            if (actionType == "Email") {
                return (<p className="prose prose-md text-left font-gilroy-medium">

                    <span className="font-gilroy-bold">Early Reminder</span><br></br>
                    <span className="font-gilroy-bold">Subject</span>: Payment Reminder for Invoice <span className="font-gilroy-bold">[invoice number]</span><br></br>

                    Dear [receiver name],<br></br>

                    This email is on behalf of [company name].<br></br>

                    Hope this email finds you well. This message is to remind you that the payment for the invoice number [invoice number] for [invoice amount] is due on [due date].<br></br>

                    Request you to ensure that the payment is processed by the due date. If you have any questions or concerns regarding the payment, please do not hesitate to contact [company_poc] at [company_contact].<br></br>

                    We value your business and look forward to continued collaboration.<br></br>

                    Have a wonderful day!<br></br>

                    Best regards,<br></br>
                    [company name]<br></br>
                </p>);
            } else {
                return (<p className="prose prose-md text-left font-gilroy-medium">

                    <span className="font-gilroy-bold">Early Reminder</span><br></br>
                    <span className="font-gilroy-bold">Subject</span>: Payment Reminder for Invoice <span className="font-gilroy-bold">[invoice number]</span><br></br>

                    Dear [receiver name],<br></br>

                    This email is on behalf of [company name].<br></br>

                    Hope this email finds you well. This message is to remind you that the payment for the invoice number [invoice number] for [invoice amount] is due on [due date].<br></br>

                    Request you to ensure that the payment is processed by the due date. If you have any questions or concerns regarding the payment, please do not hesitate to contact [company_poc] at [company_contact].<br></br>

                    We value your business and look forward to continued collaboration.<br></br>

                    Have a wonderful day!<br></br>

                    Best regards,<br></br>
                    [company name]<br></br>
                </p>);
            }

        case "On Due Date":
            if (actionType == "Email") {
                return (
                    <p className="prose prose-md text-left font-gilroy-medium">
                        <span className="font-gilroy-bold">Subject:</span>  Payment due for Invoice <span className="font-gilroy-bold">[invoice number]</span>

                        Dear <span className="font-gilroy-bold">[receiver name]</span>,

                        This is a message on behalf of <span className="font-gilroy-bold">[company name]</span>.

                        This is a gentle reminder for the payment for invoice number <span className="font-gilroy-bold">[invoice number]</span> for <span className="font-gilroy-bold">[invoice amount]</span> is due today.

                        Request you to ensure that the payment is processed. If you have any questions or concerns regarding the payment, please do not hesitate to contact [company poc] at [company contact].

                        We value your business and look forward to continued collaboration.

                        Best regards,
                        [company name]

                    </p>)

            } else {
                return (<p className="prose prose-md text-left font-gilroy-medium">

                    <span className="font-gilroy-bold">Early Reminder</span><br></br>
                    <span className="font-gilroy-bold">Subject</span>: Payment Reminder for Invoice <span className="font-gilroy-bold">[invoice number]</span><br></br>

                    Dear [receiver name],<br></br>

                    This email is on behalf of [company name].<br></br>

                    Hope this email finds you well. This message is to remind you that the payment for the invoice number [invoice number] for [invoice amount] is due on [due date].<br></br>

                    Request you to ensure that the payment is processed by the due date. If you have any questions or concerns regarding the payment, please do not hesitate to contact [company_poc] at [company_contact].<br></br>

                    We value your business and look forward to continued collaboration.<br></br>

                    Have a wonderful day!<br></br>

                    Best regards,<br></br>
                    [company name]<br></br>
                </p>);
            }
        case "Overdue Reminder":
            return (
                <p className="prose prose-md text-left font-gilroy-medium">
                    <span className="font-gilroy-bold">Early Reminder</span><br></br>
                    <span className="font-gilroy-bold">Subject</span>: Payment Reminder for Invoice <span className="font-gilroy-bold">[invoice number]</span><br></br>

                    Dear [receiver name],<br></br>

                    This email is on behalf of [company name].<br></br>

                    Hope this email finds you well. This message is to remind you that the payment for the invoice number [invoice number] for [invoice amount] is due on [due date].<br></br>

                    Request you to ensure that the payment is processed by the due date. If you have any questions or concerns regarding the payment, please do not hesitate to contact [company_poc] at [company_contact].<br></br>

                    We value your business and look forward to continued collaboration.<br></br>

                    Have a wonderful day!<br></br>

                    Best regards,<br></br>
                    [company name]<br></br>
                </p>)

    }

    return <></>
}
