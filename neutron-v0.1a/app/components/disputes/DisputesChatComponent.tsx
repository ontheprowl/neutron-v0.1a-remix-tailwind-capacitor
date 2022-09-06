import { async } from "@firebase/util"
import { useActionData, useFetcher, useLoaderData, useParams, useSubmit } from "@remix-run/react"
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
import { primaryGradientDark } from "~/utils/neutron-theme-extensions"




export default function DisputesChatComponent({ from, to, messages, fullHeight, customKey }: { from: string, to: string, messages: Array<any>, customKey?: string, fullHeight?: boolean }) {


    const loaderData = useLoaderData();
    const metadata = loaderData.metadata;
    const fetcher = useFetcher();
    const [chatMessages, setMessages] = React.useState<Array<{ text: string, from: string, to: string, timestamp: string }>>([]);

    const [newMessage, setNewMessage] = React.useState('')

    React.useEffect(() => {
        setMessages(messages);
    }, [messages])

    console.dir("MESSAGES are :")
    console.dir(messages)
    return (
        <div className={` flex flex-col h-full ${fullHeight ? '' : 'max-h-[550px]'} overflow-y-scroll w-full  rounded-lg items-stretch`}>
            <ul className="h-[900px] overflow-y-scroll m-3 text-white flex flex-col grid-cols-1">
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
                                }} layout key={message.timestamp} className={`${message.from == from ? 'place-self-end text-right' : 'place-self-start text-left'} w-auto`}>
                                <motion.div className="mb-2 ">
                                    <motion.h2 className={`prose prose-lg text-black block  p-3 break-all ${message.from == from ? `rounded-l-xl rounded-tr-xl ${primaryGradientDark}` : 'rounded-r-xl rounded-tl-xl bg-gray-400'} `}>{message.text}</motion.h2>
                                    <motion.p className=" text-white text-xs mt-2">{formatDateToReadableString(message.timestamp, false, true)}</motion.p>
                                </motion.div>
                            </motion.li>)
                    })}
                </AnimatePresence>
            </ul>
            <motion.div className="ml-4 mr-4 rounded-full flex-row flex justify-between space-x-3 p-1 bg-[#5C5C5C] text-white placeholder:text-white">
                <motion.input type="text" id="new-message" className="bg-[#5C5C5C] rounded-full p-3 w-full ring-transparent  caret-transparent transition-all  active:decoration-transparent outline-none ring-2 hover:ring-accent-dark inset-0" value={newMessage} onChange={(e) => {
                    console.log(newMessage)
                    setNewMessage(e.target.value)
                }} placeholder="Enter a new message..." />
                <motion.button onClick={() => {
                    const data = new FormData();
                    data.append('message', newMessage);
                    data.append('from', from);
                    data.append('to', to);
                    if (customKey) {
                        data.append('key', customKey);
                    }
                    fetcher.submit(data, { method: 'post', action: `/${metadata.displayName}/disputes/sendMessage` });
                    setNewMessage('');
                }} className="hover:animate-pulse hover:ring-purple-500 hover:drop-shadow-2xl active:ring-purple-400 ring-2 ring-transparent caret-white outline-none rounded-full p-1  transition-all"><img src={SendIcon} alt="sendicon"></img></motion.button>
            </motion.div>

        </div >)
}