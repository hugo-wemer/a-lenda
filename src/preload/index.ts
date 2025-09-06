import { contextBridge, ipcRenderer } from 'electron'
import { IPC } from 'shared/constants'
import type { PortsType, StoreType } from 'shared/types'

declare global {
  interface Window {
    App: typeof API
  }
}

const API = {
  updateApp(): Promise<void> {
    return ipcRenderer.invoke(IPC.APP.UPDATE)
  },
  fetchPorts(): Promise<PortsType> {
    return ipcRenderer.invoke(IPC.PORTS.FETCH)
  },
  fetchEquipmentsConfig(): Promise<StoreType> {
    return ipcRenderer.invoke(IPC.EQUIPMENTS.FETCH)
  },
}

contextBridge.exposeInMainWorld('App', API)
