import type {
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigate,
} from "@remix-run/react";
import { useEffect } from "react";


import Icon from "~/assets/images/iconFull.svg"

import tailwindStylesheetUrl from "./styles/tailwind.css";
// import { getUser } from "./session.server";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: tailwindStylesheetUrl }];
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Neutron",
  viewport: "width=device-width,initial-scale=1",
});

// type LoaderData = {
//   user: Awaited<ReturnType<typeof getUser>>;
// };

// export const loader: LoaderFunction = async ({ request }) => {
//   return json<LoaderData>({
//     user: await getUser(request),
//   });
// };

export function ErrorBoundary({ error }) {
  console.error(error);

  let navigate = useNavigate();


  // useEffect(() => {
  //   setTimeout(() => {
  //     navigate('/')
  //   }, 2000)
  // })


  return (
    <html>
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body>
        <div className="h-full w-full justify-center bg-bg-primary-dark align-middle">
          <div className=" h-screen flex flex-col items-center p-5 sm:p-0 justify-center text-center">
            <img
              src={Icon}
              className="h-auto max-h-28 m-10 max-w-28 snap-center"
              alt="hi there"
            ></img>
            <div className="prose prose-lg bg-bg-secondary-dark  rounded-lg border-2 border-accent-dark sm:w-[896px] h-auto">
              <h1 className="prose prose-md mt-5 text-white">Oh No!</h1>


              <div className="flex flex-col sm:flex-row items-center space-y-4 p-5 w-full justify-evenly">
                <div className=" w-full prose prose-lg text-white">
                  <h1 className="prose prose-md text-white">{"We're very sorry that happened! :'('"}</h1>
                  <h2 className="prose prose-lg text-white">{`${error}`}</h2>
                </div>

              </div>

            </div>

          </div>
        </div>
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <html lang="en" className="h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full font-gilroy-regular">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
