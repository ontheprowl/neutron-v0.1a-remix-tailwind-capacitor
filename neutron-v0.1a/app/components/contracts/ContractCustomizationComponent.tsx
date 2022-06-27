import { useNavigate } from "@remix-run/react";
import { MouseEvent } from "react";
import { ContractDataStore } from "~/stores/ContractStores";
import TransparentButton from "../inputs/TransparentButton";






export default function ContractCustomizationComponent() {

    
    return (
        <div className="flex flex-col m-5">
            <h1 className="prose prose-lg text-white"> Edit Contract</h1>
            <div className="flex flex-col mt-3 w-full space-y-4">
                <TransparentButton className="w-full" text="Client Information" onClick={()=>{
                    ContractDataStore.update(s=>{
                        s.stage=0;
                    })
                }} className={""}> </TransparentButton>
                <TransparentButton text="Scope of Work" onClick={()=>{
                    ContractDataStore.update(s=>{
                        s.stage=1;
                    })
                }} className={""}> Client Information</TransparentButton>
                <TransparentButton
                rentButton text="Payment and Milestones" onClick={()=>{
                    ContractDataStore.update(s=>{
                        s.stage=2;
                    })
                }} className={""}> Client Information</TransparentButton>
            </div>
        </div>);
}