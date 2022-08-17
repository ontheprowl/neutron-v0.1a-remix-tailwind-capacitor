import { Form, Link, useActionData, useLoaderData, useNavigate, useSubmit, useTransition } from "@remix-run/react";

import { useAuthState } from "react-firebase-hooks/auth";
import { adminAuth, auth, googleProvider } from "../firebase/neutron-config.server";
import { ActionFunction, json, LoaderFunction } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { login, logout } from "~/firebase/firebase-utils";
import IconSpinner from '~/assets/images/icon.svg'
import { Response } from "@remix-run/node";
import React, { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import Icon from "~/assets/images/iconFull.svg"
import { generateAuthUrl, authorizeAndExecute } from "~/firebase/gapis-config.server";
import useWindowDimensions from "~/hooks/useWindowDimensions";
import { createUserWithEmailAndPassword, getAuth, getRedirectResult, GoogleAuthProvider, sendEmailVerification, signInWithEmailAndPassword, signInWithRedirect, updateProfile, User } from "firebase/auth";
import { signUp } from "~/models/user.server";
import { createUserSession, requireUser } from "~/session.server";
import { addFirestoreDocFromData, getFirebaseDocs, setFirestoreDocFromData } from "~/firebase/queries.server";
import { DEFAULT_USER_STATE } from "~/models/user";
import { ErrorMessage } from "@hookform/error-message";
import GoogleIcon from '~/assets/images/google.svg'
import { ValidationPatterns } from "~/utils/utils";
import TransparentButton from "~/components/inputs/TransparentButton";
import { toast, ToastContainer } from "react-toastify";
import { NeutronError } from "~/utils/NeutronError";
import { injectStyle } from "react-toastify/dist/inject-style";
import DefaultSpinner from "~/components/layout/DefaultSpinner";
import { motion } from "framer-motion";
import { env } from "process";

export async function loader({ request }: { request: Request }) {

  const session = await requireUser(request);

  if (session && getAuth().currentUser?.emailVerified) {
    return redirect(`/${session?.metadata?.displayName}/dashboard`)
  }

  const usernames = await getFirebaseDocs('userUIDS', true);
  return json({ usernames: usernames });
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
    const displayName: string = data.get('displayName')
    const email: string = data.get('email');
    const password: string = data.get('password');
    const { user } = await signUp(email, password);
    await updateProfile(user, {
      displayName: displayName,
      photoURL: '',
    })

    await sendEmailVerification(user, { url: `http://${env.NODE_ENV === "development" ? "localhost:3000" : "test.neutron.money"}/auth/verification` });
    console.log("\n verification email sent \n");
    const userUIDRef = await setFirestoreDocFromData({ uid: user.uid, email: user.email, profileComplete: false }, 'userUIDS', `${displayName}`)

    const ref = await setFirestoreDocFromData({
      ...DEFAULT_USER_STATE, email: user.email, id: user.uid, displayName: user.displayName, creationTime: user.metadata.creationTime, profileComplete: false
    }, `metadata`, user.uid);
    // const uidMapRef = await setFirestoreDocFromData({ uid: user.uid }, `metadata`, user.email);
    const token = await user.getIdToken();
    return createUserSession({ request: request, metadata: { 'path': ref.path }, userId: token, remember: true, redirectTo: `/login` })
  } catch (e) {
    console.log("\n Error during signup form submission being logged : \n ");
    console.dir(e)
    const neutronError = new NeutronError(e);
    return json({ type: neutronError.type, message: neutronError.message });
  }
}



