import type { MouseEventHandler } from "react";





export default function FormButton({ onClick, variant, text }: { onClick: MouseEventHandler<HTMLButtonElement>, variant?: string, text?: string}) {

    return (<button className={`w-40 rounded-lg bg-accent-dark p-3 text-${variant == "light" ? 'white' : 'black'} transition-all hover:scale-105`} onClick={onClick} >{text}</button>)
}