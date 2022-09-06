import React from 'react';
import { useLocation, useMatches } from '@remix-run/react';
import {
  LinksFunction,
  LoaderFunction,
  MetaFunction,
  redirect,
} from "@remix-run/node";
import Icon from "~/assets/images/iconFull.svg";
import ErrorImage from '~/assets/images/ErrorImage.svg';

import DefaultSpinner from "./components/layout/DefaultSpinner";
import tailwindStylesheetUrl from "./styles/tailwind.css";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigate,
  useLoaderData,
} from "@remix-run/react";
import { useEffect } from "react";
import { env } from 'process';
let isMount = true;

export const links: LinksFunction = () => {
  return [{ rel: 'manifest', href: '/resources/manifest.webmanifest' }, { rel: "stylesheet", href: tailwindStylesheetUrl }];
};
export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Neutron",
  viewport: "width=device-width,initial-scale=1",
});
export const loader: LoaderFunction = async ({ request }) => {
  return json({
    ENV: {
      NODE_ENV: env.NODE_ENV,
      // PAYOUTS_TEST_CLIENT_ID: "CF129414CB1AVAM7ILBNF68P879G",
      // PAYOUTS_TEST_CLIENT_SECRET: "0cf612cee0fc074d6f7306d7da05e42bd302ab14",
      // PAYOUTS_TEST_GET_BENFICIARY_ENDPOINT:
      //   "https://payout-gamma.cashfree.com/payout/v1/getBeneficiary/",
      // PAYOUTS_TEST_ADD_BENEFICIARY_ENDPOINT:
      //   "https://payout-gamma.cashfree.com/payout/v1/addBeneficiary",
      // PAYOUTS_TEST_AUTHORIZE_ENDPOINT:
      //   "https://payout-gamma.cashfree.com/payout/v1/authorize",
      // PAYOUTS_TEST_REQUEST_TRANSFER_ENDPOINT:
      //   "https://payout-gamma.cashfree.com/payout/v1/requestTransfer",
      // PAYOUTS_PROD_CLIENT_ID: "CF178581CB767HVOSD88JSNK6VEG",
      // PAYOUTS_PROD_CLIENT_SECRET: "bc040974304c2b6bb91174370ae10d7373088594",
      // PAYOUTS_PROD_GET_BENFICIARY_ENDPOINT:
      //   "https://payout-api.cashfree.com/payout/v1/getBeneficiary/",
      // PAYOUTS_PROD_ADD_BENEFICIARY_ENDPOINT:
      //   "https://payout-api.cashfree.com/payout/v1/addBeneficiary",
      // PAYOUTS_PROD_AUTHORIZE_ENDPOINT:
      //   "https://payout-api.cashfree.com/payout/v1/authorize",
      // PAYOUTS_PROD_REQUEST_TRANSFER_ENDPOINT:
      //   "https://payout-api.cashfree.com/payout/v1/requestTransfer",
      // PAYIN_TEST_APP_ID: "12941442dc7e98be1c7fa15822414921",
      // PAYIN_TEST_APP_SECRET: "TEST9b544dc2c2625964029bd3e5869cff5e6a120ac1",
      // PAYIN_PROD_APP_ID: "1785815d5ddb6cf020fdaaf47a185871",
      // PAYIN_PROD_APP_SECRET: "4e287021ea5b09522df4324556d21db45071ab83",
    },
  });
};
export function ErrorBoundary({ error }) {
  // let navigate = useNavigate();
  // useEffect(() => {
  //   setTimeout(() => {
  //     navigate("/");
  //   }, 2000);
  // });
  let location = useLocation();
  let matches = useMatches();

  React.useEffect(() => {
    let mounted = isMount;
    isMount = false;
    if ("serviceWorker" in navigator) {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller?.postMessage({
          type: "REMIX_NAVIGATION",
          isMount: mounted,
          location,
          matches,
          manifest: window.__remixManifest,
        });
      } else {
        let listener = async () => {
          await navigator.serviceWorker.ready;
          navigator.serviceWorker.controller?.postMessage({
            type: "REMIX_NAVIGATION",
            isMount: mounted,
            location,
            matches,
            manifest: window.__remixManifest,
          });
        };
        navigator.serviceWorker.addEventListener("controllerchange", listener);
        return () => {
          navigator.serviceWorker.removeEventListener(
            "controllerchange",
            listener
          );
        };
      }
    }
  }, [location, matches]);

  return (
    <html className="scroll-smooth">

      <head>

        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body className="justify-center bg-bg-primary-dark align-middle">

        <div className="h-screen w-full flex flex-col justify-center bg-bg-primary-dark align-middle">

          <div className="flex flex-row justify-center space-x-10 ">

            <div
              id="error-details"
              className="flex sm:flex-col w-full sm:w-[500px] p-10 text-left justify-between"
            >

              <div>

                <h1 className="prose prose-lg text-white font-gilroy-black text-[40px]">

                  An Error has Occured!
                </h1>
                <h2 className="prose prose-md text-white font-gilroy-medium text-[20px]">{`${error}`}</h2>
              </div>
              <DefaultSpinner size="large"></DefaultSpinner>
              <span className="font-gilroy-regular prose prose-sm text-[14px] text-gray-300 mt-8">

                If you believe you shouldn't be seeing this screen, please get
                in touch with us at
                <span className="text-white font-gilroy-bold">
                  connect@neutron.money
                </span>
              </span>
            </div>
            <div id="error-image">
              <img src={ErrorImage} className="w-full h-full" alt="Error" />

            </div>
          </div>
        </div>
        <Scripts />
      </body>
    </html>
  );
}
export default function App() {
  const data = useLoaderData();
  return (
    <html lang="en">

      <head>

        <Meta /> <Links />
      </head>
      <body className="font-gilroy-regular bg-bg-primary-dark">

        <Outlet />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(data.ENV)}`,
          }}
        />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
