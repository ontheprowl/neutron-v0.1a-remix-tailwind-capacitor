
import { motion, useAnimation } from 'framer-motion';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

const spring = {
    type: "spring",
    stiffness: 700,
    damping: 30
};

const variants = {
    delivery: {
        justifyContent: 'flex-start'
    },
    milestone: {
        justifyContent: 'flex-end'
    }
}



export default function AccentedToggle({name, states } : {name:string, states:{default:string, toggled:string} }) {

    const formMethods = useFormContext();
    const [isOn, setIsOn] = useState(false)

    const toggleSwitch = () => setIsOn(!isOn)

    const spring = {
        type: 'spring',
        stiffness: 700,
        damping: 30,
    }

    return (
        <div onClick={toggleSwitch} className={`flex flex-start w-48 bg-bg-primary-dark border-2 cursor-pointer border-accent-dark rounded-full p-1 whitespace-nowrap ${isOn && 'place-content-end'}`}>

            <motion.div
                className="flex items-center justify-center p-3 rounded-full bg-accent-dark"
                layout
                transition={spring}
            >
                {isOn?`${states.default}`: `${states.toggled}`}
                <input type="checkbox" className='hidden' value={isOn?'true':'false'} {...formMethods.register(name)}></input>
            </motion.div>
            
            
        </div>
    )

    // <div onClick={() => {
    //     setToggle(!toggle);
    //     controls.start("milestone");
    // }}
    //     className='flex flex-row border-2 w-full bg-bg-primary-dark border-accent-dark rounded-full'>

    //     <motion.div layout variants={variants} initial="delivery" animate={controls} transition={spring} className="bg-accent-dark rounded-full p-5 whitespace-nowrap">
    //         Delivery based
    //     </motion.div>
    //     {/* <motion.div layout transition={spring} className='bg-transparent rounded-full p-5 whitespace-nowrap'>
    //         Advance based
    //     </motion.div> */}
    // </div>

}