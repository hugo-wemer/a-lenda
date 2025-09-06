import { app, ipcMain } from 'electron'
import { listPorts } from './lib/list-ports'
import { IPC } from 'shared/constants'
import { getConfigFile, updateCsvFile } from './lib/s3-client'
import { store } from './lib/store'
import type { FetchCsvRequest } from 'shared/types'
import path from 'node:path'
import { organizeCsvInBlocks, readCsv } from './lib/csv-parsing'
// import { parse } from 'csv-parse'

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
  const csv = await readCsv(finalPath)
  const blocks = organizeCsvInBlocks(csv)
  return csv
})
