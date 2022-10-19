import { Store } from 'pullstate';

interface IUIStore {
    selectedTab: string,
    profileTab: number
}

export const UIStore = new Store<IUIStore>({
    selectedTab: "Home",
    profileTab: 0
})