export default function Signup() {
  const data = useLoaderData();
  const actionData = useActionData();

  const signupButtonStates = (state: string) => {
    switch (state) {
      case "idle":
        return (<span> Sign Up ...</span>);
      case "submitting":
        return (<span>Creating User...</span>);
      case "loading":
        return (<DefaultSpinner></DefaultSpinner>);
    }
  }

  let submit = useSubmit();
  const transition = useTransition();
  const userNames = data.usernames;
  console.log(userNames)
  let navigate = useNavigate();
  // const [user, loading, error] = useAuthState(auth);

  const IsUsernameAvailable = (username: string) => {
    return userNames.indexOf(username) == -1
  }


  const { handleSubmit, register, trigger, formState: { errors }, control } = useForm();

  const displayName = useWatch({ control, name: 'displayName' })
  const email = useWatch({ control, name: 'email' })
  const password = useWatch({ control, name: 'password' })

  useEffect(() => {
    injectStyle();
    trigger();
    const neutronError = actionData as NeutronError;
    if (neutronError) {
      console.log("ERROR DURING LOGIN")
      console.dir(neutronError);
      toast(<div><h2>{neutronError.message}</h2></div>, { theme: "dark", type: "error" })



    }
    if (transition.type === "actionSubmission") {
      toast(<div><h2>Please verify your email ID</h2></div>, { theme: "dark", type: "success" })
    }
  }, [displayName, email, password, trigger, transition, actionData])


  return (
    <div className="h-screen sm:h-full w-full justify-center bg-bg-primary-dark align-middle p-5 sm:p-10">
      <div className=" flex flex-col items-center justify-center h-full w-full text-center">

        <img
          src={Icon}
          className="h-auto max-h-28 m-10 sm:mt-10 mt-20 mb-5 sm:mb-5 max-w-28 snap-center"
          alt="hi there"
        ></img>
        <div className="bg-bg-primary-dark rounded-lg text-left p-5 sm:w-[1016px]">
          <h1
            className={`text-left sm:ml-0 font-gilroy-black text-white text-[40px]`}
          >
            Sign Up
          </h1>

          <div className=" flex flex-col sm:flex-row items-start space-y-2 sm:space-y-0  w-full justify-between">
            <div className="flex flex-col justify-items-start space-y-2 mt-5 w-full ">
              <form
                className=" space-y-1"
                onSubmit={handleSubmit((data) => {
                  console.log(data.email, data.password, data.displayName);
                  const form = new FormData();
                  form.append('email', data.email);
                  form.append('password', data.password)
                  form.append('displayName', data.displayName)
                  submit(form, { replace: true, method: 'post' })
                })}
              >
                <div className="text-left space-y-1 w-full">
                  <span className=" prose prose-md text-white font-gilroy-black text-[25px]">Username</span>
                  <input  {...register('displayName', {
                    required: 'This field is required', validate: (v) => {
                      return IsUsernameAvailable(v) || 'This username is already taken';
                    }
                  })} type="text" placeholder="e.g: name@example.com" defaultValue={''} className=" transition-all bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 caret-bg-accent-dark focus:outline-none focus:border-accent-dark focus:ring-2 focus:ring-accent-dark text-white active:caret-yellow-400 text-sm rounded-lg placeholder-[#C1C1C1] block w-full h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white font-gilroy-medium " />
                  <div className="w-full h-10 mt-1 text-left">
                    <ErrorMessage errors={errors} name='displayName' render={(data) => {
                      return <span className="text-red-500 pl-1 mt-3 z-10 font-gilroy-black text-left">{data.message}</span>
                    }} />
                  </div>
                </div>
                <div className="text-left space-y-1 w-full">
                  <span className=" prose prose-md text-white font-gilroy-black text-[25px]">Email</span>
                  <input defaultValue={''}  {...register('email', { required: 'This field is required', pattern: { value: ValidationPatterns.emailValidationPattern, message: 'This is not a valid email ID' } })} type="text" placeholder="e.g: name@example.com" className=" transition-all bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 caret-bg-accent-dark focus:outline-none focus:border-accent-dark focus:ring-2 focus:ring-accent-dark text-white active:caret-yellow-400 text-sm rounded-lg placeholder-[#C1C1C1] block w-full h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white font-gilroy-medium" />
                  <div className="w-full h-10 mt-1 text-left">
                    <ErrorMessage errors={errors} name='email' render={(data) => {
                      return <span className="text-red-500 pl-1 mt-3 z-10 font-gilroy-black text-left">{data.message}</span>
                    }} />
                  </div>
                </div>

                <div className="text-left space-y-1 w-full">
                  <span className=" prose prose-md text-white font-gilroy-black text-[25px]">Password</span>
                  <input  {...register('password', { required: 'This field is required', minLength: { value: 8, message: " Password should at least be 8 characters long" } })} type="password" placeholder="Lets keep it hush hush..." className="  transition-all bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 caret-bg-accent-dark focus:outline-none focus:border-accent-dark focus:ring-2 focus:ring-accent-dark text-white active:caret-yellow-400 text-sm rounded-lg placeholder-[#C1C1C1] block w-full h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white font-gilroy-medium " />
                  <div className="w-full h-10 mt-1 text-left">
                    <ErrorMessage errors={errors} name='password' render={(data) => {
                      return <span className="text-red-500 pl-1 mt-3 z-10 font-gilroy-black text-left">{data.message}</span>
                    }} />
                  </div>
                </div>
                <div className="flex flex-row justify-start">
                  <button
                    className="w-40 rounded-lg mt-2 self-start  bg-accent-dark p-3 border-2 border-transparent active:bg-amber-300 outline-none focus:ring-1 focus:ring-white focus:border-white hover:border-white hover:ring-white text-black font-gilroy-black font-[18px] transition-all"
                    type="submit"
                  >
                    {signupButtonStates(transition.state)}
                  </button>
                </div>

              </form>
              <Link to="/login" className="hover:underline decoration-white"><span className="text-white">Already have an account? <span className="font-gilroy-black ">Log In </span></span></Link>
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
                transition={{ repeat: Infinity, duration: 4, ease: "circInOut" }}

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


