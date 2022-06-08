import { useFormContext } from "react-hook-form"
import { Contract } from "~/types/contracts";




export default function ContractEditScreen() {

    const formMethods = useFormContext();

    return (
        <div className="flex flex-row w-auto h-auto justify-between items-center">
            <div className="flex flex-col w-48 h-full bg-white p-5"> Contract Container</div>
            <div className="flex flex-col p-5 m-5 h-auto">
                <h2> Customization </h2>
            </div>
        </div >)
}