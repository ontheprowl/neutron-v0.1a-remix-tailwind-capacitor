import { Store } from "pullstate";
import type { Auth } from "firebase/auth";
import type { Contract} from "~/types/contracts";
import { ContractCreationStages, ContractCreator, ContractViewStages } from "~/models/contracts";
import { useAuthState } from "react-firebase-hooks/auth";


export const ContractDataStore = new Store<Contract>({
  stage:ContractCreationStages.ClientInformation,
  creator: ContractCreator.IndividualServiceProvider,
  viewStage:ContractViewStages.Overview,
  deliverablesCount:1,
  milestonesCount:1,
  deliverables:[],
  milestones:[],
  template:'design'
});
