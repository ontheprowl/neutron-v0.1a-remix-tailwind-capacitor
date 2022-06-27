import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";
import { ContractDataStore } from "~/stores/ContractStores";
import { primaryGradientDark } from "~/utils/neutron-theme-extensions";





export default function ContractProcessStepper() {

    const controls = useAnimation();

    const stage = ContractDataStore.useState(s => s.stage);
    console.log(stage)



    useEffect(() => {
        controls.start((i) => {
            switch (i[1]) {
                case 'h2':
                    return i[0] <= stage ? { color: '#FFFFFF' } : { color: '#9ca3af' };
                case 'hr':
                    return i[0] <= stage ? {
                        borderColor: '#8364E8',
                    } : {
                        borderColor: '#9ca3af'
                    };
                case 'div':
                    return i[0] <= stage ? {
                        backgroundColor: '#8364E8',
                        color: "#FFFFFF"
                    } : {
                        backgroundColor: '#9ca3af',
                        color: '#000000'
                    }
            }
            return { opacity: 100 }

        })

    });




    return (<motion.div id="contract-process-stepper" className="flex flex-row m-6 items-start">
        <motion.div layout className="space-y-3">
            <motion.div className={`h-9 w-9 bg-[#8364E8] p-2 text-center rounded-full text-white transition-all`}>{stage > 0 ? '✓' : '1'}</motion.div>
            <motion.h2 className="prose prose-md text-white">Client Details</motion.h2>
        </motion.div>
        <motion.hr custom={[1, 'hr']} animate={controls} className="w-full m-5 border-solid"></motion.hr>
        <motion.div layout className="space-y-3">
            <motion.div custom={[1, 'div']} animate={controls} className={`h-9 w-9 bg-gray-400 text-center rounded-full p-2 text-black transition-all`}>{stage > 1 ? '✓' : '2'}</motion.div>
            <motion.h2 custom={[1, 'h2']} animate={controls} className="prose prose-md text-gray-400 ">Scope of Work</motion.h2>
        </motion.div>
        <motion.hr custom={[2, 'hr']} animate={controls} className="w-full m-5 border-solid"></motion.hr>
        <motion.div className="space-y-3">
            <motion.div custom={[2, 'div']} animate={controls} className={`h-9 w-9 bg-gray-400 text-center rounded-full p-2 text-black transition-all`}>{stage > 2 ? '✓' : '3'}</motion.div>
            <motion.h2 custom={[2, 'h2']} animate={controls} className="prose prose-md text-gray-400 ">Payment & Milestones</motion.h2>
        </motion.div>
        <motion.hr custom={[3, 'hr']} animate={controls} className="w-full m-5 border-solid"></motion.hr>
        <motion.div className="space-y-3">
            <motion.div custom={[3, 'div']} animate={controls} className={`h-9 w-9 bg-gray-400 text-center rounded-full p-2 text-black transition-all`}>{stage > 3 ? '✓' : '4'}</motion.div>
            <motion.h2 custom={[3, 'h2']} animate={controls} className="prose prose-md text-gray-400 ">Contract Draft</motion.h2>
        </motion.div>
        <motion.hr custom={[4, 'hr']} animate={controls} className="w-full m-5 border-solid"></motion.hr>
        <motion.div className="space-y-3">
            <motion.div custom={[4, 'div']} animate={controls} className={`h-9 w-9 bg-gray-400 text-center rounded-full p-2 text-black transition-all`}>{stage > 4 ? '✓' : '5'}</motion.div>
            <motion.h2 custom={[4, 'h2']} animate={controls} className="prose prose-md text-gray-400 ">Publish</motion.h2>
        </motion.div>
    </motion.div>);
}