export type Condition = {
  condition: String;
  negotiable: Boolean;
};

export enum TemplateType {
  Generic,
  Design,
  Development,
  Others,
}

export enum DeliverableFormat {
  PDF,
  ZIP,
  JPEG,
  MP4,
}

export enum ContractCreationStages {
  ClientInformation,
  ScopeOfWork,
  PaymentAndMilestones,
  DraftReview,
  SignContract,
}

export enum ContractViewStages {
  Overview,
  EditContract,
}

export enum ContractSidePanelStages {
  MilestonesPanel,
  ChatsPanel,

  PaymentPanel,
  DeliverablesPanel,
}

export type Deliverable = {
  name: string;
  description: string;
  expectedDate: Date;
  isMilestone?: Boolean;
  format: DeliverableFormat;
  attachment: FileList;
  milestone?: string;
};

export enum DeliverableStatus {
  NotSubmitted,
  SubmittedForApproval,
  Approved,
  Rejected,
}

export enum MilestoneStatus {
  Current,
  CurrentContractSpecific,
  Completed,
  Failed,
  Upcoming,
}

export type Milestone = {
  lastMilestone?: boolean;
  expectedDate?: Date;
  name: string;
  description: string;
  deliverables?: Array<Deliverable>;
  status?: MilestoneStatus;
};

export enum DeliverableType {
  Advance,
  Delivery,
}

export enum ContractStatus {
  Draft,
  Published,
}

export enum ContractCreator {
  IndividualClient,
  EnterpriseClient,
  IndividualServiceProvider,
}

export interface Contract {
  contractValue?: string;
  clientAddress?: string;
  payoutTriggered?: boolean;
  providerEmail: string;
  isClient?: boolean;
  hasMilestones?: boolean;
  status?: ContractStatus;
  creator?: ContractCreator;
  id?: string;
  isSigned?: boolean;
  projectName?: string;
  basePayCondition?: Condition;
  basePayAmount?: number;
  clientName?: string;
  isCompany?: Boolean;
  milestonesCount: number;
  milestones?: {
    advance: Milestone;
    workMilestones: { [key: string]: Milestone };
  };
  providerName?: string;
  country?: string;
  companyName?: string;
  companyRole?: string;
  signedDate?: Date;
  hasAdvance?: boolean;
  advancePercentage?: string;
  description?: string;
  supportPolicy?: string;
  startDate?: Date;
  redressalWindow?: number;
  endDate?: Date;
  endCondition?: Condition;
  paymentType?: string;
  workOwnership?: string;
  ownershipType?: boolean;
  totalValue?: string;
  invoiceDate?: Date;
  invoiceCondition?: Condition;
  contractNotice?: number;
  stage: number;
  viewStage: number;
  sidePanelStage: number;
  attachment?: FileList;
  template: string;
  clientEmail?: string;
  deliverablesCount: number;
  deliverables?: Array<Deliverable>;
}

// export interface Template  {
//   type: TemplateType;
//   data: Contract;
//   renderSimplified: () => string;
//   renderComplex: () => string;
//   () : Component;
// };
