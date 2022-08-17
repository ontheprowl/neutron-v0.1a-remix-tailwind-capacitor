import { MouseEventHandler } from "react";






export default function TransparentButton({ className, onClick, text, variant, submit }: { onClick: MouseEventHandler<HTMLButtonElement>, text?: string, submit?: boolean, variant?: string, className: string }) {
    return (<button type={submit ? "submit" : "button"} className={`w-auto z-0 sm:w-full self-center whitespace-nowrap rounded-lg bg-transparent border-2 border-white text-white p-3 text-${variant == "light" ? 'white' : 'black'} transition-all`.concat(className)} onClick={onClick} >{text}</button>)



}