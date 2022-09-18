import type { MouseEventHandler } from "react";
import { primaryGradientDark } from "~/utils/neutron-theme-extensions";




// function generateButtonColor(variant: "regular" | "positive" | "negative") {
//     switch(variant){
//         case "regular":
//             return `${primaryGradientDark}`;
//         case "positive":
//             return `bg-pr`
//     }

// }

export default function FormButton({ onClick, text, submit, variant, size }: { onClick?: MouseEventHandler<HTMLButtonElement>, text?: string | JSX.Element, variant?: "regular" | "positive" | "negative", size?: "small" | "full", submit?: boolean }) {

    return (<button type={submit ? "submit" : "button"} className={`z-0 ${size == "full" ? 'w-full' : 'w-auto'}  sm:min-w-[200px] self-center whitespace-nowrap rounded-lg ${primaryGradientDark} border-2 border-transparent hover:border-white font-gilroy-black text-white p-4 transition-all`} onClick={onClick} >{text}</button>)
}