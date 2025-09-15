import { useReadings } from 'renderer/store/readings'
import { useMemo, useState } from 'react'
import { Loader2, Cog } from 'lucide-react'
import type { RegisterReadingsResponse } from 'shared/types'
import { SettinsTree } from './ui/settings-tree'
import { SettingForm } from './ui/setting-form'

export function SettingsContainer({
  isFetchingBlocks,
}: {
  isFetchingBlocks: boolean
}) {
  const [selectedSetting, setSelectedSetting] = useState<RegisterReadingsResponse>()
  const blocks = useReadings(store => store.blocks)
  const registers = useMemo(
    () => Array.from(blocks.values()).flatMap(({ registers }) => registers),
    [blocks]
  )

  return (
    <div className="relative flex-1 min-h-0 flex mx-2">
      <div className="flex flex-1  gap-8">
        <div className="w-1/2">
          {isFetchingBlocks ? (
            <div className="bg-card h-[calc(100vh-95px)] rounded border border-muted-foreground flex items-center justify-center">
              <Loader2 className="animate-spin text-muted-foreground" />
            </div>
          ) : (
            <SettinsTree registers={registers} setSelectedSetting={setSelectedSetting} />
          )}
        </div>
        <div className="w-full">
          {selectedSetting?.ptDescription ? (
            <SettingForm setting={selectedSetting} />
          ) : (
            <div className="flex flex-col items-center h-full justify-center gap-4 text-muted-foreground">
              <p className="font-semibold ">
                Selecione algum parâmetro ao lado para poder editá-lo.
              </p>
              <Cog className="size-24" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
