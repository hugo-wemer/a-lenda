import { useEffect, useMemo, useState } from 'react'
import type { RegisterReadingsResponse } from 'shared/types'
import { ScrollArea } from './ui/scroll-area'
import { Loader2 } from 'lucide-react'
import { useReadings } from 'renderer/store/readings'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'

export function ReadingsTable({
  isFetchingBlocks,
}: {
  isFetchingBlocks: boolean
}) {
  const blocks = useReadings(store => store.blocks)

  const registers = useMemo(
    () => Array.from(blocks.values()).flatMap(({ registers }) => registers),
    [blocks]
  )

  return (
    <div className="flex h-full min-h-0 flex-col p-2">
      <div className="relative flex-1 min-h-0 overflow-hidden rounded-md border border-muted-foreground">
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
              {registers.map(register => (
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
