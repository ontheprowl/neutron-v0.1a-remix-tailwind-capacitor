import { Component } from "react";

export type Condition = {
  condition: String;
  negotiable: Boolean;
};

export enum TemplateType {
  Generic,
  Design,
  Development,
  Others
}

export enum DeliverableFormat {
  PDF,
  JPEG,
  MP4,
}

export enum ContractCreationStages {
  ClientInformation,
  ScopeOfWork,
  PaymentAndMilestones,
  DraftReview,
  SignContract
}

export enum ContractViewStages {
  Overview,
  EditContract
}

export type Deliverable = {
  name: string;
  description: string;
  expectedDate: Date;
  isMilestone?: Boolean;
  format: DeliverableFormat;
  attachment: FileList;
};

export enum DeliverableStatus { 
  NotSubmitted,
  SubmittedForApproval,
  Approved,
  Rejected
}

export enum MilestoneStatus{
  Current,
  CurrentContractSpecific,
  Completed,
  Failed,
  Upcoming
}


export type Milestone = {
  expectedDate?:Date;
  name: string;
  description: string;
  deliverables?: Array<Deliverable>;
  status?:MilestoneStatus;
  type?:DeliverableType
};


export enum DeliverableType{
  Advance,
  Delivery
}

export interface Contract {
  status?: string;
  id?:string;
  projectName?: string;
  basePayCondition?: Condition;
  basePayAmount?: number;
  clientName?: string;
  isCompany?: Boolean;
  milestonesCount: number;
  milestones?: Array<Milestone>;
  providerName?: string;
  country?: string;
  companyName?: string;
  companyRole?: string;
  signedDate?: Date;
  description?: string;
  supportPolicy?: string;
  startDate?: Date;
  redressalWindow?: number;
  endDate?: Date;
  endCondition?: Condition;
  paymentType?: string;
  workOwnership?: string;
  ownershipType?: boolean;
  totalValue?: number;
  invoiceDate?: Date;
  invoiceCondition?: Condition;
  contractNotice?: number;
  stage: number;
  viewStage:number;
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
