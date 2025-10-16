import { ConnectionForm } from 'renderer/components/connection-form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { useEffect, useState } from 'react'
import { ReadingsTable } from 'renderer/components/readings-table'
import { useReadings } from 'renderer/store/readings'
import type { BlockReadingResponse } from 'shared/types'
import { SettingsContainer } from 'renderer/components/settings-container'
import { LanguageDropDownMenu } from 'renderer/components/language-drop-down-menu'
import { useLanguage } from 'renderer/store/language'
import TreetechGrayLogo from '../../resources/public/treetech_gray.png'
import TreetechGreenLogo from '../../resources/public/treetech_green.png'

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
          <div className="flex items-center gap-2">
            <img src={TreetechGreenLogo} alt="Treetech logo" className="h-5" />
            <div className="text-foreground h-auto gap-2  px-0 mb-px bg-card justify-start">
              <TabsTrigger
                className="relative
                data-[state=active]:bg-transparent 
                hover:bg-accent hover:text-foreground
                data-[state=active]:after:content-['']
                data-[state=active]:after:absolute
                data-[state=active]:after:inset-x-0
                data-[state=active]:after:-bottom-1
                data-[state=active]:after:h-[2px]
                data-[state=active]:after:pointer-events-none
                data-[state=active]:after:[background-image:var(--bg-selected)]
                data-[state=active]:after:bg-no-repeat
                data-[state=active]:after:bg-[length:100%_100%]
                cursor-pointer"
                value="connection"
              >
                {language === 'en-US' ? 'Connection' : 'Conexão'}
              </TabsTrigger>
              <TabsTrigger
                className="relative
                data-[state=active]:bg-transparent 
                hover:bg-accent hover:text-foreground
                data-[state=active]:after:content-['']
                data-[state=active]:after:absolute
                data-[state=active]:after:inset-x-0
                data-[state=active]:after:-bottom-1
                data-[state=active]:after:h-[2px]
                data-[state=active]:after:pointer-events-none
                data-[state=active]:after:[background-image:var(--bg-selected)]
                data-[state=active]:after:bg-no-repeat
                data-[state=active]:after:bg-[length:100%_100%]
                cursor-pointer"
                value="readings"
              >
                {language === 'en-US' ? 'Readings' : 'Leituras'}
              </TabsTrigger>
              <TabsTrigger
                className="relative
                data-[state=active]:bg-transparent 
                hover:bg-accent hover:text-foreground
                data-[state=active]:after:content-['']
                data-[state=active]:after:absolute
                data-[state=active]:after:inset-x-0
                data-[state=active]:after:-bottom-1
                data-[state=active]:after:h-[2px]
                data-[state=active]:after:pointer-events-none
                data-[state=active]:after:[background-image:var(--bg-selected)]
                data-[state=active]:after:bg-no-repeat
                data-[state=active]:after:bg-[length:100%_100%]
                cursor-pointer"
                value="settings"
              >
                {language === 'en-US' ? 'Settings' : 'Parametrização'}
              </TabsTrigger>
            </div>
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
        <span className="fixed bottom-0 left-[1/2] w-screen justify-center text-center my-2 text-sm text-muted-foreground flex gap-2 items-center">
          <img src={TreetechGrayLogo} alt="Treetech" className="h-3" />v{version}
        </span>
      </Tabs>
    </div>
  )
}
