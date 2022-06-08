
export type Condition = {
  condition: String;
  negotiable: Boolean;
};


export enum DeliverableFormat {
    PDF,
    JPEG,
    MP4
}

export type Deliverable = {
    name: string;
    description: string;
    expectedDate: Date;
    format: DeliverableFormat;
    attachment: FileList;
}

export interface Contract {
  projectName?: string;
  basePayCondition?: Condition;
  basePayAmount?: number;
  clientName?: string;
  isCompany?: boolean;
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
  attachment?:FileList;
  template: string;
  clientEmail?: string;
  deliverablesCount: number;
  deliverables?:Array<Deliverable>;
}
