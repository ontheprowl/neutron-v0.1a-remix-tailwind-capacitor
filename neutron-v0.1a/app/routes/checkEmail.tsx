import { useNavigate } from "@remix-run/react"
import { useEffect } from "react";
import FormButton from "~/components/inputs/FormButton";

export default function VerificationPendingPage() {

    let navigate = useNavigate();


    return (
        <div className="  h-screen w-full justify-center p-12 text-white bg-bg-primary-dark align-middle">

            <div className=" m-2 mt-5  justify-evenly flex flex-col items-center space-y-6 font-gilroy-medium rounded-xl h-5/6 ">
                <div className="flex flex-col items-center space-y-4">
                    <h1 className="mt-5 text-[24px] text-center">Signup successful</h1>
                    <div className={`h-12 w-12 bg-[#8364E8] p-2 pt-3 text-center rounded-full text-white transition-all hover:opacity-80`}>✓</div>
                    <h1 className="mt-5 text-[20px] text-center">To proceed, please verify your email ID via the link in your inbox.</h1>
                    <h1 className="mt-5 text-[16px] text-gray-400 text-center">Please check your spam folder as well</h1>
                </div>
                <div className="flex flex-col mt-10  w-auto h-auto">
                    <FormButton onClick={()=>{
                        navigate('/login');
                    }} text={"Back to Login"}></FormButton>
                </div>
            </div>
        </div>
    )
}