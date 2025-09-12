import { useTree } from '@headless-tree/react'
import { hotkeysCoreFeature, syncDataLoaderFeature } from '@headless-tree/core'
import { Tree, TreeItem, TreeItemLabel } from './ui/tree'
import { useReadings } from 'renderer/store/readings'
import { useMemo, useState } from 'react'
import {
  type MenuNode,
  type ParamLeaf,
  registersToTreeAdapter,
} from 'renderer/lib/registers-to-tree-adapter'
import type { RegisterReadingsResponse } from 'shared/types'
type ItemData = MenuNode | ParamLeaf
const isMenuNode = (n: ItemData): n is MenuNode => 'children' in n

export function MenuTree({
  registers,
}: { registers: RegisterReadingsResponse[] }) {
  const items = registersToTreeAdapter(registers, {
    rootKey: '__root__',
    rootLabel: 'Parâmetros',
  })
  const rootId = '__root__'
  const indent = 20

  const tree = useTree<any>({
    initialState: {
      expandedItems: [rootId],
    },
    indent,
    rootItemId: rootId,
    getItemName: item => {
      const d = item.getItemData()
      if (isMenuNode(d)) return d.name
      const full = d.ptDisplay ?? d.name ?? ''
      const last = full.split('/').filter(Boolean).pop()
      return last || d.name
    },
    isItemFolder: item => (item.getItemData()?.children?.length ?? 0) > 0,
    dataLoader: {
      getItem: itemId => items[itemId],
      getChildren: itemId => {
        const node = items[itemId]
        return isMenuNode(node) ? node.children : []
      },
    },
    features: [syncDataLoaderFeature, hotkeysCoreFeature],
  })

  return (
    <div className="flex h-full flex-col gap-2 *:first:grow">
      <div>
        <Tree
          className="relative before:absolute before:inset-0 before:-ms-1 before:bg-[repeating-linear-gradient(to_right,transparent_0,transparent_calc(var(--tree-indent)-1px),var(--muted-foreground)_calc(var(--tree-indent)-1px),var(--muted-foreground)_calc(var(--tree-indent)))]"
          indent={indent}
          tree={tree}
        >
          {tree.getItems().map(item => {
            return (
              <TreeItem key={item.getId()} item={item}>
                <TreeItemLabel className="before:bg-background relative before:absolute before:inset-x-0 before:-inset-y-0.5 before:-z-10" />
              </TreeItem>
            )
          })}
        </Tree>
      </div>
    </div>
  )
}
