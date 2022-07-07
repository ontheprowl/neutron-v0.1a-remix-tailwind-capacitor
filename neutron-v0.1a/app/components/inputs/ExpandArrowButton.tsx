import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import React, { useEffect, useState } from "react";
import { getIndex, useFlubber } from "~/utils/use-flubber";


const paths = ["M19.1615 5.23629L17.2865 3.36133L6.64844 13.9994L17.2865 24.6375L19.1615 22.7625L10.4117 13.9994L19.1615 5.23629Z", "M3.40988 6.09L1.99988 7.5L9.99988 15.5L17.9999 7.5L16.5899 6.09L9.99988 12.67L3.40988 6.09Z"]


export default function ExpandArrowButton({ expanded }: { expanded: boolean }) {
    const [pathIndex, setPathIndex] = useState(0);
    const progress = useMotionValue(0);
    const fill = useTransform(progress, paths.map(getIndex), ["#FFFFFF", "#FFFFFF"]);
    const path = useFlubber(progress, paths);



    useEffect(() => {
        const animation = animate(progress, pathIndex, {
            duration: 0.2,
            ease: "easeInOut",
            onComplete: () => {
                if (expanded) {
                    setPathIndex(0);
                } else {
                    setPathIndex(1);
                }
            }
        });

        return ()=> animation.stop()

    })


    return (

        <svg className="h-6 w-6">
            <g>
                <motion.path fill={fill} d={path} />
            </g>
        </svg>
    )

}