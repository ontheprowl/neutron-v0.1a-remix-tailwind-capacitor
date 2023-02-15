import React from "react";
import type { TypeOptions } from "react-toastify";
import { ToastContainer, toast } from "react-toastify";




const contextClass = {
    success: "bg-white border-2 border-l-8 text-black font-gilroy-bold border-[#24AB39] rounded-xl",
    error: "bg-white border-2 border-l-8 text-black font-gilroy-bold border-[#D33030] rounded-xl",
    warning: "bg-white border-2 border-l-8 text-black font-gilroy-bold border-[#FFB319] rounded-xl",
    default: "bg-white border-2 border-l-8 text-black font-gilroy-bold border-[#F670C7] rounded-xl",
};


export function emitToast(head: React.ReactNode, body: React.ReactNode, type: TypeOptions) {

    return toast(
        <div className="p-3 flex flex-col justify-center max-h-60 max-w-xl mr-8 ">
            <div>
                <h2 className="prose prose-md w-full text-black font-gilroy-bold">
                    {head}
                </h2>
            </div>
            <div>
                {body}
            </div>
        </div>,
        { theme: "dark", type: type }
    );

}



export function NeutronToastContainer() {


    return (<ToastContainer position="bottom-center"
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        toastClassName={({ type }) => contextClass[type || "default"]}
        theme="dark"
        limit={1}

        pauseOnFocusLoss
        draggable
        pauseOnHover></ToastContainer>)
}