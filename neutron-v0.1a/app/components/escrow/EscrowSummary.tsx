import { motion } from 'framer-motion';
import * as React from 'react';
import { primaryGradientDark } from '~/utils/neutron-theme-extensions';



export default function EscrowSummary() {


    return (<motion.div variants={{ collapsed: { scale: 0.9, opacity:0 }, open: { scale: 1, opacity:1 } }}
        transition={{ duration: 0.2 }} className={`bg-bg-primary-dark m-4 rounded-lg w-auto p-3 h-auto text-center`}>
        <motion.div className="border-solid border-2 border-white h-auto rounded-xl mt-10 text-left p-4">
            <motion.h2 className='prose prose-lg text-white'>Released Funds</motion.h2>
            <motion.h1 className="prose prose-lg text-white text-right"> $3402.00</motion.h1>
        </motion.div>
        <motion.div className={`${primaryGradientDark}  h-24 rounded-xl mt-4 text-left p-4`}>
            <motion.h2 className='prose prose-lg text-white'>Committed Funds</motion.h2>
            <motion.h1 className="prose prose-lg text-white text-right"> $2000.00</motion.h1>
        </motion.div>
    </motion.div>)

}