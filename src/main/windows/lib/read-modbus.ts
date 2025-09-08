import type ModbusRTU from 'modbus-serial'
import type { BlockProps } from 'shared/types'

export async function readModbus(
  { block, registers, table, type }: BlockProps,
  client: ModbusRTU | null
) {
  function withTimeout<T>(promise: Promise<T>): Promise<T> {
    // eslint-disable-next-line promise/param-names
    const timeout = new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out')), 3000)
    )
    return Promise.race([promise, timeout])
  }

  let response: any

  if (!client) return

  if (type === 'Holding register') {
    response = await withTimeout(
      client.readHoldingRegisters(block.initial, block.quantity)
    )
  } else if (type === 'Coil') {
    response = await withTimeout(
      client.readCoils(block.initial, block.quantity)
    )
  } else if (type === 'Discrete input') {
    response = await withTimeout(
      client.readDiscreteInputs(block.initial, block.quantity)
    )
  } else if (type === 'Input register') {
    response = await withTimeout(
      client.readInputRegisters(block.initial, block.quantity)
    )
  }

  return response
}
