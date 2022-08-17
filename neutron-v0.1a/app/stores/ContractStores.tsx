import { Store } from "pullstate";
import type { Auth } from "firebase/auth";
import { Contract, ContractSidePanelStages, ContractStatus } from "~/models/contracts";
import { ContractCreationStages, ContractCreator, ContractViewStages } from "~/models/contracts";
import { useAuthState } from "react-firebase-hooks/auth";


export const ContractDataStore = new Store<Contract>({
  stage: ContractCreationStages.ClientInformation,
  creator: ContractCreator.IndividualClient,
  viewStage: ContractViewStages.Overview,
  sidePanelStage: ContractSidePanelStages.ChatsPanel,
  status: ContractStatus.Draft,

  deliverablesCount: 1,
  hasAdvance: false,
  milestonesCount: 1,
  deliverables: [],
  milestones: [],
  payoutTriggered: false,
  template: 'design'
});
