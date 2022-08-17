import type { MouseEventHandler } from "react";





export default function FormButton({ className, onClick, variant, text, submit }: { onClick: MouseEventHandler<HTMLButtonElement>, className?:string, variant?: string, text?: string, submit?:boolean}) {

    return (<button type={submit?"submit":"button"} className={`w-auto z-0 sm:w-full self-center whitespace-nowrap rounded-lg bg-accent-dark p-3 text-${variant == "light" ? 'white' : 'black'} transition-all`.concat(className)} onClick={onClick} >{text}</button>)
}