import { Store } from 'pullstate';

interface IUIStore {
    selectedTab: string,
    profileTab: number,
    testMode: boolean
}

export const AppStore = new Store<IUIStore>({
    selectedTab: "Home",
    profileTab: 0,
    testMode: false

})