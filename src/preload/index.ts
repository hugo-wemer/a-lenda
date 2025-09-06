import { contextBridge, ipcRenderer } from 'electron'
import { IPC } from 'shared/constants'
import type { FetchCsvRequest, PortsType, StoreType } from 'shared/types'

declare global {
  interface Window {
    App: typeof API
  }
}

const API = {
  updateApp(): Promise<void> {
    return ipcRenderer.invoke(IPC.APP_VERSION.UPDATE)
  },
  fetchAppVersion(): Promise<number> {
    return ipcRenderer.invoke(IPC.APP_VERSION.FETCH)
  },
  fetchPorts(): Promise<PortsType> {
    return ipcRenderer.invoke(IPC.PORTS.FETCH)
  },
  fetchEquipmentsConfig(): Promise<StoreType> {
    return ipcRenderer.invoke(IPC.EQUIPMENTS.FETCH)
  },
  fetchCsv(req: FetchCsvRequest): Promise<any> {
    return ipcRenderer.invoke(IPC.CSV.FETCH, req)
  },
}

contextBridge.exposeInMainWorld('App', API)
