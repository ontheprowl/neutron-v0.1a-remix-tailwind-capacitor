import { User } from "firebase/auth";

export type UserState = {
  designation?: string;
  invoices: number;
  customers: number;
  name?: string;
  id?: string;
  profileUrl?: string;
  age?: number;
  defaultTestMode?:boolean;
  email: string;
  funds?: Funds;
  // user?:User;
};

export type Funds = {
  receivedFunds?: number;
  disbursedFunds?: number;
  escrowedFunds?: number;
  disputedFunds?: number;
};

export const DEFAULT_USER_STATE: UserState = {
  invoices: 0,
  customers: 0,
  name: "",
  profileUrl: "",
  age: 18,
  email: "",
  funds: {
    receivedFunds: 0,
    escrowedFunds: 0,
    disputedFunds: 0,
    disbursedFunds: 0,
  },
  defaultTestMode:true
};

export type Password = {
  hash: string;
};

export type Beneficiary = {
  beneId: string;
  name: string;
  email: string;
  phone: string;
  bankAccount: string;
  ifsc: string;
  address1: string;
  city: string;
  state: string;
  pincode: string;
};
