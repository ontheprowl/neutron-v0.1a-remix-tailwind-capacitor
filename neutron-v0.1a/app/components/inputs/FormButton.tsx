import type { MouseEventHandler } from "react";





export default function FormButton({ onClick, variant, text, submit }: { onClick: MouseEventHandler<HTMLButtonElement>, variant?: string, text?: string, submit?:boolean}) {

    return (<button type={submit?"submit":"button"} className={`w-auto sm:w-full max-w-lg self-center mb-5 m:m-5 whitespace-nowrap rounded-lg bg-accent-dark p-3 text-${variant == "light" ? 'white' : 'black'} transition-all hover:scale-105`} onClick={onClick} >{text}</button>)
}