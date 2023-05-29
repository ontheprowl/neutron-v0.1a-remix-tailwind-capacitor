import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import type { MouseEventHandler } from "react";
import React, { useEffect, useState } from "react";
import { getIndex, useFlubber } from "~/utils/use-flubber";


const paths = ["M14.59 9.91L16 8.5L8 0.5L-3.8147e-06 8.5L1.41 9.91L8 3.33L14.59 9.91Z", "M3.40988 6.09L1.99988 7.5L9.99988 15.5L17.9999 7.5L16.5899 6.09L9.99988 12.67L3.40988 6.09Z"]



export default function SortButton({ expanded, onClick }: { expanded: boolean, onClick?: MouseEventHandler<HTMLOrSVGElement> }) {
    const [pathIndex, setPathIndex] = useState(1);
    const progress = useMotionValue(0);
    const fill = useTransform(progress, paths.map(getIndex), ["#000000", "#000000"]);
    const path = useFlubber(progress, paths);



    useEffect(() => {
        const animation = animate(progress, pathIndex, {
            duration: 0.1,
            ease: "linear",
            onComplete: () => {
                if (expanded) {
                    setPathIndex(0);
                } else {
                    setPathIndex(1);
                }
            }
        });

        return () => animation.stop()

    })


    return (
        <svg onClick={onClick} className="h-4 w-5 cursor-pointer hover:scale-105 hover:opacity-70 transition-all">
            <g>
                <motion.path fill={fill} d={path} />
            </g>
        </svg>

    )

}