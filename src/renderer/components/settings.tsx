import { useReadings } from 'renderer/store/readings'
import { MenuTree } from './menu-tree'
import { useMemo, useState } from 'react'
import { ScrollArea } from './ui/scroll-area'
import { Cog, Loader2 } from 'lucide-react'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import type { RegisterReadingsResponse } from 'shared/types'

export function Settings({
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
      <div className="flex flex-1 h-[calc(100vh-100px)] gap-8">
        <ScrollArea className="bg-card overflow-hidden rounded-md border border-muted-foreground w-1/2">
          {isFetchingBlocks ? (
            <Loader2 className="animate-spin" />
          ) : (
            <MenuTree registers={registers} setSelectedSetting={setSelectedSetting} />
          )}
        </ScrollArea>
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

// {
//     "name": "CONF/GENR/DISP",
//     "id": "381fa7691cfd4196be0e66207e703e8f",
//     "readSuccess": true,
//     "mode": "RW",
//     "outOfLimit": false,
//     "ptUnit": "",
//     "enUnit": "",
//     "ptDescription": "Parâmetro de rolagem de telas no display",
//     "enDescription": "Parameter of scrolling screens on the display",
//     "ptValue": "Alternado",
//     "enValue": "Toggled",
//     "ptDisplay": "CONF/GENR/DISP",
//     "enDisplay": "CONF/GENR/DISP"
// }
