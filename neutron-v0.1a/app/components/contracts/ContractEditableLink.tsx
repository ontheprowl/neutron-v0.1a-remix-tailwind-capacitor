import React, { MouseEventHandler, ReactNode } from "react";
import { ContractDataStore } from "~/stores/ContractStores";
import { ContractCreationStages } from "~/types/contracts";





export default function ContractEditableLink(props){


    return <span className="text-purple-500 active:scale-105 hover:text-purple-300 cursor-pointer" onClick={()=>{
        ContractDataStore.update((s)=>{
            s.stage=props.to
        })
    }}>{props.children}</span>
}