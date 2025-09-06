import { ipcMain } from 'electron'
import { listPorts } from './lib/list-ports'
import { IPC } from 'shared/constants'
import { getConfigFile } from './lib/s3-client'

ipcMain.handle(IPC.PORTS.FETCH, async (): Promise<any> => {
  const ports = await listPorts()
  return ports
})

ipcMain.handle(IPC.EQUIPMENTS.FETCH, async (): Promise<any> => {
  const response = await getConfigFile()
  return response.json()
})
