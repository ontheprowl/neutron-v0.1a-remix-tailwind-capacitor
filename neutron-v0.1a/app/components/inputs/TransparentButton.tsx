import { MouseEventHandler } from "react";






export default function TransparentButton({ className, onClick, text }: { onClick: MouseEventHandler<HTMLButtonElement>, text?: string, className:string }) {

    return (<button type="button" className={`w-full rounded-lg bg-transparent border-2 border-solid border-white p-2.5 text-white transition-all hover:scale-105`.concat(className)} onClick={onClick} >{text}</button>)


}