import { useTree } from '@headless-tree/react'
import { expandAllFeature, hotkeysCoreFeature, syncDataLoaderFeature } from '@headless-tree/core'
import { Tree, TreeItem, TreeItemLabel } from './ui/tree'
import { type MenuNode, registersToTreeAdapter } from 'renderer/lib/registers-to-tree-adapter'
import type { RegisterReadingsResponse } from 'shared/types'
import { Button } from './ui/button'
import { ListTreeIcon } from 'lucide-react'
import { useDeferredValue, useMemo, useState } from 'react'
import { Input } from './ui/input'
import { normalize } from './readings-table'
export type ItemData = MenuNode | RegisterReadingsResponse
const isMenuNode = (n: ItemData): n is MenuNode => 'children' in n

export function MenuTree({
  registers,
  setSelectedSetting,
}: {
  registers: RegisterReadingsResponse[]
  setSelectedSetting: React.Dispatch<React.SetStateAction<RegisterReadingsResponse | undefined>>
}) {
  const [isMenuExpanded, setIsMenuExpanded] = useState(true)
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)
  const filtered = useMemo(() => {
    const q = normalize(deferredQuery).trim()
    if (!q) return registers

    return registers.filter(r =>
      normalize(
        `${r.ptDescription ?? ''} ${r.enDescription ?? ''} ${r.ptGroup ?? ''} ${r.enGroup ?? ''}`
      ).includes(q)
    )
  }, [registers, deferredQuery])

  const items = registersToTreeAdapter(filtered, {
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
    features: [syncDataLoaderFeature, hotkeysCoreFeature, expandAllFeature],
  })

  function handleExpandAndCollapse() {
    isMenuExpanded ? tree.collapseAll() : tree.expandAll()
    setIsMenuExpanded(!isMenuExpanded)
  }

  return (
    <div className="flex h-full flex-col gap-2 *:first:grow py-4 px-2">
      <div>
        <div className="flex mb-2 gap-2">
          <Input
            placeholder="Pesquise um parâmetro"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Escape' && setQuery('')}
          />
          <Button
            className="bg-muted-foreground/50 text-foreground hover:bg-muted-foreground cursor-pointer"
            size={'icon'}
            onClick={handleExpandAndCollapse}
          >
            <ListTreeIcon />
          </Button>
        </div>
        <Tree
          className="relative before:absolute before:inset-0 before:-ms-1 before:bg-[repeating-linear-gradient(to_right,transparent_0,transparent_calc(var(--tree-indent)-1px),var(--muted-foreground)_calc(var(--tree-indent)-1px),var(--muted-foreground)_calc(var(--tree-indent)))]"
          indent={indent}
          tree={tree}
        >
          {tree.getItems()?.map(item => {
            return (
              <TreeItem key={item.getId()} item={item}>
                <TreeItemLabel
                  onClick={() => setSelectedSetting(item.getItemData())}
                  className="font-semibold hover:text-lime-950 hover:bg-primary/80 cursor-pointer before:bg-card relative before:absolute before:inset-x-0 before:-inset-y-0.5 before:-z-10"
                />
              </TreeItem>
            )
          })}
        </Tree>
      </div>
    </div>
  )
}
