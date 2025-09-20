import type ModbusRTU from 'modbus-serial'
import type { CsvProps } from 'shared/types'
import { fromModbusCode } from './from-modbus-code'

export async function writeModbus({
  register,
  client,
  value,
  bypassMultiplyer = false,
}: { register: CsvProps; client: ModbusRTU | null; value: string; bypassMultiplyer?: boolean }) {
  let integerValue = bypassMultiplyer ? Number(value) : Number(value) * Number(register.Divisor)
  const allowNegativeValues = Number(register['Limite inferior']) < 0
  if (allowNegativeValues) {
    integerValue = integerValue & 0xffff
  }

  switch (register['Tipo (Modbus)']) {
    case 'Holding register': {
      if (register.Tratamento === '32_ABCD') {
        const unsigned32 = integerValue >>> 0
        const low = unsigned32 & 0xffff
        const high = (unsigned32 >>> 16) & 0xffff

        try {
          // console.log({ reg: Number(register['Registrador (Modbus)']), vals: [high, low] })
          const response = await client?.writeRegisters(Number(register['Registrador (Modbus)']), [
            high,
            low,
          ])
          return { isSuccess: true }
        } catch (error) {
          return { isSuccess: false, error: fromModbusCode(error) }
        }
      }
      try {
        const response = await client?.writeRegister(
          Number(register['Registrador (Modbus)']),
          integerValue
        )
        if (response?.value === integerValue) {
          return { isSuccess: true }
        }
        return { isSuccess: false }
      } catch (error) {
        return { isSuccess: false, error: fromModbusCode(error) }
      }
    }
    case 'Coil': {
      try {
        const response = await client?.writeCoil(
          Number(register['Registrador (Modbus)']),
          !!integerValue
        )
        if (response?.state === !!integerValue) {
          return { isSuccess: true }
        }
        return { isSuccess: false }
      } catch (error) {
        return { isSuccess: false, error: fromModbusCode(error) }
      }
    }
  }
  return { isSuccess: false }
}
