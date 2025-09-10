import type ModbusRTU from 'modbus-serial'
import type {
  ReadCoilResult,
  ReadRegisterResult,
} from 'modbus-serial/ModbusRTU'
import type { BlockProps } from 'shared/types'

export async function readModbus(
  { block, registers, table, type }: BlockProps,
  client: ModbusRTU | null
) {
  let response: ReadRegisterResult | ReadCoilResult | undefined

  if (!client) return

  try {
    switch (type) {
      case 'Holding register':
        response = await client.readHoldingRegisters(
          block.initial,
          block.quantity
        )
        return response.data
      case 'Coil':
        response = await client.readCoils(block.initial, block.quantity)
        return response.data
      case 'Discrete input':
        response = await client.readDiscreteInputs(
          block.initial,
          block.quantity
        )
        return response.data
      case 'Input register':
        response = await client.readInputRegisters(
          block.initial,
          block.quantity
        )
        return response.data
    }
  } catch (error) {
    return undefined
  }
}
