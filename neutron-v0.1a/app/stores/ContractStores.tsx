import { Store } from "pullstate";
import type { Auth } from "firebase/auth";
import { Contract, ContractSidePanelStages, ContractStatus } from "~/models/contracts";
import { ContractCreationStages, ContractCreator, ContractViewStages } from "~/models/contracts";
import { useAuthState } from "react-firebase-hooks/auth";


export const ContractDataStore = new Store<Contract>({
  stage: ContractCreationStages.ClientInformation,
  creator: ContractCreator.IndividualClient,
  viewStage: ContractViewStages.Overview,
  sidePanelStage: ContractSidePanelStages.MilestonesPanel,
  status: ContractStatus.Draft,
  externalDeliverables: false,
  deliverablesCount: 1,
  hasAdvance: false,
  hasDeliverables: false,
  milestonesCount: 0,
  deliverables: [],
  milestones: [],
  payoutTriggered: false,
  template: 'design'
});
