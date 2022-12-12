import { json } from "@remix-run/server-runtime";
import { sendChatMessage } from "~/firebase/queries.server";

export async function action({ request }: { request: Request }) {

    const data = await request.formData();
    const message: string = data.get('message')?.toString();
    const from: string = data.get('from')?.toString();
    const to: string = data.get('to')?.toString();
    const key = data.get('key')?.toString();
    const result = await sendChatMessage(message, from, to, key)
    return json({ result: result })

}