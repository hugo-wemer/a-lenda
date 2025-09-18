import { json2csv } from 'json-2-csv'

export function createCsv(data: any[], filename = './leituras.csv') {
  const csv = json2csv(data, {
    delimiter: { field: ';' },
  })
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
  return URL.createObjectURL(blob)
}
