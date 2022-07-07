import { useFormContext } from "react-hook-form"
import { Contract } from "~/models/contracts";
import GenericContractTemplate from '~/components/contracts/GenericContractTemplate';
import TransparentButton from "../inputs/TransparentButton";
import FormButton from "../inputs/FormButton";
import ContractCustomizationComponent from "./ContractCustomizationComponent";




export default function ContractEditScreen({ loaderData }: { loaderData?: Contract }) {

    const formMethods = useFormContext();

    return (
        <div className="flex flex-col sm:flex-row space-y-5 sm:space-x-10 justify-start">
            <div className="bg-white h-full w-auto basis-2/3 border-2">
                <GenericContractTemplate loaderData={loaderData}></GenericContractTemplate>
            </div>
            <div className="flex flex-col h-auto w-full basis-1/3 ">
                <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 m-5 justify-end">
                    <TransparentButton className='' text="Unimplemented" onClick={() => {
                        return new Error("Not Implemented");
                    }}></TransparentButton>
                    <FormButton submit text="Publish Draft" ></FormButton>
                </div>
                <div className="border-2 border-accent-dark rounded-xl m-5 mt-2">

                    <ContractCustomizationComponent></ContractCustomizationComponent>
                    <button type="submit">click here</button>

                </div>
            </div>

        </div>)
}