import { Store } from 'pullstate';

interface IBusinessStore {
    receivables: Array<{[x:string] : any}>,
    outstanding:
}

export const OnboardingDataStore = new Store<IOnboardingStore>({
    credsReceived: false

})