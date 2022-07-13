import { User } from "firebase/auth";

export type UserState = {
  designation?: string;
  contracts: number;
  clients: number;
  name?: string;
  id?: string;
  profileUrl?: string;
  age?: number;
  email: string;
  funds?: Funds;
  // user?:User;
};

export type Funds = {
    disbursedFunds?:number,
    committedFunds?:number,
    disputedFunds?:number,
    totalFunds?:number
}

export const DEFAULT_USER_STATE: UserState = {
  contracts: 0,
  clients: 0,
  name: "",
  profileUrl: "",
  age: 18,
  email: "",
  funds:{
    disbursedFunds:0,
    committedFunds:0,
    disputedFunds:0,
    totalFunds:0
  }
};

export type Password = {
  hash: string;
};

export type Beneficiary = {
  beneId: string,
  name: string,
  email: string,
  phone: string,
  bankAccount: string,
  ifsc: string,
  address1: string,
  city: string,
  state: string,
  pincode: string
}
