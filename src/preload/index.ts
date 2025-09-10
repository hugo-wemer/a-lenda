import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'
import { IPC } from 'shared/constants'
import type {
  ConnectionCloseResponse,
  ConnectionCreateResponse,
  FetchConnectionResponse,
  FetchCsvRequest,
  PortsType,
  StoreType,
} from 'shared/types'

type Unsubscribe = () => void

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
  fetchCsv(req: FetchCsvRequest): Promise<any[]> {
    return ipcRenderer.invoke(IPC.CSV.FETCH, req)
  },
  createConnection(req: any): Promise<ConnectionCreateResponse> {
    return ipcRenderer.invoke(IPC.CONNECT.CREATE, req)
  },
  deleteConnection(): Promise<ConnectionCloseResponse> {
    return ipcRenderer.invoke(IPC.CONNECT.DELETE)
  },

  fetchConnection(): Promise<FetchConnectionResponse> {
    return ipcRenderer.invoke(IPC.CONNECT.FETCH)
  },

  onReadingUpdate(callback: (payload: any) => void): Unsubscribe {
    const listener = (_e: IpcRendererEvent, payload: any) => callback(payload)
    ipcRenderer.on(IPC.READING.UPDATE, listener)
    return () => ipcRenderer.removeListener(IPC.READING.UPDATE, listener)
  },

  onReadingStatus: (cb: (payload: boolean) => void) => {
    const listener = (_e: Electron.IpcRendererEvent, payload: boolean) =>
      cb(payload)
    ipcRenderer.on(IPC.READING_STATUS.FETCH, listener)
    return () => ipcRenderer.removeListener(IPC.READING_STATUS.FETCH, listener)
  },
}

contextBridge.exposeInMainWorld('App', API)
