import { Link, useActionData, useLoaderData, useNavigate, useSubmit, useTransition } from "@remix-run/react";

import { json } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { useEffect } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import Icon from "~/assets/images/iconFull.svg"
import { getAuth, sendEmailVerification, updateProfile } from "firebase/auth";
import { signUp } from "~/models/user.server";
import { createUserSession, requireUser } from "~/session.server";
import { getFirebaseDocs, setFirestoreDocFromData } from "~/firebase/queries.server";
import { DEFAULT_USER_STATE } from "~/models/user";
import { ErrorMessage } from "@hookform/error-message";
import { ValidationPatterns } from "~/utils/utils";
import { toast, ToastContainer } from "react-toastify";
import { NeutronError } from "~/logging/NeutronError";
import { injectStyle } from "react-toastify/dist/inject-style";
import DefaultSpinner from "~/components/layout/DefaultSpinner";
import AuthPagesSidePanel from '~/assets/images/AuthPageSidePanel2.svg'

import { env } from "process";
import MandatoryAsterisk from "~/components/layout/MandatoryAsterisk";
import { juneClient, trackJuneEvent } from "~/analytics/june-config.server";
import { NeutronToastContainer, emitToast } from "~/utils/toasts/NeutronToastContainer";
import NucleiTextInput from "~/components/inputs/fields/NucleiTextInput";
import { prependBaseURLForEnvironment } from "~/utils/utils.server";

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
    const displayName: string = data.get('displayName') as string
    const email: string = data.get('email') as string;
    const password: string = data.get('password') as string;
    const { user } = await signUp(email, password);
    await updateProfile(user, {
      displayName: 'newUser',
      photoURL: '',
    })

    await sendEmailVerification(user, { url: prependBaseURLForEnvironment('/auth/verification/google') });


    // const userUIDRef = await setFirestoreDocFromData({ uid: user.uid, email: user.email, profileComplete: false }, 'userUIDS', `${displayName}`)

    const ref = await setFirestoreDocFromData({
      ...DEFAULT_USER_STATE, email: user.email, id: user.uid, creationTime: user.metadata.creationTime, profileComplete: false
    }, `metadata`, user.uid);

    // const uidMapRef = await setFirestoreDocFromData({ uid: user.uid }, `metadata`, user.email);
    const token = await user.getIdToken();

    trackJuneEvent(user.uid, 'User Sign Up', { ...data }, 'userEvents');
    return createUserSession({ request: request, metadata: { 'path': ref.path }, userId: token, remember: true, redirectTo: `/checkEmail` })
  } catch (e) {
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
      case "loading":
        return (<span> Sign Up</span>);
      case "submitting":
        return (<DefaultSpinner></DefaultSpinner>);
    }
  }
  const transition = useTransition();
  let submit = useSubmit();

  const userNames = data.usernames;
  let navigate = useNavigate();
  // const [user, loading, error] = useAuthState(auth);

  const IsUsernameAvailable = (username: string) => {
    return userNames.indexOf(username) == -1
  }


  const methods = useForm();

  const control = methods.control;
  const trigger = methods.trigger;
  const password = useWatch({ control, name: 'password' });
  const passwordConfirmation = useWatch({ control, name: 'passwordConfirmation' });

  useEffect(() => {
    injectStyle();
    trigger();

  }, [password, passwordConfirmation, transition, trigger])


  useEffect(() => {
    const neutronError = actionData as NeutronError;
    if (neutronError) {
      emitToast(neutronError.message, null, "error");
    }
  }, [actionData])

  return (
    <div className=" sm:h-screen w-full justify-center bg-white align-middle">
      <div className=" flex flex-row-reverse h-full w-full text-center">
        <div id="left-panel" className="flex flex-col w-full sm:basis-3/5  h-full justify-center sm:justify-start sm:items-start mt-20 sm:mt-0 p-8">
          <div id="form-container" className=" w-full h-full flex flex-row justify-center mt-10 sm:mt-0">
            <div className="flex flex-col w-full h-full justify-center">
              <div className="bg-white rounded-lg text-left self-center p-2 w-full sm:w-[500px]">
                <h1
                  className={`text-left sm:ml-0 font-gilroy-bold text-black text-[30px]`}
                >
                  Sign Up
                </h1>
                <h2 className="prose prose-sm font-gilroy-medium text-secondary-text">An AR revolution awaits</h2>


                <div className=" flex flex-col sm:flex-row items-start space-y-2 sm:space-y-0  w-full justify-between">
                  <div className="flex flex-col justify-items-start space-y-2 mt-2 w-full">
                    <FormProvider {...methods}>
                      <form

                        onSubmit={methods.handleSubmit((data) => {
                          const form = new FormData();
                          form.append('email', data.email);
                          form.append('password', data.password)
                          form.append('displayName', data.displayName)
                          submit(form, { replace: true, method: 'post' })
                        })}
                      >
                        <NucleiTextInput name="email" label="Email" placeholder="e.g: name@example.com" options={{ required: true, pattern: { value: ValidationPatterns.emailValidationPattern, message: 'This is not a valid email ID' } }} />
                        <NucleiTextInput name="password" type="password" label="Password" placeholder="Enter Password" options={{ required: true, minLength: { value: 8, message: " Password should at least be 8 characters" } }} />
                        <NucleiTextInput name="passwordConfirmation" type="password" label="Confirm Password" placeholder="Re-enter password" options={{ required: true, validate: (v) => v == password || "Passwords do not match" }} />
                        <div className="flex flex-col sm:flex-row  items-center justify-start space-y-4 sm:space-y-0 sm:space-x-4 mt-3">
                          <button
                            className="w-full basis-1/2 rounded-lg  bg-[#6950ba] p-3 border-2 border-transparent active:bg-primary-dark focus:bg-primary-dark hover:bg-primary-dark  outline-none focus:ring-1 focus:ring-white focus:border-white hover:border-white hover:ring-white text-white font-gilroy-medium font-[18px] transition-all"
                            type="submit"
                          >
                            {signupButtonStates(transition.state)}
                          </button>
                        </div>

                      </form>
                    </FormProvider>

                    <div className="hover:underline font-gilroy-medium  w-full text-center decoration-white self-start mt-4 pt-4"><span className="text-black">Already have an account?</span> <Link to="/login" className=" text-[#6950ba] hover:underline hover:decoration-[#6950ba]">Log In </Link></div>

                    <div className="flex flex-row w-full">


                    </div>
                  </div>

                </div>

              </div>
            </div>
          </div>

        </div>
        <div id="right-panel" className="hidden sm:flex sm:flex-col w-full basis-2/5">
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


