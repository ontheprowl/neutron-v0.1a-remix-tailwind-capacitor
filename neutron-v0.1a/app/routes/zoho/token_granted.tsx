import { ActionFunction, LoaderFunction, json } from "@remix-run/server-runtime";


export const loader: LoaderFunction = async ({request, params}) => {
    console.dir("Request received at token_granted loader")

    console.log(await request.json())
    return null
}