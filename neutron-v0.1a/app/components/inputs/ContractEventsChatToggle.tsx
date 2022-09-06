import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import React, { MouseEventHandler, useEffect, useState } from "react";
import { ContractSidePanelStages } from "~/models/contracts";
import { ContractDataStore } from "~/stores/ContractStores";
import { getIndex, useFlubber } from "~/utils/use-flubber";


const paths = ["M7.64563 1.17972C17.7303 -2.85614 27.6809 7.85058 22.2623 17.6041C19.8011 22.0343 13.6861 25.6018 6.56582 22.2276L1.61665 23.6417C0.848724 23.861 0.139081 23.1543 0.35457 22.3857C0.649959 21.3322 1.34987 18.8485 1.7591 17.5024C-1.31 12.0259 0.759496 3.93554 7.64563 1.17972ZM7.33069 9.81251C7.33069 10.2152 7.65712 10.5417 8.05985 10.5417H15.9374C16.3401 10.5417 16.6666 10.2152 16.6666 9.81251C16.6666 9.40978 16.3401 9.08334 15.9374 9.08334H8.05985C7.65712 9.08334 7.33069 9.40978 7.33069 9.81251ZM8.06242 13.4438C7.65969 13.4438 7.33325 13.7702 7.33325 14.1729C7.33325 14.5756 7.65969 14.9021 8.06242 14.9021H13.6041C14.0068 14.9021 14.3333 14.5756 14.3333 14.1729C14.3333 13.7702 14.0068 13.4438 13.6041 13.4438H8.06242Z", "M17.1153 15.3582C16.8446 15.6642 16.5606 15.9665 16.2635 16.2635C11.9678 20.5593 6.58585 22.1422 4.2427 19.7991C2.6363 18.1926 2.8752 15.158 4.56847 12.0242M6.88967 8.72526C7.17138 8.40495 7.46772 8.08875 7.77824 7.77824C12.074 3.48247 17.4559 1.89956 19.7991 4.2427C21.4066 5.85021 21.1662 8.88795 19.4698 12.024M16.2635 7.77824C20.5593 12.074 22.1422 17.4559 19.7991 19.7991C17.4559 22.1422 12.074 20.5593 7.77824 16.2635C3.48247 11.9678 1.89956 6.58585 4.2427 4.2427C6.58585 1.89956 11.9678 3.48247 16.2635 7.77824ZM13.0001 12C13.0001 12.5523 12.5523 13 12.0001 13C11.4478 13 11.0001 12.5523 11.0001 12C11.0001 11.4477 11.4478 11 12.0001 11C12.5523 11 13.0001 11.4477 13.0001 12Z"]


export default function ContractEventsChatToggle({ onClick, className }: { className: string, onClick: MouseEventHandler<SVGElement> }) {
    const [pathIndex, setPathIndex] = useState(0);
    const progress = useMotionValue(0);
    const fill = useTransform(progress, paths.map(getIndex), ["#FFFFFF", "#2E2E2E"]);
    const path = useFlubber(progress, paths);


    const sidePanelStage = ContractDataStore.useState(s => s.sidePanelStage);

    useEffect(() => {
        const animation = animate(progress, pathIndex, {
            duration: 0.2,
            ease: "easeInOut",
            onComplete: () => {
                if (sidePanelStage == ContractSidePanelStages.ChatsPanel) {
                    setPathIndex(0);
                } else {
                    setPathIndex(1);
                }
            }
        });

        return () => animation.stop()

    })


    return (

        <svg className={className} onClick={onClick} >
            <g>
                <motion.path fill={fill} d={path} />
            </g>
        </svg>
    )

}