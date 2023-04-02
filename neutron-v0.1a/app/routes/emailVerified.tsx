import { useNavigate } from "@remix-run/react"
import { useEffect } from "react";
import DefaultSpinner from "~/components/layout/DefaultSpinner";

export default function EmailVerifiedPage() {

    let navigate = useNavigate();

    useEffect(() => {
        setTimeout(() => {
            navigate('/login')
        },
        3000);
    })

    return (
        <div className="  h-screen w-full justify-center p-12 text-black bg-white align-middle">

            <div className=" m-2 mt-5  justify-evenly flex flex-col items-center space-y-6 font-gilroy-medium rounded-xl h-5/6 ">
                <div className="flex flex-col items-center border-2 border-primary-base rounded-xl p-40 space-y-4">
                    <h1 className="mt-5 text-[24px] text-center">Email verification successful</h1>
                    <div className="animate-pulse">
                        <DefaultSpinner />
                    </div>
                    <h1 className="mt-5 text-[20px] text-center">Redirecting you to login</h1>
                </div>
            </div>
        </div>
    )
}