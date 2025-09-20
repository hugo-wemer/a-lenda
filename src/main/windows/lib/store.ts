import Store from 'electron-store'
import type { StoreType } from 'shared/types'

export const store = new Store<StoreType>({
  defaults: { version: 0, equipments: {} },
})
console.log(store.path)
