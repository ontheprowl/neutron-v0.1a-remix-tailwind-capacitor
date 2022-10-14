import { Store } from "pullstate";
import type { Auth } from "firebase/auth";
import { Contract, ContractSidePanelStages, ContractStatus, DEFAULT_CONTRACT_STATE } from "~/models/contracts";
import { ContractCreationStages, ContractCreator, ContractViewStages } from "~/models/contracts";
import { useAuthState } from "react-firebase-hooks/auth";


export const ContractDataStore = new Store<Contract>(DEFAULT_CONTRACT_STATE);

