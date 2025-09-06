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
  equipment: z.string({ error: 'Campo requerido' }).min(1, 'Campo requerido'),
  firmwareVersion: z
    .string({ error: 'Campo requerido' })
    .min(1, 'Campo requerido'),
  port: z.string({ error: 'Campo requerido' }).min(1, 'Campo requerido'),
  baudrate: z.number().int().min(110, 'Selecione um baudrate válido'),
  dataBits: z.number().int().min(5, 'Mínimo 5').max(8, 'Máximo 8'),
  parity: z.enum(['none', 'even', 'odd']),
  stopBits: z.number().int().min(1, 'Mínimo 1').max(2, 'Máximo 2'),
  timeout: z
    .number()
    .int({ message: 'O timeout precisa ser um número inteiro' })
    .min(100, { message: 'O timeout precisa ser maior que 100ms' }),
})

export type ConnectionFormType = z.infer<typeof connectionFormSchema>

export type PortsType = string[]

export type EquipmentProps = {
  id: string
  name: string
  version: string
  branch: string
}

export interface StoreType {
  version: number
  equipments: Record<string, EquipmentProps>
}

export interface FetchCsvRequest {
  equipment: string
  firmwareVersion: string
}

export interface CsvProps {
  UUID: string
  'Teste automático': string
  Modo: string
  Tratamento: string
  'Tabela (Modbus)': string
  'Tipo (Modbus)': string
  'Registrador (Modbus)': string
  'Tipo (DNP3)': string
  'Índice (DNP3)': string
  'Limite inferior': string
  'Limite superior': string
  'Valor default': string
  Divisor: string
  'Unidade pt': string
  'Unidade en': string
  'Unidade es': string
  'Conversão pt': string
  'Conversão en': string
  'Conversão es': string
  Opcional: string
  Condicional: string
  'Nível de acesso': string
  'Descrição pt': string
  'Descrição en': string
  'Descrição es': string
  'Display pt': string
  'Display en': string
  'Display es': string
  Observações: string
  'Funcionalidade pt': string
  'Funcionalidade en': string
  'Funcionalidade es': string
  'Grupo pt': string
  'Grupo en': string
  'Grupo es': string
  Classificação: string
  'Gráfico rápido': string
  'Histórico de dados': string
  'IEC 61850': string
  Link: string
  CDC: string
}
