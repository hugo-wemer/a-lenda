import { app, ipcMain } from 'electron'
import { listPorts } from './lib/list-ports'
import { IPC } from 'shared/constants'
import { getConfigFile, updateCsvFile } from './lib/s3-client'
import { store } from './lib/store'
import type {
  ConnectionCloseResponse,
  ConnectionCreateResponse,
  ConnectionFormType,
  FetchCsvRequest,
} from 'shared/types'
import path from 'node:path'
import { organizeCsvInBlocks, readCsv } from './lib/csv-parsing'
import ModbusRTU from 'modbus-serial'

let client: ModbusRTU | null = null
let csv: any[]

export function getUserDataDir() {
  const base = app.getPath('userData')
  return path.join(base, 'maps')
}

ipcMain.handle(IPC.APP_VERSION.UPDATE, async (): Promise<any> => {
  try {
    const response = await getConfigFile()
    const mostRecentVersion = response.version
    const currentVersion = store.get('version')
    if (mostRecentVersion > currentVersion) {
      store.set('equipments', response.equipments)
      store.set('version', response.version)
      Object.values(response.equipments).map(map => {
        updateCsvFile(map.name, map.branch)
      })
    }
    return
  } catch {
    return
  }
})

ipcMain.handle(IPC.APP_VERSION.FETCH, async (): Promise<number> => {
  const response = store.get('version')
  return response
})

ipcMain.handle(IPC.PORTS.FETCH, async (): Promise<any> => {
  const ports = await listPorts()
  return ports
})

ipcMain.handle(IPC.EQUIPMENTS.FETCH, async (): Promise<any> => {
  const response = store.get('equipments')
  return response
})

ipcMain.handle(IPC.CSV.FETCH, async (_, req: FetchCsvRequest): Promise<any> => {
  const destDir = path.join(getUserDataDir(), req.equipment)
  const finalPath = path.join(destDir, `mapa_${req.firmwareVersion}.csv`)
  csv = await readCsv(finalPath)
  const blocks = organizeCsvInBlocks(csv)
  return csv
})

ipcMain.handle(
  IPC.CONNECT.CREATE,
  async (_, req: ConnectionFormType): Promise<ConnectionCreateResponse> => {
    try {
      const blocks = organizeCsvInBlocks(csv)
      client = new ModbusRTU()
      await client.connectRTUBuffered(req.port, {
        baudRate: req.baudrate,
        dataBits: req.dataBits,
        parity: req.parity,
        stopBits: req.stopBits,
      })
      client.setTimeout(req.timeout)
      client.setID(req.address)
      return { isSuccess: true }
    } catch (error) {
      return { isSuccess: false, message: error as Error }
    }
  }
)

ipcMain.handle(
  IPC.CONNECT.DELETE,
  async (): Promise<ConnectionCloseResponse> => {
    try {
      client?.close()
      return { isSuccess: true }
    } catch (error) {
      return { isSuccess: false, message: error as Error }
    }
  }
)
