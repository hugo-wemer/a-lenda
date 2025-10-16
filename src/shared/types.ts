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
  firmwareVersion: z.string({ error: 'Campo requerido' }).min(1, 'Campo requerido'),
  port: z.string({ error: 'Campo requerido' }).min(1, 'Campo requerido'),
  address: z
    .number()
    .int()
    .min(0, 'Selecione endereço válido')
    .max(65534, 'Selecione endereço válido'),
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
  language: 'pt-BR' | 'en-US'
  version: number
  equipments: Record<string, EquipmentProps>
  connectedIED?: ConnectionFormType
  userPassword: number
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

export interface RegisterProps {
  id: string
  mode: string
  treatment: string
  lowLimit: string | null
  highLimit: string | null
  defaultValue: string | null
  divisor: string
  ptUnit: string | null
  enUnit: string | null
  ptConversion: string | null
  enConversion: string | null
  ptDescription: string
  enDescription: string
  ptGroup: string | null
  enGroup: string | null
  ptDisplay: string | null
  enDisplay: string | null
}

export interface BlockProps {
  block: {
    initial: number
    quantity: number
  }
  registers: RegisterProps[]
  table: string
  type: string
}

export interface ConnectionCreateResponse {
  isSuccess: boolean
  message?: Error
}
export interface ConnectionCloseResponse {
  isSuccess: boolean
  message?: Error
}

export interface FetchConnectionResponse {
  isConnected: boolean
  connectedIED?: ConnectionFormType
}

export interface RegisterReadingsResponse {
  id: string
  readSuccess: boolean
  mode: string
  outOfLimit: boolean
  ptUnit?: string | null
  enUnit?: string | null
  divisor: string | null
  ptConversion?: SettingsFetchResponse | null
  enConversion?: SettingsFetchResponse | null
  ptDescription: string
  enDescription: string
  value: string
  ptValue: string
  enValue: string
  ptGroup?: string | null
  enGroup?: string | null
  ptDisplay: string | null
  enDisplay: string | null
}

export interface BlockReadingResponse {
  block: string
  registers: RegisterReadingsResponse[]
}

export interface SettingsFetchResponse {
  options: {
    value: number
    conversion: string
  }[]
}
export interface SettingsFetchRequest {
  uuid: string
}

export const newSettingSubmitionSchema = z.object({
  newValue: z.string(),
})

export type newSettingSubmitionType = z.infer<typeof newSettingSubmitionSchema>

export interface UpdateSettingRequest {
  register: {
    id: string
    newValue: string
  }
}
export interface UpdateSettingResponse {
  isSuccess: boolean
  error?: string
}

export const SettingsSchema = z.object({
  id: z.uuid(),
  registers: z.array(
    z.object({
      id: z.string(),
      ptDisplay: z.string(),
      value: z.string(),
    })
  ),
})

export type SettingsProps = z.infer<typeof SettingsSchema>

export interface SettingsUpdateResponse {
  isSuccess: boolean
  error?: string
  value: {
    id: string
    ptDisplay: string
    value: string
  }
}

export interface LanguageProps {
  language: string
}

export interface passwordRequest {
  password: string
}
