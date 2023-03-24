import { useFetcher, useSubmit } from "@remix-run/react"
import ZohoLogo from '~/assets/images/zoho_logo.svg'



export default function ZohoIntegrationComponent({ }) {


    const fetcher = useFetcher();



    return (<div className="flex flex-col items-center space-y-4 m-5">
        <h1 className="font-gilroy-bold text-lg">The Zoho Integration requires you to log-in to your Zoho account and grant permissions to Neutron to access your data</h1>
        <button type="button" className="w-auto max-w-fit bg-primary-base hover:bg-primary-dark transition-all p-2 rounded-xl" onClick={() => {
            fetcher.submit(null, { method: 'post', action: '/integrations/zoho/consent' })
        }}>
            <div className="flex flex-row items-center space-x-5 ">
                <img src={ZohoLogo} className="h-5" alt="Zoho Logo"/>
                <h1 className="text-white">Authorize Zoho</h1>
            </div>
        </button>
    </div>)


}

