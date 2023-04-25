import { Link, useActionData, useLoaderData, useSubmit, useTransition } from "@remix-run/react";

import { auth, firestore } from "../firebase/neutron-config.server";
import { json } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import React from "react";

import { injectStyle } from 'react-toastify/dist/inject-style'
import { FormProvider, useForm } from "react-hook-form";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { signIn } from "~/models/user.server";
import { trackJuneEvent } from "~/analytics/june-config.server";
import { createUserSession, logout, requireUser } from "~/session.server";
import { getSingleDoc, updateFirestoreDocFromData } from "~/firebase/queries.server";
import AuthPagesSidePanel from '~/assets/images/AuthPageSidePanel2.svg'
import { doc } from "firebase/firestore";
import { NeutronError } from "~/logging/NeutronError";
import DefaultSpinner from "~/components/layout/DefaultSpinner";
import { emitToast } from "~/utils/toasts/NeutronToastContainer";
import NucleiTextInput from "~/components/inputs/fields/NucleiTextInput";

export async function loader({ request }: { request: Request }) {

    const session = await requireUser(request);


    if (session && getAuth().currentUser?.emailVerified) {

        if (session?.metadata?.businessID) {
            return redirect(`/dashboard`)
        } else {
            return redirect('/onboarding/industry')
        }

    }

    return null;
    // getRedirectResult(auth)
    //   .then((result) => {
    //     // This gives you a Google Access Token. You can use it to access Google APIs.
    //     const credential = GoogleAuthProvider.credentialFromResult(result);
    //     const token = credential.accessToken;

    //     // The signed-in user info.
    //     const user = result.user;
    //     
    //   }).catch((error) => {
    //     // Handle Errors here.
    //     const errorCode = error.code;
    //     const errorMessage = error.message;
    //     
    //     // The email of the user's account used.
    //     const email = error.customData.email;
    //     // The AuthCredential type that was used.
    //     const credential = GoogleAuthProvider.credentialFromError(error);
    //     // ...
    //   });

    // const authURL = generateAuthUrl();
    // const result = await authorizeAndExecute(() => {
    //   return json({ gapi_scopes_valid: true, authurl: authURL });

    // }, () => {
    //   return json({ gapi_scopes_valid: false, authurl: authURL });

    // })
    // return result;

}

export async function action({ request }: { request: Request }) {

    try {
        const data = await request.formData();
        const email: string = data.get('email') as string;

        const res = await sendPasswordResetEmail(auth, email)
    } catch (e: any) {
        console.log(e)
        const neutronError = new NeutronError(e);
        return json({ type: neutronError.type, message: neutronError.message });
    }

    return json({ status: 1 })

}



