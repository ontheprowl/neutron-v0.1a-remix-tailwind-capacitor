import { Store } from "pullstate";
import type { Auth } from "firebase/auth";
import type { Contract } from "~/types/contracts";


export const ContractDataStore = new Store<Contract>({
  stage:2,
  deliverablesCount:1,
  deliverables:[],
  template:'design'
});