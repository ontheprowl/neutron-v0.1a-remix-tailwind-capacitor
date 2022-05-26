import { Form, Link, useActionData, useNavigate } from "@remix-run/react";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase/neutron-config";
import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { login, logout } from "~/firebase/firebase-utils";
import { Response } from "@remix-run/node";
import { json } from "remix-utils";
import React from "react";
import { Auth } from "firebase/auth";
import { useForm } from "react-hook-form";

export default function Home() {
  let navigate = useNavigate();
  const [user, loading, error] = useAuthState(auth);

  const { register, handleSubmit } = useForm();
  
  React.useEffect(() => {
    if (!loading && user) {
      setTimeout(() => {
        navigate("/session");
      }, 1000);
    }
  });

  return (
    <div className="h-[100vh] w-auto justify-center bg-bg-primary-dark align-middle">
      <div className="ml-4 flex flex-col items-center justify-center pt-6 text-center">
        <img
          src="icon.svg"
          className="h-20 w-20 snap-center"
          alt="hi there"
        ></img>
        <h1
          className={`mt-10 bg-gradient-to-tr from-yellow-500 via-orange-100 to-yellow-700 bg-clip-text text-transparent`}
        >
          Welcome to Neutron!
        </h1>
        {!user ? (
          <div className="mt-2 flex flex-col items-center space-y-4 p-10">
            <form
              className="flex flex-col items-center space-y-4"
              onSubmit={handleSubmit((data) => {
                console.log(data.email, data.password);
                login(auth, data.email, data.password);
              })}
            >
              <input
                placeholder="Username/Email"
                {...register("email")}
                className="rounded-lg border-2 border-solid bg-transparent p-3 text-center text-white placeholder-white transition-all focus:border-4 focus:border-white"
                type="text"
              />
              <input
                placeholder="Password"
                {...register("password")}
                className="rounded-lg border-2 border-solid bg-transparent p-3 text-center text-white placeholder-white transition-all focus:border-4 focus:border-white"
                type="password"
              />
              <button
                className="w-40 rounded-lg bg-accent-dark p-3 text-white transition-all hover:scale-105"
                type="submit"
              >
                Login/Signup
              </button>
            </form>
            <button
              className="w-40 rounded-lg bg-accent-dark p-3 text-white transition-all hover:scale-105"
              onClick={() => logout(auth)}
            >
              Logout
            </button>
          </div>
        ) : (
          <p>Logged in user detected! Redirecting to your dashboard...</p>
        )}
      </div>
    </div>
  );
}
