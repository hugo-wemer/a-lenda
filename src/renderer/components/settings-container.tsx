import { useReadings } from 'renderer/store/readings'
import { useMemo, useState } from 'react'
import { Loader2, Cog, FileOutput, FileUp } from 'lucide-react'
import type { RegisterReadingsResponse } from 'shared/types'
import { SettinsTree } from './ui/settings-tree'
import { SettingForm } from './ui/setting-form'
import { motion } from 'motion/react'
import { Button } from './ui/button'
import { groupRegistersByPtDisplay } from 'renderer/lib/group-registers-by-ptDisplay'
import { createSettingsFile } from 'renderer/lib/create-settings-file'

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
  const baseTree = useMemo(() => groupRegistersByPtDisplay(registers), [registers])
  const url = createSettingsFile({
    id: crypto.randomUUID(),
    registers: registers
      .filter(register => register.ptDisplay !== '')
      .map(({ id, ptDisplay, value }) => ({ id, ptDisplay, value })),
  })

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const text = (await file.text()).replace(/^\uFEFF/, '')
    const data = JSON.parse(text)
    console.log(data)
    // await window.App.importSettings(data)
    e.target.value = ''
  }

  return (
    <div className="relative flex-1 min-h-0 flex mx-2">
      <div className="flex flex-1 gap-8">
        <div className="w-1/2">
          {isFetchingBlocks ? (
            <div className="h-[calc(100vh-85px)]">
              <motion.div
                data-progress={isFetchingBlocks}
                className="bg-card rounded-xl h-10 flex items-center justify-center border border-transparent animate-border data-[progress=true]:[background:linear-gradient(45deg,#09090B,theme(colors.zinc.900)_50%,#09090B)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.zinc.700/.48)_80%,_theme(colors.lime.500)_86%,_theme(colors.lime.300)_90%,_theme(colors.lime.500)_94%,_theme(colors.zinc.600/.48))_border-box]"
              >
                <Loader2 className="animate-spin text-muted-foreground" />
              </motion.div>
            </div>
          ) : (
            <SettinsTree baseTree={baseTree} setSelectedSetting={setSelectedSetting} />
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
      <div className="absolute right-0 flex justify-end">
        <Button
          asChild
          size={'sm'}
          variant={'link'}
          className="cursor-pointer"
          // onClick={() => URL.revokeObjectURL(url)}
          aria-disabled={isFetchingBlocks}
        >
          <a
            href={url}
            download={`${new Date(Date.now()).toLocaleString('pt-BR')}.settings`}
            className="aria-disabled:pointer-events-none aria-disabled:opacity-10"
          >
            <FileOutput />
            <span>Exportar</span>
          </a>
        </Button>
        {/* <Input type="file" className="text-primary underline-offset-4 hover:underline" /> */}
        <input
          id={'export'}
          type="file"
          accept=".settings,application/json"
          className="hidden"
          onChange={event => handleImport(event)}
        />
        <Button
          size={'sm'}
          variant={'link'}
          className="cursor-pointer"
          asChild
          aria-disabled={isFetchingBlocks}
        >
          <label
            htmlFor="export"
            className="aria-disabled:pointer-events-none aria-disabled:opacity-10"
          >
            <FileUp />
            <span>Importar</span>
          </label>
        </Button>
      </div>
    </div>
  )
}
