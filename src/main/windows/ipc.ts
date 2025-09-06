import { ipcMain } from 'electron'
import { listPorts } from 'lib/electron-app/utils/list-ports'
import { IPC } from 'shared/constants'

ipcMain.handle(IPC.PORTS.FETCH, async (): Promise<any> => {
  const ports = await listPorts()
  return ports
})
