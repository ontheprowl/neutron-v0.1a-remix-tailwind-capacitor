import type { MouseEventHandler } from "react";




export default function PurpleWhiteButton({text, onClick} : {text:string, onClick:MouseEventHandler<HTMLButtonElement>}) {

    return <button className="text-[#8364E8] bg-white rounded-xl p-3 w-auto max-w-[400px] " onClick={onClick}>{text}</button>

}