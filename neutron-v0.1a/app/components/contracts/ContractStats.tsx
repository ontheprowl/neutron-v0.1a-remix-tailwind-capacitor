import * as React from 'react';
import { primaryGradientDark } from '~/utils/neutron-theme-extensions';
import ContractsIcon from '../icons/ContractsIcon';
import PeopleIcon from '../icons/PeopleIcon';


export default function ContractStats() {

    return (
        <div className=" m-4 rounded-lg w-auto p-3 h-auto items-center">
            <div className="border-solid border-2 flex flex-row border-white h-auto rounded-xl mt-10 text-left p-4 justify-between">
                <div className=" flex flex-col">
                    <h2 className='prose prose-sm text-white'>Clients</h2>
                    <h1 className="prose prose-lg text-white"> 22</h1>
                </div>
                <PeopleIcon className="w-10 h-10 hover:scale-110 transition-transform"></PeopleIcon>

            </div>
            <div className={`border-solid border-2 flex flex-row items-center  h-24 rounded-xl mt-4 text-left p-4 justify-between`}>
                <div className=" flex flex-col">
                    <h2 className='prose prose-sm text-white'>Contracts</h2>
                    <h1 className="prose prose-lg text-white text-left">5</h1>
                </div>
                <ContractsIcon className="w-10 h-10 hover:scale-110 transition-transform"></ContractsIcon>
            </div>
        </div>)
}