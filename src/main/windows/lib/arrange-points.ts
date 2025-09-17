import type { BlockProps, BlockReadingResponse, RegisterReadingsResponse } from 'shared/types'
import { parseConversionString } from './parse-conversion-string'

export function interpretConversion(
  value: string | number,
  conversion: string | null | undefined,
  divisor: string | number
): string {
  if (conversion == null || String(conversion).trim() === '')
    return (Number(value) / Number(divisor)).toString()
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

function interpret32ABCD(value: (number | boolean)[], divisor: string, minimumValue: string) {
  console.log(value)
  const high = value[0].toString(2)
  const low = value[1].toString(2)
  const intValue = Number.parseInt(high + low, 2)
  if (Number(minimumValue) < 0) {
    const unSigned = intValue >>> 0
    return (
      (unSigned & 0x80000000 ? unSigned - 0x100000000 : unSigned) / Number(divisor)
    ).toString()
  }

  // console.log((intValue / Number(divisor)).toString())
  return (intValue / Number(divisor)).toString()
}

function interpretValue({
  minimumValue,
  conversion,
  readings,
  index,
  divisor,
  treatment,
}: {
  minimumValue: string
  conversion: string | null
  readings: (number | boolean)[]
  index: number
  divisor: string
  treatment: string
}) {
  if (conversion !== '') {
    return interpretConversion(Number(readings[index]), conversion, divisor)
  }
  if (treatment === '32_ABCD') {
    return interpret32ABCD([readings[index], readings[index + 1]], divisor, minimumValue)
  }
  if (Number(minimumValue) < 0) {
    const unSignedInt = Number(readings[index]) & 0xffff
    return (
      (unSignedInt & 0x8000 ? unSignedInt - 0x10000 : unSignedInt) / Number(divisor)
    ).toString()
  }
  return (Number(readings[index]) / Number(divisor)).toString()
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
  let idx = 0
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
      ptValue: interpretValue({
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        minimumValue: register.lowLimit!,
        conversion: register.ptConversion,
        divisor: register.divisor,
        index: idx,
        readings: reading,
        treatment: register.treatment,
      }), //interpretConversion(Number(reading[index]), register.ptConversion, register.divisor),
      enValue: interpretValue({
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        minimumValue: register.lowLimit!,
        conversion: register.enConversion,
        divisor: register.divisor,
        index: idx,
        readings: reading,
        treatment: register.treatment,
      }), //interpretConversion(Number(reading[index]), register.enConversion, register.divisor),
      divisor: register.divisor,
      ptConversion: { options: parseConversionString(register.ptConversion || '') },
      enConversion: { options: parseConversionString(register.enConversion || '') },
      ptGroup: register.ptGroup,
      enGroup: register.enGroup,
      ptDisplay: register.ptDisplay,
      enDisplay: register.enDisplay,
    })
    if (register.treatment === '32_ABCD') {
      idx = idx + 2
    } else {
      idx = idx + 1
    }
  })

  return {
    block: block.table,
    registers: response,
  }
}
