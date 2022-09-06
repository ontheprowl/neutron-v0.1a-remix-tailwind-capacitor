export type Dispute = {
  id: string;
  status: DisputeStatus;
  type: DisputeType;
  contractName: string;
  raisedBy: string;
  contractID: string;
  client: {
    name?: string;
    id: string;
    email?: string;
  };
  provider: {
    name?: string;
    id: string;
    email?: string;
  };
  description?: string;
  severity: DisputeSeverity;
};


export enum DisputeType { 
  Dummy,
  QualityIssue,
  DeadlineExtension,
  Fraud
}

export enum DisputeSeverity {
  Low,
  Medium,
  High,
  Urgent,
  Unaddressable,
}

export enum DisputeStatus {
  Raised,
  Accepted,
  Rejected,
  RedressalInProcess,
  RedressalComplete,
  RedressalViolated,
  Resolved,
  Unresolved,
  Completed,
}
