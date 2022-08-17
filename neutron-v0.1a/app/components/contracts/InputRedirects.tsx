import { ReactChild, ReactFragment, ReactPortal } from "react";
import { ContractCreationStages } from "~/models/contracts";
import { ContractDataStore } from "~/stores/ContractStores";



export const ClientInformationRedirect = (props: { children: boolean | ReactChild | ReactFragment | ReactPortal | null | undefined; }) => (<span className="text-purple-400 hover:decoration-purple-400 hover:underline cursor-pointer" onClick={() => { ContractDataStore.update(s => { s.stage = ContractCreationStages.ClientInformation }) }}>{props.children?props.children : 'Empty field'}</span>);

export const ScopeOfWorkRedirect = (props: { children: boolean | ReactChild | ReactFragment | ReactPortal | null | undefined; }) => (<span className="text-purple-400 hover:decoration-purple-400 hover:underline cursor-pointer" onClick={() => { ContractDataStore.update(s => { s.stage = ContractCreationStages.ScopeOfWork }) }}>{props.children?props.children : 'Empty field'}</span>);

export const PaymentAndMilestonesRedirect = (props: { children: boolean | ReactChild | ReactFragment | ReactPortal | null | undefined; }) => (<span className="text-purple-400 hover:decoration-purple-400 hover:underline cursor-pointer" onClick={() => { ContractDataStore.update(s => { s.stage = ContractCreationStages.PaymentAndMilestones }) }}>{props.children?props.children : 'Empty field'}</span>);