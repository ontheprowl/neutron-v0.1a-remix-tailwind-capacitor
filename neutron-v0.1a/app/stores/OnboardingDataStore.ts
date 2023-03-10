import { Store } from 'pullstate';

interface IOnboardingStore {
    credsReceived: boolean,
}

export const OnboardingDataStore = new Store<IOnboardingStore>({
    credsReceived: false

})