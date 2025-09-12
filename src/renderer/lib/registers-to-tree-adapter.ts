import type { RegisterReadingsResponse } from 'shared/types'

export type MenuNode = {
  name: string
  children: string[]
}

export type ParamLeaf = {
  name: string
  id: string
  readSuccess: boolean
  mode: string
  outOfLimit: boolean
  ptUnit?: string | null
  enUnit?: string | null
  ptDescription: string
  enDescription: string
  ptValue: string
  enValue: string
  ptDisplay: string | null
  enDisplay: string | null
}

export type ItemsRecord = Record<string, MenuNode | ParamLeaf>

function slugify(s: string) {
  return (
    s
      .normalize('NFKD')
      // biome-ignore lint/suspicious/noMisleadingCharacterClass: <explanation>
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') // trim
      .toLowerCase()
  )
}

export function registersToTreeAdapter(
  registers: RegisterReadingsResponse[],
  options?: { rootKey?: string; rootLabel?: string }
): ItemsRecord {
  const rootKey = options?.rootKey ?? '__root__'
  const rootLabel = options?.rootLabel ?? 'Parâmetros'

  const filteredRegs = registers.filter(register => register.ptDisplay)

  const items: ItemsRecord = {
    [rootKey]: { name: rootLabel, children: [] },
  }

  const childrenSets = new Map<string, Set<string>>()
  childrenSets.set(rootKey, new Set<string>())

  for (const reg of filteredRegs) {
    const path = (reg.ptDisplay ?? '')
      .split('/')
      .map(s => s.trim())
      .filter(Boolean)

    const effectivePath = path.length
      ? path
      : ['Sem categoria', reg.ptDescription || reg.id]

    const slugParts: string[] = []
    let parentKey = rootKey

    for (let i = 0; i < effectivePath.length; i++) {
      const seg = effectivePath[i]
      slugParts.push(slugify(seg))
      const key = slugParts.join('__')

      const isLeaf = i === effectivePath.length - 1

      if (!(key in items)) {
        if (isLeaf) {
          items[key] = {
            name: reg.ptDisplay?.trim()
              ? reg.ptDisplay
              : effectivePath.join('/'),
            id: reg.id,
            readSuccess: reg.readSuccess,
            mode: reg.mode,
            outOfLimit: reg.outOfLimit,
            ptUnit: reg.ptUnit,
            enUnit: reg.enUnit,
            ptDescription: reg.ptDescription,
            enDescription: reg.enDescription,
            ptValue: reg.ptValue,
            enValue: reg.enValue,
            ptDisplay: reg.ptDisplay,
            enDisplay: reg.enDisplay,
          }
        } else {
          items[key] = {
            name: seg,
            children: [],
          } as MenuNode
          childrenSets.set(key, new Set<string>())
        }
      } else {
      }

      if (!childrenSets.has(parentKey))
        childrenSets.set(parentKey, new Set<string>())
      childrenSets.get(parentKey)?.add(key)

      parentKey = key
    }
  }

  for (const [parent, set] of childrenSets.entries()) {
    const node = items[parent] as MenuNode
    if (node && 'children' in node) {
      node.children = Array.from(set)
    }
  }

  return items
}
