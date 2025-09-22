import { ChevronRightIcon, Cog, FolderCog, RefreshCcw } from 'lucide-react'
import type { MenuNode } from 'renderer/lib/group-registers-by-ptDisplay'
import type { RegisterReadingsResponse } from 'shared/types'
import { Badge } from './badge'
import { useDeferredValue, useMemo, useState } from 'react'
import { Input } from './input'
import { ScrollArea } from './scroll-area'
import { Button } from './button'
import { useLanguage } from 'renderer/store/language'

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

export function SettinsTree({
  setSelectedSetting,
  baseTree,
}: {
  setSelectedSetting: React.Dispatch<React.SetStateAction<RegisterReadingsResponse | undefined>>
  baseTree: MenuNode[]
}) {
  const language = useLanguage(s => s.language)
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)

  const { pruned } = useMemo(
    () => filterTree(baseTree as UINode[], deferredQuery),
    [baseTree, deferredQuery]
  )

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        <Input
          placeholder={
            language === 'en-US'
              ? 'Search for a menu of description'
              : 'Busque por menu ou descrição'
          }
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Escape' && setQuery('')}
          className=""
        />
        <Button
          onClick={async () => await window.App.readingFetch()}
          size={'icon'}
          variant={'secondary'}
          className="cursor-pointer hover:bg-muted-foreground/50"
        >
          <RefreshCcw />
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-130px)] bg-card overflow-hidden rounded-md border border-muted-foreground">
        <ul className="bg-card border-muted">
          <li className="my-1.5">
            <ul className="px-2">
              {pruned.map(node => (
                <Node
                  setSelectedSetting={setSelectedSetting}
                  node={node}
                  key={node.name}
                  path={node.name}
                  language={language}
                />
              ))}
            </ul>
          </li>
        </ul>
      </ScrollArea>
    </div>
  )
}

function Node({
  node,
  path,
  setSelectedSetting,
  language,
}: {
  node: MenuNode
  path: string
  setSelectedSetting: React.Dispatch<React.SetStateAction<RegisterReadingsResponse | undefined>>
  language: string
}) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <li className="my-1.5">
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
            onClick={() =>
              node.register &&
              setSelectedSetting({
                enDescription: node.register.enDescription,
                enDisplay: node.name,
                enValue: node.register.enValue,
                divisor: node.register.divisor,
                ptConversion: node.register.ptConversion,
                enConversion: node.register.enConversion,
                id: node.register.id,
                mode: node.register.mode,
                outOfLimit: node.register.outOfLimit,
                ptDescription: node.register.ptDescription,
                ptDisplay: node.name,
                value: node.register.value,
                ptValue: node.register.ptValue,
                readSuccess: node.register.readSuccess,
                enGroup: node.register.enGroup,
                enUnit: node.register.enUnit,
                ptGroup: node.register.ptGroup,
                ptUnit: node.register.ptUnit,
              })
            }
            className="flex justify-between w-full ml-4 cursor-pointer hover:bg-muted-foreground pl-2 pr-1 rounded"
          >
            <div className="flex gap-1 items-center">
              <Cog className="text-primary size-5" />
              <p>{node.name}</p>
            </div>
            <Badge className="bg-muted-foreground text-foreground">
              {language === 'en-US' ? node.register?.enValue : node.register?.ptValue}
            </Badge>
          </button>
        )}
      </div>
      {isOpen && (
        <ul className="pl-4">
          {node.nodes?.map(node => {
            const childPath = `${path}/${node.name}`
            return (
              <Node
                setSelectedSetting={setSelectedSetting}
                node={node}
                key={childPath}
                path={childPath}
              />
            )
          })}
        </ul>
      )}
    </li>
  )
}
