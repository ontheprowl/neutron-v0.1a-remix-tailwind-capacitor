import { async } from "@firebase/util"
import { useActionData, useLoaderData, useParams, useSubmit } from "@remix-run/react"
import { ActionFunction, json, LoaderFunction } from "@remix-run/server-runtime"
import { User } from "firebase/auth"
import { equalTo, get, onValue, orderByChild, orderByKey, push, query, ref, set } from "firebase/database"
import { AnimatePresence, motion } from "framer-motion"
import React from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, db } from "~/firebase/neutron-config"
import { formatDateToReadableString } from "~/utils/utils"
import FormButton from "../inputs/FormButton"





export default function DisputesChatComponent({ from, to }: { from: string, to: string }) {


    const actionData = useActionData();
    const submit = useSubmit();
    const [user, loading, error] = useAuthState(auth)
    const [messages, setMessages] = React.useState<Array<{ text: string, from: string, to: string, timestamp: string }>>([]);

    const [newMessage, setNewMessage] = React.useState('')

    React.useEffect(() => {

        const messageQuery = query(ref(db, 'messages/' + btoa((from+to).split('').sort().join(''))));

        onValue(messageQuery, (value) => {
            const data = value.val();
            console.log(data)

            let messagesArray: Array<{ text: string, to: string, from: string, timestamp: string }> = []
            for (const [key, value] of Object.entries(data)) {
                messagesArray.push(value)
            }
            console.log(messagesArray)
            if (messages.length != messagesArray.length)
                setMessages(messagesArray)
        })
    }, [actionData, from, to])

    return (
        <div className="m-10 bg-bg-primary-dark border-2 flex flex-col h-auto border-accent-dark rounded-lg items-stretch">
            <h1 className="text-white prose prose-xl ml-3"> Comments </h1>
            <ul className="h-auto min-h-max max-h-[500px] overflow-scroll m-5 text-white grid grid-cols-1">
                <AnimatePresence initial={false}>

                    {messages?.map((message, i) => {
                        return (
                            <motion.li initial={{ opacity: 0, y: 50, scale: 0.3 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{
                                    opacity: 0, scale: 0.5, transition: {
                                        type: "spring",
                                        stiffness: 700,
                                        damping: 30
                                    }
                                }} layout key={message.text} className={`${message.from==from ? 'place-self-start text-left':'place-self-end text-right '} w-auto`}>
                                <motion.div>
                                    <motion.h2 className="prose prose-lg text-black block bg-accent-dark p-5 rounded-xl ">{message.text}</motion.h2>
                                    <motion.p className=" text-white text-xs mt-2">{formatDateToReadableString(Date.parse(message.timestamp), true)}</motion.p>
                                </motion.div>
                            </motion.li>)
                    })}
                </AnimatePresence>
            </ul>
            <input type="text" id="new-message" value={newMessage} onChange={(e) => {
                console.log(newMessage)
                setNewMessage(e.target.value)
            }} className="m-6 rounded-lg bg-gray-500 text-white p-3 placeholder:text-white" placeholder="Enter a new message..." ></input >
            <FormButton onClick={() => {
                const data = new FormData();
                data.append('message', newMessage);
                data.append('from', from);
                data.append('to', to);
                submit(data, { method: 'post' });
                setNewMessage('');
            }} text="Send message" />
        </div >)
}