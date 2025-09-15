import type { BlockProps, BlockReadingResponse, RegisterReadingsResponse } from 'shared/types'
import { parseConversionString } from './parse-conversion-string'

export function interpretConversion(
  value: string | number,
  conversion: string | null | undefined,
  divisor: string | number
): string {
  if (conversion == null || String(conversion).trim() === '')
    return (Number(value) / Number(divisor)).toString()
  // return (value.toString())
  const pairs = conversion.split(/\\+/)

  const valueStr = String(value).trim()
  const valueNum = Number(valueStr)
  const valueIsNum = !Number.isNaN(valueNum)

  for (const raw of pairs) {
    if (!raw) continue
    const [k, ...rest] = raw.split('=')
    if (k == null || rest.length === 0) continue

    const key = String(k).trim()
    const label = rest.join('=').trim()

    // Comparação por string
    if (key === valueStr) return label

    const keyNum = Number(key)
    if (valueIsNum && !Number.isNaN(keyNum) && keyNum === valueNum) {
      return label
    }
  }

  return value.toString()
}

export function arrangePoints(
  block: BlockProps,
  reading: Array<boolean | number> | undefined
): BlockReadingResponse {
  const response = [] as RegisterReadingsResponse[]
  if (!reading) {
    block.registers.map((register, index) => {
      response.push({
        id: register.id,
        readSuccess: false,
        mode: register.mode,
        outOfLimit: false,
        ptUnit: register.ptUnit,
        enUnit: register.enUnit,
        divisor: register.divisor,
        ptDescription: register.ptDescription,
        enDescription: register.enDescription,
        value: '0',
        ptValue: 'Indefinido',
        enValue: 'Undefined',
        ptGroup: register.ptGroup,
        enGroup: register.enGroup,
        ptDisplay: register.ptDisplay,
        enDisplay: register.enDisplay,
      })
    })
    return {
      block: block.table,
      registers: response,
    }
  }
  block.registers.map((register, index) => {
    response.push({
      id: register.id,
      readSuccess: true,
      mode: register.mode,
      outOfLimit: !!(
        Number(register.lowLimit) > Number(reading[index]) ||
        Number(register.highLimit) < Number(reading[index])
      ),
      ptUnit: register.ptUnit,
      enUnit: register.enUnit,
      ptDescription: register.ptDescription,
      enDescription: register.enDescription,
      value: reading[index].toString(),
      ptValue: interpretConversion(Number(reading[index]), register.ptConversion, register.divisor), //.replace('.', ','),
      enValue: interpretConversion(Number(reading[index]), register.enConversion, register.divisor),
      divisor: register.divisor,
      ptConversion: { options: parseConversionString(register.ptConversion || '') },
      enConversion: { options: parseConversionString(register.enConversion || '') },
      ptGroup: register.ptGroup,
      enGroup: register.enGroup,
      ptDisplay: register.ptDisplay,
      enDisplay: register.enDisplay,
    })
  })

  return {
    block: block.table,
    registers: response,
  }
}
