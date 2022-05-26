import { Store } from "pullstate";
import type { Auth } from "firebase/auth";

interface IContractStageStore {
  stage: number;
  template:string;
  deliverables:number;
}

export const ContractStageStore = new Store<IContractStageStore>({
  stage:0,
  template:'Design',
  deliverables:1
});
