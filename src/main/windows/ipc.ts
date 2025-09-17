import { app, BrowserWindow, ipcMain } from 'electron'
import { listPorts } from './lib/list-ports'
import { IPC } from 'shared/constants'
import { getConfigFile, updateCsvFile } from './lib/s3-client'
import { store } from './lib/store'
import type {
  BlockProps,
  ConnectionCloseResponse,
  ConnectionCreateResponse,
  ConnectionFormType,
  CsvProps,
  FetchConnectionResponse,
  FetchCsvRequest,
  SettingsFetchRequest,
  SettingsFetchResponse,
  UpdateSettingRequest,
  UpdateSettingResponse,
} from 'shared/types'
import path from 'node:path'
import { organizeCsvInBlocks, readCsv } from './lib/csv-parsing'
import ModbusRTU from 'modbus-serial'
import { readModbus } from './lib/read-modbus'
import { arrangePoints } from './lib/arrange-points'
import { parseConversionString } from './lib/parse-conversion-string'
import { writeModbus } from './lib/write-modbus'

let client: ModbusRTU | null = null
let csv: any[]
let blocks: any[]
let isReading = false
let readTimer: NodeJS.Timeout | null = null
let inFlight = false

export function getUserDataDir() {
  const base = app.getPath('userData')
  return path.join(base, 'maps')
}

function startReading(win: Electron.BrowserWindow, blocks: BlockProps[]) {
  if (isReading) return
  isReading = true

  let i = 0
  win.webContents.send(IPC.READING_STATUS.FETCH, true)
  readTimer = setInterval(async () => {
    if (!isReading || inFlight) return
    inFlight = true
    try {
      const payload = await readModbus(blocks[i], client)
      win.webContents.send(IPC.READING.UPDATE, arrangePoints(blocks[i], payload))
      // console.log(blocks[i])
    } catch (err) {
    } finally {
      i = i + 1
      inFlight = false
      if (i >= blocks.length) {
        stopReading()
        win.webContents.send(IPC.READING_STATUS.FETCH, false)
      }
    }
  }, 1)
}

function stopReading() {
  if (readTimer) {
    clearInterval(readTimer)
    readTimer = null
  }
  isReading = false
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

ipcMain.handle(IPC.CSV.FETCH, async (_, req: FetchCsvRequest): Promise<any[]> => {
  const destDir = path.join(getUserDataDir(), req.equipment)
  const finalPath = path.join(destDir, `mapa_${req.firmwareVersion}.csv`)
  csv = await readCsv(finalPath)
  return csv
})

ipcMain.handle(
  IPC.CONNECT.CREATE,
  async (_, req: ConnectionFormType): Promise<ConnectionCreateResponse> => {
    let isSuccess = false
    blocks = organizeCsvInBlocks(csv)
    try {
      client = new ModbusRTU()
      await client.connectRTUBuffered(req.port, {
        baudRate: req.baudrate,
        dataBits: req.dataBits,
        parity: req.parity,
        stopBits: req.stopBits,
      })
      client.setTimeout(req.timeout)
      client.setID(req.address)
      isSuccess = true
      return { isSuccess }
    } catch (error) {
      isSuccess = false
      return { isSuccess, message: error as Error }
    } finally {
      if (isSuccess) {
        store.set('connectedIED', req)
        const win = BrowserWindow.getAllWindows()[0]
        startReading(win, blocks)
      }
    }
  }
)

ipcMain.handle(IPC.CONNECT.DELETE, async (): Promise<ConnectionCloseResponse> => {
  try {
    stopReading()
    client?.close()
    store.delete('connectedIED')
    return { isSuccess: true }
  } catch (error) {
    return { isSuccess: false, message: error as Error }
  }
})

ipcMain.handle(IPC.CONNECT.FETCH, async (): Promise<FetchConnectionResponse> => {
  const response = {
    isConnected: !!client?.isOpen,
    connectedIED: store.get('connectedIED'),
  }
  return response
})

ipcMain.handle(
  IPC.SETTING.FETCH,
  async (_, id: SettingsFetchRequest): Promise<SettingsFetchResponse> => {
    const options = csv.find(register => register.UUID === id.uuid)
    const result = parseConversionString(options['Conversão pt'])

    return {
      options: result,
    }
  }
)

ipcMain.handle(
  IPC.SETTING.UPDATE,
  async (_, { register }: UpdateSettingRequest): Promise<UpdateSettingResponse> => {
    const reg = csv.find(reg => reg.UUID === register.id) as CsvProps
    const updateStatus = writeModbus({ register: reg, client, value: register.newValue })
    return updateStatus
  }
)

ipcMain.handle(IPC.READING.FETCH, async (): Promise<void> => {
  const win = BrowserWindow.getAllWindows()[0]
  startReading(win, blocks)
})

app.on('before-quit', () => {
  stopReading()
  client?.close()
})
