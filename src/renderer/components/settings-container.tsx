import { useReadings } from 'renderer/store/readings'
import { useMemo, useState } from 'react'
import { Loader2, Cog, FileOutput, FileUp, Loader } from 'lucide-react'
import { type SettingsProps, SettingsSchema, type RegisterReadingsResponse } from 'shared/types'
import { SettinsTree } from './ui/settings-tree'
import { SettingForm } from './ui/setting-form'
import { motion } from 'motion/react'
import { Button } from './ui/button'
import { groupRegistersByPtDisplay } from 'renderer/lib/group-registers-by-ptDisplay'
import { createSettingsFile } from 'renderer/lib/create-settings-file'
import { useMutation } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader } from './ui/dialog'
import { ScrollArea } from './ui/scroll-area'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { Skeleton } from './ui/skeleton'
import { HoverCard, HoverCardTrigger } from './ui/hover-card'
import { HoverCardContent } from '@radix-ui/react-hover-card'

export function SettingsContainer({
  isFetchingBlocks,
}: {
  isFetchingBlocks: boolean
}) {
  const [selectedSetting, setSelectedSetting] = useState<RegisterReadingsResponse>()
  const [dialogOpen, setDialogOpen] = useState(false)

  const blocks = useReadings(store => store.blocks)

  const registers = useMemo(
    () => Array.from(blocks.values()).flatMap(({ registers }) => registers),
    [blocks]
  )
  const baseTree = useMemo(() => groupRegistersByPtDisplay(registers), [registers])

  function updateSettings(data: SettingsProps) {
    const response = window.App.updateSettings(data)
    return response
  }

  const {
    mutateAsync: updateParams,
    isPending,
    data: updateResult,
  } = useMutation({
    mutationFn: updateSettings,
    onMutate: () => {
      setDialogOpen(true)
    },
    onSuccess: () => window.App.readingFetch(),
  })
  const url = createSettingsFile({
    id: crypto.randomUUID(),
    registers: registers
      .filter(register => register.ptDisplay !== '')
      .map(({ id, ptDisplay, value }) => ({
        id,
        ptDisplay,
        value,
      })),
  })

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const text = (await file.text()).replace(/^\uFEFF/, '')
    const data = JSON.parse(text)

    try {
      const parsedData = SettingsSchema.parse(data)
      updateParams(parsedData)
    } catch (error) {
      console.log('parse error')
    }
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
          className="cursor-pointer text-foreground"
          // onClick={() => URL.revokeObjectURL(url)}
          aria-disabled={isFetchingBlocks || baseTree.length < 1}
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
          className="cursor-pointer text-foreground"
          asChild
          aria-disabled={isFetchingBlocks || baseTree.length < 1}
        >
          <label
            htmlFor="export"
            className="aria-disabled:pointer-events-none aria-disabled:opacity-10"
          >
            <FileUp />
            <span>Importar</span>
          </label>
        </Button>
        <Dialog open={dialogOpen} onOpenChange={o => !isPending && setDialogOpen(o)}>
          <DialogContent className="border border-transparent shadow-shape h-fit bg-card">
            <DialogHeader className="font-semibold">Logs</DialogHeader>
            <Separator className="bg-muted-foreground" />
            <ScrollArea className="h-[calc(100vh-150px)]">
              <div className="flex flex-col gap-1">
                {isPending && (
                  // <Loader2 className="animate-spin" />
                  <div className="flex justify-between mx-4">
                    <Skeleton className="h-[20px] w-[250px] bg-muted-foreground rounded-sm" />
                    <div className="flex gap-2">
                      <Skeleton className="h-[20px] w-[50px] bg-muted-foreground rounded-sm" />
                      <Skeleton className="h-[20px] w-[60px] bg-muted-foreground rounded-sm" />
                    </div>
                  </div>
                )}
                {updateResult?.map(
                  reg => (
                    <div
                      key={reg.value.id}
                      className="flex justify-between mx-4 text-xs text-muted-foreground font-mono"
                    >
                      <span className="">{reg.value.ptDisplay}</span>
                      <div className="space-x-2">
                        <span>{reg.value.value}</span>
                        {reg.isSuccess ? (
                          <Badge className="opacity-80">Sucesso</Badge>
                        ) : (
                          <Badge className="opacity-80" variant={'destructive'}>
                            {reg.error}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )
                  // <p>{reg.value.value} - {reg.isSuccess ? 'ok' : 'falha'}</p>
                )}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
