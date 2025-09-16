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
    console.log(integerValue)
  }

  switch (register['Tipo (Modbus)']) {
    case 'Holding register': {
      if (register.Tratamento === '32_ABCD') {
        const unsigned32 = integerValue >>> 0
        const low = unsigned32 & 0xffff
        const high = (unsigned32 >>> 16) & 0xffff

        try {
          await client?.writeRegisters(Number(register['Registrador (Modbus)']), [high, low])
          return { isSuccess: true }
        } catch (error) {
          console.log(error)
          return { isSuccess: false }
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
