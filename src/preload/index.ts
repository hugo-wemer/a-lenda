import { contextBridge, ipcRenderer } from 'electron'
import { IPC } from 'shared/constants'
import type { PortsType } from 'shared/types'

declare global {
  interface Window {
    App: typeof API
  }
}

const API = {
  fetchPorts(): Promise<PortsType> {
    return ipcRenderer.invoke(IPC.PORTS.FETCH)
  },
}

contextBridge.exposeInMainWorld('App', API)
