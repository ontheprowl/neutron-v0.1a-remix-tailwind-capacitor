import { MouseEventHandler } from "react";






export default function TransparentButton({ className, onClick, text }: { onClick: MouseEventHandler<HTMLButtonElement>, text?: string, className:string }) {

    return (<button type="button" className={`w-auto rounded-lg bg-transparent border-2 border-solid border-white text-white transition-all`.concat(className)} onClick={onClick} >{text}</button>)


}