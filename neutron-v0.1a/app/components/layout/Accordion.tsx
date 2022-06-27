import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { primaryGradientDark } from "~/utils/neutron-theme-extensions";

export default function Accordion({ expanded, setExpanded, content }) {
    const isOpen = expanded;
    // By using `AnimatePresence` to mount and unmount the contents, we can animate
    // them in and out while also only rendering the contents of open accordions
    return (
        <motion.div
            className={`${primaryGradientDark}  h-auto rounded-xl mt-4 text-left p-4`} initial={false}
            onClick={() => setExpanded(isOpen ? false : true)}
        >
            <motion.div className={`rounded-xl text-left p-4`}>
                <motion.h2 className='prose prose-lg text-white'>Total Funds</motion.h2>
                <motion.h1 className="prose prose-lg text-white text-right"> $5402.00</motion.h1>
            </motion.div>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        key="content"
                        initial="collapsed"
                        animate="open"
                        exit="collapsed"
                        variants={{
                            open: { opacity: 1, height: "auto" },
                            collapsed: { opacity: 0, height: 0, transition: {
                                when: "afterChildren",
                              },}
                        }}
                        transition={{ duration: 0.2}}
                    >
                        {content}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div >

    );
};
