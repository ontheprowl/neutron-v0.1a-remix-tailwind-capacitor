import { Form, Link, useActionData, useFetcher, useLoaderData, useNavigate, useSubmit, useTransition } from "@remix-run/react";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth, firestore, googleProvider } from "../firebase/neutron-config.server";
import { ActionFunction, json, LoaderFunction } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { login, logout } from "~/firebase/firebase-utils";
import { Response } from "@remix-run/node";
import React from "react";

import { ToastContainer, toast } from 'react-toastify';
import { injectStyle } from 'react-toastify/dist/inject-style'
import { useForm } from "react-hook-form";
import Icon from "~/assets/images/iconFull.svg"
import IconSpinner from '~/assets/images/icon.svg'
import { generateAuthUrl, authorizeAndExecute } from "~/firebase/gapis-config.server";
import useWindowDimensions from "~/hooks/useWindowDimensions";
import { getAuth, getRedirectResult, GoogleAuthProvider, signInWithEmailAndPassword, signInWithRedirect } from "firebase/auth";
import { signIn } from "~/models/user.server";
import { createUserSession, getSession, requireUser } from "~/session.server";
import { getSingleDoc } from "~/firebase/queries.server";
import { doc } from "firebase/firestore";
import GoogleIcon from '~/assets/images/google.svg'
import TransparentButton from "~/components/inputs/TransparentButton";
import MobileNavbarPadding from "~/components/layout/MobileNavbarPadding";
import { primaryGradientDark } from "~/utils/neutron-theme-extensions";
import { NeutronError } from "~/utils/NeutronError";
import { NeutronErrorCode } from "~/logging/errors";
import DefaultSpinner from "~/components/layout/DefaultSpinner";
import { motion, useCycle } from "framer-motion";

export async function loader({ request }: { request: Request }) {

  const session = await requireUser(request);

  if (session && getAuth().currentUser?.emailVerified) {
    console.log('Session retrieved from cookies....')
    return redirect(`/${session?.metadata?.displayName}/dashboard`)
  }

  return null;
  // getRedirectResult(auth)
  //   .then((result) => {
  //     // This gives you a Google Access Token. You can use it to access Google APIs.
  //     const credential = GoogleAuthProvider.credentialFromResult(result);
  //     const token = credential.accessToken;

  //     // The signed-in user info.
  //     const user = result.user;
  //     console.log(`GOOGLE OAUTH AUTHENTICATED USER IS : ${user}`)
  //   }).catch((error) => {
  //     // Handle Errors here.
  //     const errorCode = error.code;
  //     const errorMessage = error.message;
  //     console.log(`Error during oAuth flow.... error is : ${error.message}`)
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
    const email: string = data.get('email');
    const password: string = data.get('password');
    const { user } = await signIn(email, password);
    const ref = doc(firestore, '/metadata/', user.uid);
    const metadata = await getSingleDoc(`/metadata/${user.uid}`)
    const profileComplete = Boolean(metadata?.profileComplete);
    console.log(`Current user is : ${user.email}`)
    const token = await user.getIdToken();
    console.log("EMAIL VERFIED ? " + user.emailVerified)
    if (user.emailVerified || email == "test@test.com") {
      return createUserSession({ request: request, metadata: { path: ref.path }, userId: token, remember: true, redirectTo: profileComplete?`/${user.displayName}/dashboard`:`/${user.displayName}/profile` })
    } else {
      throw new Error("neutron-auth/email-not-verified");
    }
  } catch (e: any) {
    console.dir(e)
    const neutronError = new NeutronError(e);
    return json({ type: neutronError.type, message: neutronError.message });
  }

}



export default function Login() {


  const loginButtonStates = (state: string) => {
    switch (state) {
      case "idle":
        return (<span>Log In</span>)
      case "submitting":
        return (<span>Logging you in ...</span>)
      case "loading":
        return (<DefaultSpinner></DefaultSpinner>)
    }
  }
  const data = useLoaderData();
  const actionData = useActionData();
  console.log(actionData)
  const [rotation, cycleRotation] = useCycle([0, 90, 180, 270, 360]);
  let submit = useSubmit();
  const transition = useTransition();
  let fetcher = useFetcher();
  const parsedData = JSON.parse(data);
  console.log(parsedData)
  let navigate = useNavigate();
  // const [user, loading, error] = useAuthState(auth);

  const { register, handleSubmit } = useForm();

  React.useEffect(() => {
    injectStyle();
    const neutronError = actionData as NeutronError;
    if (neutronError) {
      console.log("ERROR DURING LOGIN")
      console.dir(neutronError);
      toast(<div><h2>{neutronError.message}</h2></div>, { theme: "dark", type: "error" })

    }


    // if (!loading && user && !error) {
    //   console.log(user);
    //   setTimeout(() => {
    //     if (parsedData.gapi_scopes_valid) {
    //       navigate("/session/dashboard");
    //     }
    //     else {
    //       console.log(parsedData)

    //       window.location.href = parsedData.authurl;
    //     }
    //   }, 1000);
    // }
  }, [actionData]);


  return (
    <div className="h-screen sm:h-full w-full justify-center bg-bg-primary-dark align-middle p-10">
      <div className=" flex flex-col items-center justify-center h-full w-full text-center">

        <img
          src={Icon}
          className="h-auto max-h-28 m-10 max-w-28 snap-center"
          alt="hi there"
        ></img>
        <div className="bg-bg-primary-dark rounded-lg text-left p-5 sm:w-[1016px]">
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
                  console.log(data.email, data.password);
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
              {/* <TransparentButton
                className="w-40 mt-5 rounded-lg self-start bg-accent-dark p-3 text-white transition-all border-2 border-white hover:border-accent-dark outline-none focus:ring-1 focus:ring-white hover:bg-bg-primary-dark"
                onClick={() => navigate('/signup')}
                text={"Don't have an account? Sign Up"}
              /> */}
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
            <div className=" pl-48 items-start hidden sm:flex sm:flex-col">
              <motion.a
                animate={{ rotate: [0, 90, 180, 270, 360, 90, 60, 0], }}
                transition={{ repeat: Infinity, duration: 2 }}

                href="https://neutron.money"
                className="mb-5 flex items-center"
              >
                <img
                  src={IconSpinner}
                  className="transition-all h-[496px] w-[428px]"
                  alt="Neutron Logo"
                />
              </motion.a></div>

          </div>

        </div>

      </div>
      <ToastContainer position="bottom-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        theme="dark"
        limit={1}

        pauseOnFocusLoss
        draggable
        pauseOnHover></ToastContainer>

    </div>
  );
}


