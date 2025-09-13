import { useReadings } from 'renderer/store/readings'
import { useMemo, useState } from 'react'
import { ScrollArea } from './ui/scroll-area'
import { Settings, Loader2, Cog } from 'lucide-react'
import { Badge } from './ui/badge'
import type { RegisterReadingsResponse } from 'shared/types'
import { SettinsTree } from './ui/settings-tree'

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
            <SettinsTree registers={registers} />
          )}
        </div>
        <div className="w-full">
          {selectedSetting?.ptDescription ? (
            <div>
              {selectedSetting?.ptGroup && (
                <Badge className="bg-blue-500 text-blue-50">{selectedSetting?.ptGroup}</Badge>
              )}
              <p className="font-semibold text-center">{selectedSetting?.ptDescription}</p>
              {/* <Input value={selectedSetting?.ptValue} /> */}
            </div>
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
