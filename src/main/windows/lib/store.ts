import Store from 'electron-store'
import type { StoreType } from 'shared/types'

export const store = new Store<StoreType>({
  defaults: { language: 'pt-BR', version: 0, equipments: {}, userPassword: 0 },
})
console.log(store.path)
