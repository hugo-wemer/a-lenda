import fs from 'node:fs'
import { parse } from 'csv-parse'
import type { BlockProps, CsvProps } from 'shared/types'
import { X } from 'lucide-react'

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
        table: table,
        type: item['Tipo (Modbus)'],
        block: { initial: Number(item['Registrador (Modbus)']), quantity: 0 },
        registers: [],
      }
    }

    const registrador = {
      id: item.UUID,
      mode: item.Modo,
      treatment: item.Tratamento,
      lowLimit: item['Limite inferior'],
      highLimit: item['Limite superior'],
      defaultValue: item['Valor default'],
      divisor: item.Divisor,
      ptUnit: item['Unidade pt'],
      enUnit: item['Unidade en'],
      ptConversion: item['Conversão pt'],
      enConversion: item['Conversão en'],
      ptDescription: item['Descrição pt'],
      enDescription: item['Descrição en'],
      ptGroup: item['Grupo pt'],
      enGroup: item['Grupo en'],
      ptDisplay: item['Display pt'],
      enDisplay: item['Display en'],
    }

    tables[table].registers.push(registrador)
  }

  for (const key in tables) {
    const initial = tables[key].block.initial
    // const maxReg = Math.max(
    //   ...tables[key].registers.map(
    //     (_r: any, i: any) => initial + (_r.treatment === '32_ABCD' ? i * 2 : i)
    //   )
    // )
    let quantity = 0
    tables[key].registers.map((_r: any, i: any) => {
      if (_r.treatment === '32_ABCD') {
        quantity = quantity + 2
      } else {
        quantity++
      }
    })
    // const maxReg = Math.max(...tables[key].registers.map((_r: any, i: any) => initial + i))
    tables[key].block.quantity = quantity //maxReg - initial + 1
  }

  return Object.values(tables) as BlockProps[]
}
