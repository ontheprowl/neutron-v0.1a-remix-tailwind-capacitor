import { Form, Link, useActionData, useLoaderData, useNavigate, useSubmit } from "@remix-run/react";

import { useAuthState } from "react-firebase-hooks/auth";
import { adminAuth, auth, googleProvider } from "../firebase/neutron-config.server";
import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { login, logout } from "~/firebase/firebase-utils";
import { Response } from "@remix-run/node";
import { json } from "remix-utils";
import React, { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import Icon from "~/assets/images/iconFull.svg"
import { generateAuthUrl, authorizeAndExecute } from "~/firebase/gapis-config.server";
import useWindowDimensions from "~/hooks/useWindowDimensions";
import { createUserWithEmailAndPassword, getRedirectResult, GoogleAuthProvider, signInWithEmailAndPassword, signInWithRedirect, updateProfile, User } from "firebase/auth";
import { signUp } from "~/models/user.server";
import { createUserSession, requireUser } from "~/session.server";
import { addFirestoreDocFromData, getFirebaseDocs, setFirestoreDocFromData } from "~/firebase/queries.server";
import { DEFAULT_USER_STATE } from "~/models/user";
import { ErrorMessage } from "@hookform/error-message";
import { ValidationPatterns } from "~/utils/utils";

export async function loader({ request }: { request: Request }) {

  const session = await requireUser(request);

  if (session) {
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

  const data = await request.formData();
  const displayName: string = data.get('displayName')
  const email: string = data.get('email');
  const password: string = data.get('password');
  const { user } = await signUp(email, password);
  await updateProfile(user, {
    displayName: displayName,
    photoURL:''
  })
  const userUIDRef = await setFirestoreDocFromData({ uid: user.uid }, 'userUIDS', `${displayName}`)

  const ref = await setFirestoreDocFromData({ ...DEFAULT_USER_STATE, email: user.email, id: user.uid, displayName: user.displayName }, `metadata`, user.uid);
  // const uidMapRef = await setFirestoreDocFromData({ uid: user.uid }, `metadata`, user.email);
  const token = await user.getIdToken();
  return createUserSession({ request: request, metadata: { 'path': ref.path }, userId: token, remember: true, redirectTo: `/${displayName}/profile` })
}

export default function Signup() {
  const data = useLoaderData();

  let submit = useSubmit();
  const parsedData = JSON.parse(data);
  console.log(parsedData)
  const userNames = parsedData.usernames;
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
    trigger()

  }, [displayName, email, password, trigger])



  return (
    <div className="h-full w-full justify-center bg-bg-primary-dark align-middle">
      <div className=" flex flex-col items-center justify-center h-full text-center">
        <img
          src={Icon}
          className="h-auto max-h-28 m-10 max-w-28 snap-center"
          alt="hi there"
        ></img>
        <div className="bg-bg-secondary-dark rounded-lg border-2 border-accent-dark sm:w-[896px]">
          <h1
            className={`mt-5 bg-gradient-to-tr from-yellow-500 via-orange-100 to-yellow-700 bg-clip-text text-transparent text-center sm:text-left sm:ml-5 font-gilroy-bold`}
          >
            Sign Up
          </h1>

          <div className="mt-2 flex flex-col sm:flex-row items-center space-y-4 p-10 w-full justify-evenly">
            <div className=" w-full">
              <form
                className="flex flex-col items-center space-y-4"
                onSubmit={handleSubmit((data) => {
                  console.log(data.email, data.password, data.displayName);
                  const form = new FormData();
                  form.append('email', data.email);
                  form.append('password', data.password)
                  form.append('displayName', data.displayName)
                  submit(form, { replace: true, method: 'post' })
                })}
              >
                <div className="sm:text-center space-y-3 w-full">
                  <span className=" prose prose-md text-white">Username</span>
                  <input  {...register('displayName', {
                    required: 'This field is required', validate: (v) => {
                      return IsUsernameAvailable(v) || 'This username is already taken';
                    }
                  })} type="text" placeholder="e.g: name@example.com" defaultValue={''} className=" bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-full h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " />
                  <div className="w-full h-10 mt-3 text-left">
                    <ErrorMessage errors={errors} name='displayName' render={(data) => {
                      return <span className="text-red-500 p-2 m-3 z-10">{data.message}</span>
                    }} />
                  </div>
                </div>
                <div className="sm:text-center space-y-3 w-full">
                  <span className=" prose prose-md text-white">Email</span>
                  <input defaultValue={''}  {...register('email', { required: 'This field is required', pattern: { value: ValidationPatterns.emailValidationPattern, message: 'This is not a valid email ID' } })} type="text" placeholder="e.g: name@example.com" className=" bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-full h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " />
                  <div className="w-full h-10 mt-3 text-left">
                    <ErrorMessage errors={errors} name='email' render={(data) => {
                      return <span className="text-red-500 p-2 m-3 z-10">{data.message}</span>
                    }} />
                  </div>
                </div>

                <div className="sm:text-center space-y-3 w-full">
                  <span className=" prose prose-md text-white">Password</span>
                  <input  {...register('password', { required: 'This field is required', minLength: { value: 8, message: " Password should at least be 8 characters long" } })} type="password" placeholder="Lets keep it hush hush..." className=" bg-[#4A4A4A] pt-3 pb-3 pl-4 pr-4 border-gray-300 text-white text-sm rounded-lg placeholder-white block w-full h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-white dark:text-white " />
                  <div className="w-full h-10 mt-3 text-left">
                    <ErrorMessage errors={errors} name='password' render={(data) => {
                      return <span className="text-red-500 p-2 m-3 z-10">{data.message}</span>
                    }} />
                  </div>
                </div>


                <button
                  className="w-40 rounded-lg bg-accent-dark p-3 text-white transition-all hover:scale-105"
                  type="submit"
                >
                  Login
                </button>
              </form>
              <button
                className="w-40 mt-5 rounded-lg bg-accent-dark p-3 text-white transition-all hover:scale-105"
              // onClick={() => logout(auth)}
              >
                Logout
              </button>
            </div>
            <div className="w-auto ml-10 h-0.5 sm:h-[250px] bg-gray-500 sm:w-0.5" ></div>
            <div className="w-full">
              <button className="pointer-auto hover:scale-105 transition-all" onClick={async () => {

                // signInWithRedirect(auth, googleProvider);

                // As this API can be used for sign-in, linking and reauthentication,
                // check the operationType to determine what triggered this redirect
                // operation.
                // const operationType = result.operationType;

              }}>

                <div className="rounded-xl bg-white p-3 flex flex-row space-x-5 w-auto justify-between ">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="24" height="24" fill="white" />
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M23.04 12.2615C23.04 11.446 22.9668 10.6619 22.8309 9.90918H12V14.3576H18.1891C17.9225 15.7951 17.1123 17.013 15.8943 17.8285V20.714H19.6109C21.7855 18.7119 23.04 15.7637 23.04 12.2615Z" fill="#4285F4" />
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M12 23.5001C15.105 23.5001 17.7081 22.4703 19.6109 20.7139L15.8943 17.8285C14.8645 18.5185 13.5472 18.9262 12 18.9262C9.00474 18.9262 6.46951 16.9032 5.56519 14.1851H1.72314V17.1646C3.61542 20.923 7.50451 23.5001 12 23.5001Z" fill="#34A853" />
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M5.56523 14.185C5.33523 13.495 5.20455 12.7579 5.20455 12C5.20455 11.242 5.33523 10.505 5.56523 9.81499V6.83545H1.72318C0.944318 8.38795 0.5 10.1443 0.5 12C0.5 13.8557 0.944318 15.612 1.72318 17.1645L5.56523 14.185Z" fill="#FBBC05" />
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M12 5.07386C13.6884 5.07386 15.2043 5.65409 16.3961 6.79364L19.6945 3.49523C17.7029 1.63955 15.0997 0.5 12 0.5C7.50451 0.5 3.61542 3.07705 1.72314 6.83545L5.56519 9.815C6.46951 7.09682 9.00474 5.07386 12 5.07386Z" fill="#EA4335" />
                  </svg>

                  <h1>Log In With Google</h1>
                </div>
              </button>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}


