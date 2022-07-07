import { motion } from 'framer-motion';
import * as React from 'react';
import { primaryGradientDark } from '~/utils/neutron-theme-extensions';
import ContractsIcon from '../icons/ContractsIcon';
import PeopleIcon from '../icons/PeopleIcon';


export default function ContractStats({clients, contracts} : {clients: number, contracts:number }) {

    return (
        <motion.div className=" bg-bg-secondary-dark translate-y-[-20px] sm:translate-y-0 sm:m-4 rounded-xl w-auto p-3 h-auto items-center">
            <motion.div className="border-solid border-2 flex flex-row border-white h-auto rounded-xl mt-10 text-left p-4 justify-between">
                <motion.div className=" flex flex-col">
                    <motion.h2 className='prose prose-sm text-white'>Clients</motion.h2>
                    <motion.h1 className="prose prose-lg text-white"> {clients}</motion.h1>
                </motion.div>
                <PeopleIcon className="w-10 h-10 hover:scale-110 transition-transform"></PeopleIcon>

            </motion.div>
            <motion.div className={`border-solid border-2 flex flex-row items-center  h-24 rounded-xl mt-4 text-left p-4 justify-between`}>
                <motion.div className=" flex flex-col">
                    <motion.h2 className='prose prose-sm text-white'>Contracts</motion.h2>
                    <motion.h1 className="prose prose-lg text-white text-left">{contracts}</motion.h1>
                </motion.div>
                <ContractsIcon className="w-10 h-10 hover:scale-110 transition-transform"></ContractsIcon>
            </motion.div>
        </motion.div>)
}