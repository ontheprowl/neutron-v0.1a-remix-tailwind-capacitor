import type { Dispatch, MouseEventHandler, SetStateAction } from "react";
import { primaryGradientDark } from "~/utils/neutron-theme-extensions";




export default function NeutronModal({ toggleModalFunction, heading, body, onConfirm, onReject }: { toggleModalFunction: Dispatch<SetStateAction<boolean>>, heading?: JSX.Element, body?: JSX.Element, onConfirm?: MouseEventHandler<HTMLButtonElement>, onReject?: MouseEventHandler<HTMLButtonElement> }) {

    return (<>

        <div id="defaultModal" className="backdrop-blur-md overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 w-auto sm:w-full md:inset-0 h-modal md:h-full justify-center items-center flex" aria-modal="true" role="dialog">
            <div className="relative p-4 flex flex-col w-full max-w-2xl h-full md:h-auto">
                <div className="relative bg-[#F5EBFF] rounded-xl p-14 shadow dark:bg-gray-700">
                    <div className="flex justify-between items-start  rounded-t">
                        <h3 className="text-[30px] font-gilroy-black text-gray-900 dark:text-white">
                            {heading}
                        </h3>
                        <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white" onClick={() => {
                            toggleModalFunction(false);
                        }
                        }>
                            <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>
                    <div className="space-y-6 mt-5 break-normal">
                        {body}
                    </div>
                    <div className="flex items-center justify-between w-full font-gilroy-medium text-[18px] leading-relaxed space-x-6 rounded-b mt-8 dark:border-gray-600">
                        {onReject && <button onClick={onReject} type="button" className="transition-all text-black bg-transparent  focus:ring-4 w-full focus:outline-none focus:ring-purple-300  rounded-lg ring-2 ring-purple-500 text-sm font-gilroy-black px-5 py-2.5  hover:ring-4 focus:z-10 ">Cancel</button>}
                        {onConfirm && <button onClick={onConfirm} type="button" className={`transition-all text-white ${primaryGradientDark}  hover:ring-4 focus:ring-4 w-full focus:ring-gray-400 focus:outline-none ring-black  font-gilroy-black rounded-lg text-sm px-5 py-2.5 text-center`}>Confirm</button>}
                    </div>
                </div>
            </div>
        </div></>)

}