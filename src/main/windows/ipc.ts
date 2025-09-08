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
  FetchConnectionResponse,
  FetchCsvRequest,
} from 'shared/types'
import path from 'node:path'
import { organizeCsvInBlocks, readCsv } from './lib/csv-parsing'
import ModbusRTU from 'modbus-serial'
import { readModbus } from './lib/read-modbus'
import { arrangePoints } from './lib/arrange-points'

let client: ModbusRTU | null = null
let csv: any[]
let isReading = false
let readTimer: NodeJS.Timeout | null = null

export function getUserDataDir() {
  const base = app.getPath('userData')
  return path.join(base, 'maps')
}

function startReading(win: Electron.BrowserWindow, blocks: BlockProps[]) {
  if (isReading) return
  isReading = true

  // readModbus(blocks[0], client)
  //   .then(payload => win.webContents.send(IPC.READING.UPDATE, payload))
  //   .catch(() => {})

  let i = 0
  readTimer = setInterval(async () => {
    try {
      const payload = await readModbus(blocks[i], client)
      win.webContents.send(IPC.READING.UPDATE, blocks[i])
      arrangePoints(blocks[i], payload)
    } catch (err) {
    } finally {
      i = i + 1
    }
  }, 500)
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
    let isSuccess = false
    const blocks = organizeCsvInBlocks(csv)
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

ipcMain.handle(
  IPC.CONNECT.DELETE,
  async (): Promise<ConnectionCloseResponse> => {
    try {
      stopReading()
      client?.close()
      store.delete('connectedIED')
      return { isSuccess: true }
    } catch (error) {
      return { isSuccess: false, message: error as Error }
    }
  }
)

ipcMain.handle(
  IPC.CONNECT.FETCH,
  async (): Promise<FetchConnectionResponse> => {
    const response = {
      isConnected: !!client?.isOpen,
      connectedIED: store.get('connectedIED'),
    }
    return response
  }
)

app.on('before-quit', () => {
  stopReading()
  client?.close()
})

// app.whenReady().then(() => {
//   let readingCounter = 0
//   setInterval(() => {
//     readingCounter += 1
//     const win = BrowserWindow.getAllWindows()[0]
//     if (!win || win.isDestroyed()) return
//     win.webContents.send(IPC.READING.UPDATE, readingCounter)
//   }, 2000)
// })
