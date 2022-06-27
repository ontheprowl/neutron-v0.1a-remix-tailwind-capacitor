import { redirect } from "@remix-run/node";
import { push, ref, set } from "firebase/database";
import { useAuthState } from "react-firebase-hooks/auth";
import { json } from "remix-utils";
import DisputesChatComponent from "~/components/disputes/DisputesChatComponent";
import { auth, db } from "~/firebase/neutron-config";
import { formatDateToReadableString } from "~/utils/utils";


export async function action({ request }: { request: Request }) {

    try {
        console.log(`Message add request received successfully!!!!'`);
        const data = await request.formData();
        const message: string = data.get('message');
        const from: string = data.get('from')?.toString();
        const to: string = data.get('to')?.toString();
        const result = await set(push(ref(db, 'messages/' + btoa((from + to).split('').sort().join('')))), { text: message, to: to, from: from, timestamp: new Date().toUTCString() })
        console.log(`Message sent successfully!!!! result : ${result}`)
    } catch (e: Error) {
        return null;
    }
    return json({ result: "success" })

}

export default function DisputesIndex() {


    const [user, loading, error] = useAuthState(auth);

    return (
        <div className='flex flex-col space-y-8 bg-bg-primary-dark h-full'>
            <div className=" flex flex-row justify-between w-full">
                <div className='flex flex-col m-6 justify-between'>
                    <div className="flex flex-col">
                        <article className="prose">
                            <h2 className="text-white prose prose-lg">Welcome {user?.email}</h2>
                            <p className="text-white prose prose-sm">{formatDateToReadableString()}</p>
                        </article>
                    </div>
                    <div className="flex items-center w-[692px] mt-10">
                        <label htmlFor="simple-search" className="sr-only">Search</label>
                        <div className="relative w-full ">
                            <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                                <svg className="w-5 h-5 text-white dark:text-black" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path></svg>
                            </div>
                            <input type="text" id="simple-search" className="p-5 bg-bg-primary-dark border border-gray-300 text-gray-900 text-sm rounded-lg placeholder-white block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white " placeholder="Search through contracts" required />

                        </div>
                    </div>
                    <div id="user-action-buttons">
                        <div>

                        </div>
                    </div>
                </div>

                <div className="flex flex-col-reverse m-6">

                    {/**Add profile buttons here */}
                    <button
                        className="w-40 rounded-lg bg-accent-dark p-3 text-white transition-all hover:scale-105"
                        onClick={() => {
                            navigate('create');
                        }}
                    >
                        Add Contract
                    </button>
                </div>
            </div>
            <div className={`bg-bg-primary-dark p-3 rounded-lg border-2 border-solid border-accent-dark  h-full m-6`}>
                <DisputesChatComponent from="kunal" to="gaurav"></DisputesChatComponent>
            </div>
        </div >)
}