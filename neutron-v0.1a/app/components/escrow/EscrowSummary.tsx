import * as React from 'react';
import { primaryGradientDark } from '~/utils/neutron-theme-extensions';



export default function EscrowSummary() {

    return (<div className="bg-bg-primary-dark m-4 rounded-lg w-auto p-3 h-auto text-center">
        <h2 className="prose prose-lg text-white"> Escrow Account</h2>
        <div className="border-solid border-2 border-white h-auto rounded-xl mt-10 text-left p-4">
            <h2 className='prose prose-lg text-white'>Released Funds</h2>
            <h1 className="prose prose-lg text-white text-right"> $5402.00</h1>
        </div>
        <div className={`${primaryGradientDark}  h-24 rounded-xl mt-4 text-left p-4`}>
            <h2 className='prose prose-lg text-white'>Total Funds</h2>
            <h1 className="prose prose-lg text-white text-right"> $5402.00</h1>
        </div>
    </div>)

}