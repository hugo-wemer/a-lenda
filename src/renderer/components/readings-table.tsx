import { useDeferredValue, useMemo, useState } from 'react'
import { ScrollArea } from './ui/scroll-area'
import { Download, Loader2, RefreshCcw } from 'lucide-react'
import { useReadings } from 'renderer/store/readings'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { createCsv } from 'renderer/lib/create-csv'

export const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')

export function ReadingsTable({
  isFetchingBlocks,
}: {
  isFetchingBlocks: boolean
}) {
  const blocks = useReadings(store => store.blocks)
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)

  const registers = useMemo(
    () => Array.from(blocks.values()).flatMap(({ registers }) => registers),
    [blocks]
  )

  const filtered = useMemo(() => {
    const search = normalize(deferredQuery)
    if (!search) return registers

    const tokens = search.split(/\s+/).filter(Boolean)
    return registers.filter(r => {
      const hay = normalize(
        `${r.ptDescription ?? ''} ${r.enDescription ?? ''} ${r.ptDisplay ?? ''} ${r.enDisplay ?? ''}`
      )
      return tokens.every(t => hay.includes(t))
    })
  }, [registers, deferredQuery])

  const url = createCsv(registers)

  return (
    <div className="flex h-full min-h-0 flex-col p-2 gap-2">
      <div>
        <div className="flex gap-2">
          <Input
            placeholder={'Busque por uma descrição'}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Escape' && setQuery('')} // Esc limpa
            className="pl-3"
          />

          <Button
            onClick={async () => await window.App.readingFetch()}
            size="icon"
            variant={'secondary'}
            className="cursor-pointer hover:bg-muted-foreground/50"
          >
            <RefreshCcw />
          </Button>
          <Button
            asChild
            size="icon"
            variant={'secondary'}
            className="cursor-pointer hover:bg-muted-foreground/50"
            // onClick={() => createCsv(registers)}
          >
            <a href={url} download>
              <Download />
            </a>
          </Button>
        </div>
      </div>
      <div className="relative flex-1 min-h-0 overflow-hidden rounded-md border border-muted-foreground">
        <ScrollArea className="h-[calc(100vh-140px)]">
          <Table className="w-full table-fixed bg-card">
            <colgroup>
              <col className="w-6" />
              <col />
              <col className="w-28" />
              <col className="w-28" />
            </colgroup>

            <TableHeader className="">
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-9 py-1" />
                <TableHead className="h-9 py-2">Descrição</TableHead>
                <TableHead className="h-9 py-2">Valor</TableHead>
                <TableHead className="h-9 py-2">Unidade</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.map(register => (
                <TableRow
                  key={register.id}
                  // className={`${register.mode === 'RW' && 'cursor-pointer'}`}
                >
                  <TableCell className="py-2">
                    <div
                      className={`size-2 rounded-full ${
                        register.readSuccess ? 'bg-primary' : 'bg-destructive'
                      }`}
                    />
                  </TableCell>

                  <TableCell className="py-2 text-xs whitespace-normal break-words">
                    {register.ptDescription}
                  </TableCell>

                  <TableCell
                    className={`py-2 text-xs ${register.outOfLimit && 'text-destructive'} ${!register.readSuccess && 'text-muted-foreground'}`}
                  >
                    {register.ptValue}
                  </TableCell>

                  <TableCell className="py-2 text-xs">{register.ptUnit}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
        {isFetchingBlocks && (
          <div className="absolute bottom-0 bg-gradient-to-t from-background via-background/80 to-background/0 w-full h-30 flex flex-col items-center justify-end py-8 text-muted-foreground">
            <Loader2 className="animate-spin" />
            <span className="text-sm">Carregando pontos...</span>
          </div>
        )}
      </div>
    </div>
  )
}
