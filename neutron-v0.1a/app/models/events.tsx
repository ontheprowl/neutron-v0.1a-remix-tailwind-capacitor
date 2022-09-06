




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
    ContractMilestoneRejected,
    ContractPayoutRequested,
    ContractPayoutCompleted,
    ContractInProcess,
    ContractDisputeRegistered,
    ContractDisputeInProcess,
    ContractDisputeEscalated,
    ContractDisputeResolved,
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
    ContractEvent, MilestoneEvent, DisputeEvent, ChatEvent, PaymentEvent
}


export type NeutronEvent = {
    id?: string;
    uid: string;
    type: EventType;
    event: ContractEvent | ChatEvent | PaymentEvent;
    payload?: EventPayload;
    timestamp?: string;
}

export type EventPayload = {
    message: string;
    data?: any;
}

