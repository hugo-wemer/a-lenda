import { ConnectionForm } from 'renderer/components/connection-form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { useEffect, useState } from 'react'
import { ReadingsTable } from 'renderer/components/readings-table'
import { useReadings } from 'renderer/store/readings'
import type { BlockReadingResponse } from 'shared/types'
import { SettingsContainer } from 'renderer/components/settings-container'
import { LanguageDropDownMenu } from 'renderer/components/language-drop-down-menu'
import { useLanguage } from 'renderer/store/language'

export function MainScreen() {
  const { init, language } = useLanguage()

  const [version, setVersion] = useState(0)
  const [isFetchingBlocks, setIsFetchingBlocks] = useState(false)
  const { addBlocks } = useReadings()

  useEffect(() => {
    init()
    ;(async () => {
      await window.App.updateApp()
      setVersion(await window.App.fetchAppVersion())
    })()

    const offUpdate = window.App.onReadingUpdate((payload: BlockReadingResponse) => {
      addBlocks(payload)
    })

    const offFinished = window.App.onReadingStatus(status => {
      setIsFetchingBlocks(status)
    })

    return () => {
      offUpdate()
      offFinished()
    }
  }, [addBlocks])

  return (
    <div className="flex h-full min-h-0 flex-col">
      <Tabs className="flex-1 min-h-0 overflow-hidden" defaultValue="connection">
        <TabsList className="px-2 flex w-full justify-between border-b-1 border-popover  rounded-none">
          <div className="text-foreground h-auto gap-2  px-0  bg-card justify-start">
            <TabsTrigger
              className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              value="connection"
            >
              {language === 'en-US' ? 'Connection' : 'Conexão'}
            </TabsTrigger>
            <TabsTrigger
              className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              value="readings"
            >
              {language === 'en-US' ? 'Readings' : 'Leituras'}
            </TabsTrigger>
            <TabsTrigger
              className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              value="settings"
            >
              {language === 'en-US' ? 'Settings' : 'Parametrização'}
            </TabsTrigger>
          </div>
          <LanguageDropDownMenu />
        </TabsList>
        <TabsContent value="connection" className="data-[state=inactive]:hidden p-0">
          <div className="h-[calc(100vh-105px)] flex items-center">
            <ConnectionForm />
          </div>
        </TabsContent>
        <TabsContent value="readings">
          <ReadingsTable isFetchingBlocks={isFetchingBlocks} />
        </TabsContent>
        <TabsContent value="settings">
          <SettingsContainer isFetchingBlocks={isFetchingBlocks} />
        </TabsContent>
        <span className="absolute bottom-0 left-1/2 text-center my-2 text-sm text-muted-foreground">
          v{version}
        </span>
      </Tabs>
    </div>
  )
}
