import type ModbusRTU from 'modbus-serial'
import type { CsvProps } from 'shared/types'

export async function writeModbus({
  register,
  client,
  value,
}: { register: CsvProps; client: ModbusRTU | null; value: string }) {
  let integerValue = Number(value) * Number(register.Divisor)
  const allowNegativeValues = Number(register['Limite inferior']) < 0
  if (allowNegativeValues) {
    integerValue = integerValue & 0xffff
  }

  switch (register['Tipo (Modbus)']) {
    case 'Holding register': {
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
        console.log(error)
        return { isSuccess: false }
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
        return { isSuccess: false }
      }
    }
  }
  return { isSuccess: false }
}
