import { Link, useActionData, useLoaderData, useSubmit, useTransition } from "@remix-run/react";

import { firestore } from "../firebase/neutron-config.server";
import { json } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import React from "react";

import { injectStyle } from 'react-toastify/dist/inject-style'
import { FormProvider, useForm } from "react-hook-form";
import { getAuth } from "firebase/auth";
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

  let session;

  //* If the user's session has expired ( due to app redeployment or restart ,) delete the user's session and redirect them to login
  try {
    session = await requireUser(request);
  }
  catch (e: any) {
    return logout(request)
  }


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
    const password: string = data.get('password') as string;
    const { user } = await signIn(email, password);
    const ref = doc(firestore, '/metadata/', user.uid);
    const metadata = await getSingleDoc(`/metadata/${user.uid}`)
    const profileComplete = Boolean(metadata?.profileComplete);

    const firstLogin = Boolean(metadata?.firstLogin);



    const token = await user.getIdToken();

    if (user.emailVerified || email == "test@test.com" || email == "demo@neutron-demo.com" || email == "tester@neutronalpha.in") {
      //* Send Welcome Email on First Login (SIB Template #13)
      if (!firstLogin && user?.displayName) {
        // const emailResult = await sendTeamEmail(email, user?.displayName, { "FIRSTNAME": user?.displayName }, 13);
        const updateLoginMetadataRef = await updateFirestoreDocFromData({ firstLogin: true }, 'metadata', `${user.uid}`);

      }
      // * Identify user login event on June 


      trackJuneEvent(user.uid, 'User Logged In', { ...user.metadata, ...metadata }, 'userEvents');


      // // * First test redis caching
      // const result = await cacheObject(`metadata/${user.uid}`, { ...user.metadata, ...metadata })
      // if (result) {
      //   console.log("Caching to Redis was successful...")
      // }


      // ? Can we refactor creating the User Session and defer to after onboarding? Create a branching path here.
      return createUserSession({ request: request, metadata: { path: ref.path }, userId: token, remember: true, redirectTo: profileComplete ? `/dashboard` : `/onboarding/integrations` })
    } else {
      throw new Error("neutron-auth/email-not-verified");
    }
  } catch (e: any) {
    console.log(e)
    const neutronError = new NeutronError(e);
    return json({ type: neutronError.type, message: neutronError.message });
  }

}



export default function Login() {


  const loginButtonStates = (state: string) => {
    switch (state) {
      case "idle":
      case "loading":
        return (<span>Log In</span>)
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

  const register = methods.register;
  const handleSubmit = methods.handleSubmit;

  React.useEffect(() => {
    injectStyle();
    const neutronError = actionData as NeutronError;
    if (neutronError) {
      emitToast(neutronError.message, null, "error")

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
                  Login
                </h1>
                <h2 className="prose prose-sm font-gilroy-medium text-[#7D7D7D]">Welcome Back</h2>

                <div className=" flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 text-black  w-full justify-between">
                  <div className="flex flex-col justify-items-start space-y-4 mt-5 w-full ">
                    <FormProvider {...methods}>
                      <form
                        className=" space-y-6"
                        onSubmit={handleSubmit((data) => {

                          const form = new FormData();
                          form.append('email', data.email);
                          form.append('password', data.password)
                          submit(form, { replace: true, method: 'post' })
                        })}
                      >
                        <NucleiTextInput name={"email"} label={"Email"} placeholder="e.g : name@example.com" />
                        <NucleiTextInput name={"password"} type="password" label={"Password"} placeholder="Enter Password" />

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

                    <div className="flex flex-row w-full">


                    </div>
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

    </div>
  );
}


