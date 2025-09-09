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
  // function withTimeout<T>(promise: Promise<T>): Promise<T> {
  //   // eslint-disable-next-line promise/param-names
  //   const timeout = new Promise<T>((_, reject) =>
  //     setTimeout(() => reject(new Error('Request timed out')), 500)
  //   )
  //   return Promise.race([promise, timeout])
  // }

  let response: ReadRegisterResult | ReadCoilResult

  if (!client) return

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
      response = await client.readDiscreteInputs(block.initial, block.quantity)
      return response.data
    case 'Input register':
      response = await client.readInputRegisters(block.initial, block.quantity)
      return response.data
  }

  // if (type === 'Holding register') {
  //   // response = await withTimeout(
  //   response = await client.readHoldingRegisters(block.initial, block.quantity)
  //   return response.data
  //   // )
  // }
  // if (type === 'Coil') {
  //   // response = await withTimeout(
  //   response = await client.readCoils(block.initial, block.quantity)
  //   return response.data
  //   // )
  // }
  // if (type === 'Discrete input') {
  //   // response = await withTimeout(
  //   response = await client.readDiscreteInputs(block.initial, block.quantity)
  //   return response.data
  //   // )
  // }
  // if (type === 'Input register') {
  //   // response = await withTimeout(
  //   response = await client.readInputRegisters(block.initial, block.quantity)
  //   return response.data
  //   // )
  // }
}
