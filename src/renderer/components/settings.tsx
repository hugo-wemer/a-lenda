import { useReadings } from 'renderer/store/readings'
import { MenuTree } from './menu-tree'
import { useMemo } from 'react'

export function Settings() {
  const blocks = useReadings(store => store.blocks)
  const registers = useMemo(
    () => Array.from(blocks.values()).flatMap(({ registers }) => registers),
    [blocks]
  )

  return <MenuTree registers={registers} />
}
