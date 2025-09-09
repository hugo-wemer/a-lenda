import { useEffect, useMemo, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'
import type {
  BlockReadingResponse,
  RegisterReadingsResponse,
} from 'shared/types'
import { ScrollArea } from './ui/scroll-area'

export function ReadingsTable() {
  const [blocks, setBlocks] = useState<Map<string, RegisterReadingsResponse[]>>(
    () => new Map()
  )

  const lastReading = useMemo(
    () => Array.from(blocks.values()).flat(),
    [blocks]
  )

  useEffect(() => {
    const off = window.App.onReadingUpdate((payload: BlockReadingResponse) => {
      setBlocks(prev => {
        const next = new Map(prev)
        next.set(payload.block, payload.registers)
        return next
      })
    })
    return () => off()
  }, [])

  return (
    <div className="flex h-full min-h-0 flex-col p-2">
      <div className="flex-1 min-h-0 overflow-hidden rounded-md border border-muted-foreground">
        <ScrollArea className="h-[calc(100vh-105px)]">
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
              {lastReading.map(register => (
                <TableRow key={register.id}>
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

                  <TableCell className="py-2 text-xs">
                    {register.ptValue}
                  </TableCell>

                  <TableCell className="py-2 text-xs">
                    {register.ptUnit}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  )
}
