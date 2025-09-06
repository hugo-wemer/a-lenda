import fs from 'node:fs'
import { parse } from 'csv-parse'
import type { CsvProps } from 'shared/types'

export async function readCsv(path: string) {
  const records = []
  const parser = fs.createReadStream(path).pipe(
    parse({
      delimiter: ';',
      encoding: 'latin1',
      columns: true,
    })
  )
  for await (const record of parser) {
    records.push(record)
  }

  const filteredCsv = records.filter(register => register.UUID !== '')
  return filteredCsv
}

export function organizeCsvInBlocks(csv: CsvProps[]) {
  const tables: Record<string, any> = {}
  for (const item of csv) {
    const table = item['Tabela (Modbus)'].trim()
    if (!tables[table]) {
      tables[table] = {
        'Tabela (Modbus)': table,
        'Tipo (Modbus)': item['Tipo (Modbus)'],
        Bloco: { inicial: Number(item['Registrador (Modbus)']), quantidade: 0 },
        Registradores: [],
      }
    }

    const registrador = {
      UUID: item.UUID,
      Modo: item.Modo,
      Tratamento: item.Tratamento,
      'Limite inferior': item['Limite inferior'],
      'Limite superior': item['Limite superior'],
      'Valor default': item['Valor default'],
      Divisor: item.Divisor,
      'Unidade pt': item['Unidade pt'],
      'Unidade en': item['Unidade en'],
      'Conversão pt': item['Conversão pt'],
      'Conversão en': item['Conversão en'],
      'Descrição pt': item['Descrição pt'],
      'Descrição en': item['Descrição en'],
      'Grupo pt': item['Grupo pt'],
      'Grupo en': item['Grupo en'],
    }

    tables[table].Registradores.push(registrador)
  }

  for (const key in tables) {
    const inicial = tables[key].Bloco.inicial
    const maxReg = Math.max(
      ...tables[key].Registradores.map((_r: any, i: any) => inicial + i)
    )
    tables[key].Bloco.quantidade = maxReg - inicial + 1
  }

  return Object.values(tables)
}
