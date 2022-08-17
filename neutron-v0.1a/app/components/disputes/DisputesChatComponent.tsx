import { async } from "@firebase/util"
import { useActionData, useLoaderData, useParams, useSubmit } from "@remix-run/react"
import { ActionFunction, json, LoaderFunction } from "@remix-run/server-runtime"
import { User } from "firebase/auth"
import { equalTo, get, onValue, orderByChild, orderByKey, push, query, ref, set } from "firebase/database"
import { AnimatePresence, motion } from "framer-motion"
import React from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, db } from "~/firebase/neutron-config.server"
import { formatDateToReadableString } from "~/utils/utils"
import SendIcon from '~/assets/images/SendIcon.svg'
import FormButton from "../inputs/FormButton"




export default function DisputesChatComponent({ from, to, messages }: { from: string, to: string, messages: Array<any> }) {


    const actionData = useActionData();
    const loaderData = useLoaderData();
    const submit = useSubmit();
    const [chatMessages, setMessages] = React.useState<Array<{ text: string, from: string, to: string, timestamp: string }>>([]);

    const [newMessage, setNewMessage] = React.useState('')

    React.useEffect(() => {
        setMessages(messages);
    }, [messages])

    console.dir("MESSAGES are :")
    console.dir(messages)
    return (
        <div className=" bg-bg-secondary-dark flex flex-col h-full rounded-lg items-stretch">
            <ul className="h-auto min-h-max overflow-scroll m-5 text-white grid grid-cols-1">
                <AnimatePresence initial={false}>

                    {chatMessages?.map((message, i) => {
                        return (
                            <motion.li initial={{ opacity: 0, y: 50, scale: 0.3 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{
                                    opacity: 0, scale: 0.5, transition: {
                                        type: "spring",
                                        stiffness: 700,
                                        damping: 30
                                    }
                                }} layout key={message.text} className={`${message.from == from ? 'place-self-start text-left' : 'place-self-end text-right '} w-auto`}>
                                <motion.div>
                                    <motion.h2 className={`prose prose-lg text-black block bg-accent-dark p-5 ${message.from == from ? 'rounded-r-xl rounded-tl-xl' : 'rounded-l-xl rounded-tr-xl'} `}>{message.text}</motion.h2>
                                    <motion.p className=" text-white text-xs mt-2">{formatDateToReadableString(Date.parse(message.timestamp), true)}</motion.p>
                                </motion.div>
                            </motion.li>)
                    })}
                </AnimatePresence>
            </ul>
            <div className="ml-4 mr-4 rounded-full flex-row flex justify-between p-1 bg-[#5C5C5C] text-white placeholder:text-white">
                <input type="text" id="new-message" className="bg-[#5C5C5C] rounded-full p-3 ring-0 caret-transparent active:decoration-transparent inset-0" value={newMessage} onChange={(e) => {
                    console.log(newMessage)
                    setNewMessage(e.target.value)
                }} placeholder="Enter a new message..." />
                <button onClick={() => {
                    const data = new FormData();
                    data.append('message', newMessage);
                    data.append('from', from);
                    data.append('to', to);
                    submit(data, { method: 'post', action:`/${loaderData.metadata.displayName}/disputes/sendMessage` });
                    setNewMessage('');
                }}><img src={SendIcon} alt="sendicon"></img></button>
            </div>

        </div >)
}