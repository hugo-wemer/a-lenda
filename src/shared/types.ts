import type { BrowserWindow, IpcMainInvokeEvent } from 'electron'

import type { registerRoute } from 'lib/electron-router-dom'
import z from 'zod'

export type BrowserWindowOrNull = Electron.BrowserWindow | null

type Route = Parameters<typeof registerRoute>[0]

export interface WindowProps extends Electron.BrowserWindowConstructorOptions {
  id: Route['id']
  query?: Route['query']
}

export interface WindowCreationByIPC {
  channel: string
  window(): BrowserWindowOrNull
  callback(window: BrowserWindow, event: IpcMainInvokeEvent): void
}

export const connectionFormSchema = z.object({
  equipment: z.string('Campo requerido'),
  firmwareVersion: z.string('Campo requerido'),
  port: z.string('Campo requerido'),
  baudrate: z.coerce.number('Campo requerido'),
  dataBits: z.coerce.number('Campo requerido'),
  parity: z.string('Campo requerido'), //z.union([z.literal('none'), z.literal('even'), z.literal('odd')]),
  stopBits: z.coerce.number('Campo requerido'),
  timeout: z.coerce
    .number('Campo requerido')
    .min(100, 'O timeout precisa ser maior que 100'),
})

export type ConnectionFormType = z.infer<typeof connectionFormSchema>
