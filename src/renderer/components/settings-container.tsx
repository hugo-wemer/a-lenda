import { useReadings } from 'renderer/store/readings'
import { useEffect, useMemo, useState } from 'react'
import { Loader2, Cog } from 'lucide-react'
import { Badge } from './ui/badge'
import type { RegisterReadingsResponse } from 'shared/types'
import { SettinsTree } from './ui/settings-tree'
import { SettingsForm } from './ui/settings-form'

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
        <div className=" w-1/2">
          {isFetchingBlocks ? (
            <Loader2 className="animate-spin" />
          ) : (
            <SettinsTree registers={registers} setSelectedSetting={setSelectedSetting} />
          )}
        </div>
        <div className="w-full">
          {selectedSetting?.ptDescription ? (
            <SettingsForm setting={selectedSetting} />
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