export default function Login() {


    const loginButtonStates = (state: string) => {
        switch (state) {
            case "idle":
            case "loading":
                return (<span>Send Password Reset Link</span>)
            case "submitting":
                return (<DefaultSpinner size="regular"></DefaultSpinner>)
        }
    }
    const data = useLoaderData();
    const actionData = useActionData();

    let submit = useSubmit();
    const transition = useTransition();
    const parsedData = JSON.parse(data);

    // const [user, loading, error] = useAuthState(auth);

    const methods = useForm();

    const handleSubmit = methods.handleSubmit;

    React.useEffect(() => {
        injectStyle();
        if (actionData?.message) {
            emitToast(actionData.message, null, "error")

        }
        if (actionData?.status == 1){
            emitToast("Password reset email sent", "Please check your inbox and your spam folder", "success")

        }


        // if (!loading && user && !error) {
        //   
        //   setTimeout(() => {
        //     if (parsedData.gapi_scopes_valid) {
        //       navigate("/session/dashboard");
        //     }
        //     else {
        //       

        //       window.location.href = parsedData.authurl;
        //     }
        //   }, 1000);
        // }
    }, [actionData]);


    return (
        <div className=" sm:h-screen w-full justify-center bg-white align-middle">
            <div className=" flex flex-row-reverse h-full w-full text-center">
                <div id="left-panel" className="flex flex-col w-full sm:basis-3/5 h-full justify-center sm:justify-start mt-20 sm:mt-0 sm:items-start p-8">
                    <div id="form-container" className=" w-full h-full flex flex-row justify-center mt-20 sm:mt-0">
                        <div className="flex flex-col w-full h-full justify-center">
                            <div className="bg-white rounded-lg text-black text-left self-center w-full sm:w-[500px]">
                                <h1
                                    className={`text-left sm:ml-0 font-gilroy-bold  text-[30px]`}
                                >
                                    Forgot Password
                                </h1>
                                <h2 className="prose prose-sm font-gilroy-medium text-[#7D7D7D]">Enter your account's email ID</h2>

                                <div className=" flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 text-black  w-full justify-between">
                                    <div className="flex flex-col justify-items-start space-y-4 mt-5 w-full ">
                                        <FormProvider {...methods}>
                                            <form
                                                className=" space-y-6"
                                                onSubmit={handleSubmit((data) => {

                                                    const form = new FormData();
                                                    form.append('email', data.email);
                                                    submit(form, { replace: true, method: 'post' })
                                                })}
                                            >
                                                <NucleiTextInput name={"email"} label={"Email"} placeholder="e.g : name@example.com" />

                                                <div className="flex flex-col sm:flex-row  items-center justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                                                    <button
                                                        className="w-full basis-1/2 rounded-lg  bg-[#6950ba] p-3 border-2 border-transparent active:bg-primary-dark hover:bg-primary-dark  focus:bg-primary-dark outline-none focus:ring-1 focus:ring-white focus:border-white hover:border-white hover:ring-white text-white font-gilroy-medium font-[18px] transition-all"
                                                        type="submit"
                                                    >
                                                        {loginButtonStates(transition.state)}
                                                    </button>
                                                    {/* <button className="pointer-auto w-full basis-1/2  transition-all outline-none" onClick={async () => {

                          // signInWithRedirect(auth, googleProvider);

                          // As this API can be used for sign-in, linking and reauthentication,
                          // check the operationType to determine what triggered this redirect
                          // operation.
                          // const operationType = result.operationType;

                        }}>

                          <div className="rounded-xl bg-white hover:ring-2 hover:ring-accent-dark active:ring-2 outine-none p-3 flex flex-row space-x-5 w-auto justify-between ">
                            <img src={GoogleIcon} alt="Google Icon" />

                            <h1>Sign Up With Google</h1>
                          </div>
                        </button> */}
                                                </div>

                                            </form>
                                        </FormProvider>

                                        <div className="hover:underline font-gilroy-medium  w-full text-center decoration-white self-start mt-4 pt-4"><span className="text-black">Don't have an account?</span> <Link to="/signup" className=" text-[#6950ba] hover:underline hover:decoration-[#6950ba]">Sign Up </Link></div>
                                        <div className="hover:underline font-gilroy-medium  w-full text-center decoration-white self-start mt-2"><span className="text-black">Already have an account?</span> <Link to="/login" className=" text-[#6950ba] hover:underline hover:decoration-[#6950ba]">Log In </Link></div>

                                    </div>


                                </div>

                            </div>
                        </div>
                    </div>

                </div>
                <div id="right-panel" className="hidden sm:flex sm:flex-col border-accent-dark  basis-2/5 w-full ">
                    <img className=" w-full h-full object-cover" alt="Neutron Auth Page Graphic" src={AuthPagesSidePanel}></img>
                    {/* <img
            src={RightSidePanelIllustration}
            className="h-full m-1 w-full snap-center"
            alt="hi there"
          ></img> */}
                </div>

                {/* <div className="bg-bg-primary-dark rounded-lg text-left p-5 sm:w-[1016px]">
          <h1
            className={`text-left sm:ml-0 font-gilroy-black text-white text-[40px]`}
          >
            Login
          </h1>

          <div className=" flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0  w-full justify-between">
            <div className="flex flex-col justify-items-start space-y-4 mt-5 w-full ">
              <form
                className=" space-y-6"
                onSubmit={handleSubmit((data) => {
                  
                  const form = new FormData();
                  form.append('email', data.email);
                  form.append('password', data.password)
                  submit(form, { replace: true, method: 'post' })
                })}
              >
                <div className="sm:text-left space-y-3 w-full">
                  <span className=" prose prose-md text-white font-gilroy-black text-[25px]">Email</span>
                  <input  {...register('email')} type="text" placeholder="e.g: name@example.com" className=" transition-all bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 caret-bg-accent-dark focus:outline-none focus:border-accent-dark focus:ring-2 focus:ring-accent-dark text-white active:caret-yellow-400 text-sm rounded-lg placeholder-[#C1C1C1] block w-full h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white font-gilroy-medium font-[18px] " />
                </div>

                <div className="sm:text-left space-y-3 w-full">
                  <span className=" prose prose-md text-white font-gilroy-black text-[25px]">Password</span>
                  <input {...register('password')} type="password" placeholder="Lets keep it hush hush..." className=" transition-all bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 caret-bg-accent-dark focus:outline-none focus:border-accent-dark focus:ring-2 focus:ring-accent-dark text-white active:caret-yellow-400 text-sm rounded-lg placeholder-[#C1C1C1] block w-full h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white font-gilroy-medium font-[18px] " />
                </div>

                <div className="flex flex-row justify-start">
                  <button
                    className="w-40 rounded-lg mt-5 self-start  bg-accent-dark p-3 border-2 border-transparent active:bg-amber-300 outline-none focus:ring-1 focus:ring-white focus:border-white hover:border-white hover:ring-white text-black font-gilroy-black font-[18px] transition-all"
                    type="submit"
                  >
                    {loginButtonStates(transition.state)}
                  </button>
                </div>

              </form>
              <Link to="/signup" className="hover:underline decoration-white"><span className="text-white">Don't have an account? <span className="font-gilroy-black">Sign Up </span></span></Link>
              <TransparentButton
                className="w-40 mt-5 rounded-lg self-start bg-accent-dark p-3 text-white transition-all border-2 border-white hover:border-accent-dark outline-none focus:ring-1 focus:ring-white hover:bg-bg-primary-dark"
                onClick={() => navigate('/signup')}
                text={"Don't have an account? Sign Up"}
              /> 
              <div className="flex flex-row w-full">
                <button className="pointer-auto  transition-all outline-none" onClick={async () => {

                  // signInWithRedirect(auth, googleProvider);

                  // As this API can be used for sign-in, linking and reauthentication,
                  // check the operationType to determine what triggered this redirect
                  // operation.
                  // const operationType = result.operationType;

                }}>

                  <div className="rounded-xl bg-white hover:ring-2 hover:ring-accent-dark active:ring-2 outine-none p-3 flex flex-row space-x-5 w-auto justify-between ">
                    <img src={GoogleIcon} alt="Google Icon" />

                    <h1>Sign Up With Google</h1>
                  </div>
                </button>

              </div>
            </div>
            

          </div>

        </div> */}

            </div>

        </div >
    );
}


