import { useReadings } from 'renderer/store/readings'
import { useMemo, useState } from 'react'
import { Loader2, Cog } from 'lucide-react'
import type { RegisterReadingsResponse } from 'shared/types'
import { SettinsTree } from './ui/settings-tree'
import { SettingForm } from './ui/setting-form'
import { motion } from 'motion/react'

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
            <div className="h-[calc(100vh-85px)]">
              <motion.div
                data-progress={isFetchingBlocks}
                className="bg-card rounded-xl h-10 flex items-center justify-center border border-transparent animate-border data-[progress=true]:[background:linear-gradient(45deg,#09090B,theme(colors.zinc.900)_50%,#09090B)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.zinc.700/.48)_80%,_theme(colors.indigo.500)_86%,_theme(colors.indigo.300)_90%,_theme(colors.indigo.500)_94%,_theme(colors.zinc.600/.48))_border-box]"
              >
                <Loader2 className="animate-spin text-muted-foreground" />
              </motion.div>
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
