import {Store} from 'pullstate';

interface IUIStore {
    selectedTab: string
}

export const UIStore = new Store<IUIStore>({
    selectedTab:"Home"
})