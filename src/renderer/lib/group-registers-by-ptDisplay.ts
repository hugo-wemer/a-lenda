import type { RegisterReadingsResponse } from 'shared/types'

export type LeafRegister = Omit<RegisterReadingsResponse, 'ptDisplay' | 'enDisplay'>

export type MenuNode = {
  name: string
  nodes?: MenuNode[]
  register?: LeafRegister
  isExpanded?: boolean
  isHighlighed?: boolean
}

// ---------------- core ----------------
export function groupRegistersByPtDisplay(
  registers: RegisterReadingsResponse[],
  opts: { sort?: boolean } = { sort: true }
): MenuNode[] {
  type Tmp = { node: MenuNode; kids: Map<string, Tmp> }
  const root = new Map<string, Tmp>()

  const strip = (r: RegisterReadingsResponse): LeafRegister => {
    // remove ptDisplay/enDisplay do objeto que vai na folha
    const { ptDisplay, enDisplay, ...rest } = r
    return rest
    // se preferir manter só alguns campos, selecione-os aqui
  }

  for (const r of registers) {
    if (!r.ptDisplay) continue // ignora sem caminho
    const parts = r.ptDisplay
      .split('/')
      .map(s => s.trim())
      .filter(Boolean)
    if (!parts.length) continue

    let level = root
    let tmp: Tmp | undefined

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      tmp = level.get(part)
      if (!tmp) {
        tmp = {
          node: { name: part, nodes: [] },
          kids: new Map<string, Tmp>(),
        }
        level.set(part, tmp)
      }

      const isLeaf = i === parts.length - 1
      if (isLeaf) {
        // transforma em folha
        tmp.node.nodes = undefined
        tmp.node.register = strip(r)
      } else {
        // garante estrutura de pasta e desce um nível
        if (tmp.node.nodes === null) tmp.node.nodes = []
        level = tmp.kids
      }
    }
  }

  const toArray = (m: Map<string, Tmp>): MenuNode[] => {
    const arr: MenuNode[] = []
    for (const [, t] of m) {
      if (t.node.nodes !== null) {
        // nó interno: converte recursivamente
        const kidsArr = toArray(t.kids)
        t.node.nodes = kidsArr.length ? kidsArr : undefined
      }
      arr.push(t.node)
    }
    if (opts.sort) arr.sort((a, b) => a.name.localeCompare(b.name))
    return arr
  }

  return toArray(root)
}
