import type { LanguageProps } from 'shared/types'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

type UseLanguageState = {
  language: LanguageProps['language']
  ready: boolean
  init: () => Promise<void>
  updateLanguage: (next: LanguageProps['language']) => Promise<void>
}

export const useLanguage = create<UseLanguageState, [['zustand/immer', never]]>(
  immer((set, get) => ({
    language: 'pt-BR',
    ready: false,

    init: async () => {
      const { language } = await window.App.fetchLanguage()
      set(d => {
        d.language = language
        d.ready = true
      })
    },

    updateLanguage: async next => {
      await window.App.updateLanguage({ language: next })
      set(d => {
        d.language = next
      })
    },
  }))
)
