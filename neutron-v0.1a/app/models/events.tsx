




export enum ContractEvent {
	ContractDrafted,
	ContractPublished,
	ContractPendingSignByServiceProvider,
	ContractSignedByServiceProvider,
	ContractPendingSignByClient,
	ContractSignedByBoth,
	ContractPayinRequested,
	ContractPayinCompleted,
	ContractAdvancePending,
	ContractAdvancePayoutCompleted,
	ContractMilestonePending,
	ContractMilestoneSubmitted,
	ContractMilestoneInFeedback,
	ContractMilestoneCompleted,
	ContractPayoutRequested,
	ContractPayoutCompleted,
	ContractMilestonePayoutRequested,
	ContractMilestonePayoutCompleted,
	ContractInProcess,
	ContractDisputeRegistered,
	ContractDisputeCancelled,
	ContractDisputeInProcess,
	ContractDisputeEscalated,
	ContractDisputeRejected,
	ContractDisputeResolved,
	ContractDisputeInArbitration,
	ContractCompleted,
	ContractClosed,
	ContractTerminated,
}

export enum PaymentEvent {
	PayinRequested,
	PayinCompleted,
	PayoutRequested,
	PayoutCompleted
}

export enum ChatEvent {
	MessageReceived
}


export enum EventType {
	ContractEvent, KYCEvent
}


export enum KYCEvent {
	BankAccountDetailsVerified,
	BankAccountDetailsRejected,
	AadhaarVerified,
	AadhaarRejected,
	PANVerified,
	PANRejected
}


export type NeutronEvent = {
	id?: string;
	uid: string;
	type: EventType;
	sandbox?:boolean;
	event: ContractEvent | KYCEvent | ChatEvent | PaymentEvent;
	payload?: EventPayload;
	timestamp?: string;
}

export type EventPayload = {
	message: string;
	data?: any;
}

