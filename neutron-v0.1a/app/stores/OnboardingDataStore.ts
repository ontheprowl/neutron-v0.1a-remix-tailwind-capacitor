import { Store } from 'pullstate';

interface IOnboardingStore {
    stage: number,
}

export const OnboardingDataStore = new Store<IOnboardingStore>({
    stage: 0

})