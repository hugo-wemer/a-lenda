import { ChevronRightIcon, Cog, FolderCog } from 'lucide-react'
import { groupRegistersByPtDisplay, type MenuNode } from 'renderer/lib/group-registers-by-ptDisplay'
import type { RegisterReadingsResponse } from 'shared/types'
import { Badge } from './badge'
import { useDeferredValue, useMemo, useState } from 'react'
import { Input } from './input'
import { ScrollArea } from './scroll-area'

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')

type UINode = MenuNode & { nodes?: UINode[]; register?: RegisterReadingsResponse }

function filterTree(
  nodes: UINode[],
  deferredQuery: string,
  parentPath = ''
): { pruned: UINode[]; autoExpand: Set<string> } {
  const autoExpand = new Set<string>()
  const search = normalize(deferredQuery)
  const tokens = search.split(/\s+/).filter(Boolean)

  const matchesTokens = (hay: string) => tokens.length === 0 || tokens.every(t => hay.includes(t))

  const walk = (node: UINode, path: string): UINode | null => {
    const isFolder = Array.isArray(node.nodes) && node.nodes.length > 0
    const selfHay = normalize(`${node.name} ${path}`)

    if (isFolder) {
      const keptChildren: UINode[] = []
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      for (const child of node.nodes!) {
        const childPath = path ? `${path}/${child.name}` : child.name
        const prunedChild = walk(child, childPath)
        if (prunedChild) keptChildren.push(prunedChild)
      }

      const folderMatches = matchesTokens(selfHay)
      if (keptChildren.length > 0 || folderMatches) {
        // se algum descendente bateu, auto-expande este nó
        if (keptChildren.length > 0 && tokens.length > 0) autoExpand.add(path || node.name)
        return { ...node, nodes: keptChildren }
      }
      return null
    }
    const reg = node.register
    const hay = normalize(
      `${node.name} ${path} ${reg?.ptDescription ?? ''} ${reg?.enDescription ?? ''} ${reg?.ptValue ?? ''} ${reg?.ptUnit ?? ''}`
    )
    return matchesTokens(hay) ? node : null
  }

  const pruned: UINode[] = []
  for (const n of nodes) {
    const path = parentPath ? `${parentPath}/${n.name}` : n.name
    const kept = walk(n, path)
    if (kept) pruned.push(kept)
  }
  return { pruned, autoExpand }
}

export function SettinsTree({ registers }: { registers: RegisterReadingsResponse[] }) {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)
  const baseTree = useMemo(() => groupRegistersByPtDisplay(registers), [registers])
  const { pruned } = useMemo(
    () => filterTree(baseTree as UINode[], deferredQuery),
    [baseTree, deferredQuery]
  )

  return (
    <div className="space-y-2">
      <div className="">
        <Input
          placeholder="Busque por menu, caminho ou descrição"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Escape' && setQuery('')}
          className=""
        />
      </div>
      <ScrollArea className="h-[calc(100vh-130px)] bg-card overflow-hidden rounded-md border border-muted-foreground">
        <ul className="bg-card border-muted">
          <li className="my-1.5">
            <ul className="px-2">
              {pruned.map(node => (
                <Node node={node} key={node.name} />
              ))}
            </ul>
          </li>
        </ul>
      </ScrollArea>
    </div>
  )
}

function Node({ node }: { node: MenuNode }) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <li key={node.name} className="my-1.5">
      <div className="flex">
        {node.nodes ? (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex gap-1.5 items-center cursor-pointer hover:bg-muted-foreground px-1 rounded"
          >
            <ChevronRightIcon
              className={`size-4 text-foreground/30 ${isOpen ? 'rotate-90' : ''}`}
            />
            <FolderCog className="text-foreground/30 size-5" />
            <p>{node.name}</p>
          </button>
        ) : (
          <button
            onClick={() => console.log(node.register)}
            className="flex justify-between w-full ml-4 cursor-pointer hover:bg-muted-foreground pl-2 pr-1 rounded"
          >
            <div className="flex gap-1 items-center">
              <Cog className="text-primary size-5" />
              <p>{node.name}</p>
            </div>
            <Badge className="bg-muted-foreground text-foreground">{node.register?.ptValue}</Badge>
          </button>
        )}
      </div>

      {isOpen && (
        <ul className="pl-4">
          {node.nodes?.map(node => (
            <Node node={node} key={node.name} />
          ))}
        </ul>
      )}
    </li>
  )
}
