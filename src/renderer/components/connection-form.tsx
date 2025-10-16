import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { type ConnectionFormType, type EquipmentProps, connectionFormSchema } from 'shared/types'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { useEffect, useMemo, useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { useMutation, useQuery } from '@tanstack/react-query'
import { LoaderCircle, Plug, Unplug } from 'lucide-react'
import { queryClient } from '../lib/react-query'
import { useLanguage } from 'renderer/store/language'
import { Link } from 'react-router-dom'
import { Separator } from './ui/separator'

export function ConnectionForm() {
  const language = useLanguage(s => s.language)
  const [equipment, setEquipment] = useState<string | null>()
  const [connectionStatus, setConnectionStatus] = useState<{
    isConnected: boolean
    message?: string
  }>({ isConnected: false })
  const [connectedIED, setConnectedIED] = useState<ConnectionFormType | undefined>()

  const { data: ports, isFetching: isFetchingPorts } = useQuery({
    queryKey: ['fetchPorts'],
    queryFn: async () => {
      const response = await window.App.fetchPorts()
      return response
    },
  })

  const { data: equipmentsConfig } = useQuery({
    queryKey: ['fetchEquipmentsConfig'],
    queryFn: async () => {
      const all = Object.values(await window.App.fetchEquipmentsConfig())
      return all as EquipmentProps[]
    },
    refetchOnWindowFocus: false,
    retry: false,
    refetchInterval: q => {
      const data = (q.state.data as EquipmentProps[] | undefined) ?? []
      return data.length === 0 ? 1000 : false
    },
    initialData: [],
  })

  useEffect(() => {}, [equipmentsConfig])

  const uniqueEquipmentList = useMemo(() => {
    if (!equipmentsConfig) return []
    return Array.from(new Map(equipmentsConfig.map(e => [e.name, e])).values())
  }, [equipmentsConfig])

  useEffect(() => {
    //@ts-ignore
    setValue('firmwareVersion', undefined)
    async function fetchConnectionStatus() {
      const { isConnected, connectedIED } = await window.App.fetchConnection()

      setConnectedIED(connectedIED)
      setConnectionStatus({ isConnected })
    }

    fetchConnectionStatus()
  }, [equipment])

  const {
    register,
    setValue,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<ConnectionFormType>({
    resolver: zodResolver(connectionFormSchema),
    defaultValues: {
      port: '',
      address: 247,
      baudrate: 9600,
      dataBits: 8,
      parity: 'none',
      stopBits: 1,
      timeout: 3000,
    },
  })

  useEffect(() => {
    if (!connectedIED) return
    reset({
      equipment: connectedIED.equipment,
      firmwareVersion: connectedIED.firmwareVersion,
      port: connectedIED.port,
      address: connectedIED.address ?? 247,
      baudrate: connectedIED.baudrate ?? 9600,
      dataBits: connectedIED.dataBits ?? 8,
      parity: connectedIED.parity ?? 'none',
      stopBits: connectedIED.stopBits ?? 1,
      timeout: connectedIED.timeout ?? 3000,
    })

    setEquipment(connectedIED.equipment)
  }, [connectedIED, reset])

  const selectedEquipment = watch('equipment')
  const selectedFirmware = watch('firmwareVersion')
  const selectedPort = watch('port') ?? ''
  const selectedBaudrate = String(watch('baudrate') ?? '')
  const selectedParity = watch('parity') ?? 'none'
  const selectedStopbits = String(watch('stopBits') ?? '')

  const firmwares = useMemo(() => {
    setValue('firmwareVersion', '')
    if (!equipmentsConfig || !equipment) return []
    return equipmentsConfig.filter(e => e.name === equipment)
  }, [equipmentsConfig, equipment])

  const { mutateAsync: createConnection, isPending: isConnecting } = useMutation({
    mutationFn: async (data: ConnectionFormType) => {
      await window.App.fetchCsv({
        equipment: data.equipment,
        firmwareVersion: data.firmwareVersion,
      })
      const connection = await window.App.createConnection(data)
      return connection
    },
    onSuccess: res => {
      setConnectionStatus({
        isConnected: res.isSuccess,
        message: res.isSuccess
          ? undefined
          : language === 'en-US'
            ? 'Fail to connect. Verify the communication port.'
            : 'Falha ao conectar. Verifique a porta de comunicação.',
      })
    },
  })
  const { mutateAsync: closeConnection, isPending: isDisconnecting } = useMutation({
    mutationFn: async () => {
      const disconnection = await window.App.deleteConnection()
      return disconnection
    },
    onSuccess: res => {
      setConnectionStatus({
        isConnected: !res.isSuccess,
        message: res.isSuccess ? undefined : 'Falha ao desconectar. Por favor reinicie o programa',
      })
    },
  })

  async function handleCreateConnection(data: ConnectionFormType) {
    if (!connectionStatus.isConnected) {
      await createConnection(data)
    }
  }
  async function handleCloseConnection() {
    await closeConnection()
  }

  return (
    <div className="flex flex-col items-center w-full gap-2">
      <form
        noValidate
        onSubmit={handleSubmit(handleCreateConnection)}
        className="space-y-4 flex flex-col items-center flex-1 justify-center"
      >
        <div className="w-xl">
          <h1
            className={`font-semibold mb-2 text-sm ${connectionStatus.isConnected && 'text-muted-foreground'}`}
          >
            {language === 'en-US' ? 'Equipment' : 'Equipamento'}
          </h1>
          <div className="flex gap-2">
            <div>
              <Select
                disabled={connectionStatus.isConnected}
                value={selectedEquipment}
                onValueChange={equipment => {
                  setValue('equipment', equipment, { shouldDirty: true })
                  setEquipment(equipment)
                  queryClient.invalidateQueries({
                    queryKey: ['fetchEquipmentsConfig'],
                  })
                }}
              >
                <SelectTrigger className="w-[220px] bg-card border-muted-foreground">
                  <SelectValue
                    placeholder={`${language === 'en-US' ? 'Select a equipment' : 'Selecione um equipamento'}`}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel className="">
                      {language === 'en-US' ? 'Black line' : 'Linha Black'}
                    </SelectLabel>
                    {uniqueEquipmentList?.map(equipment => {
                      return (
                        <SelectItem key={equipment.id} value={equipment.name}>
                          {equipment.name.toUpperCase()}
                        </SelectItem>
                      )
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <span className="text-xs text-destructive">
                {errors.equipment && language === 'pt-BR' && errors.equipment.message}
                {errors.equipment &&
                  language === 'en-US' &&
                  `Field error ('${errors.equipment.message}')`}
              </span>
            </div>
            <div>
              <Select
                value={selectedFirmware}
                disabled={!equipment || connectionStatus.isConnected}
                onValueChange={firmwareVersion => {
                  setValue('firmwareVersion', firmwareVersion, {
                    shouldDirty: true,
                  })
                }}
              >
                <SelectTrigger className="w-[220px] bg-card border-muted-foreground">
                  <SelectValue
                    placeholder={`${language === 'en-US' ? 'Firmware version' : 'Versão de firmware'}`}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {firmwares?.map(firmware => {
                      return (
                        <SelectItem key={firmware.branch} value={firmware.branch}>
                          {firmware.version}
                        </SelectItem>
                      )
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <span className="text-xs text-destructive">
                {errors.firmwareVersion && language === 'pt-BR' && errors.firmwareVersion.message}
                {errors.firmwareVersion &&
                  language === 'en-US' &&
                  `Field error ('${errors.firmwareVersion.message}')`}
              </span>
            </div>
          </div>
        </div>
        <div className="w-xl">
          <h1
            className={`font-semibold mb-2 text-sm ${connectionStatus.isConnected && 'text-muted-foreground'}`}
          >
            {language === 'en-US' ? 'Settings' : 'Configuração'}
          </h1>
          <div className="space-y-2">
            <div>
              <span className="text-xs text-foreground/50">
                {language === 'en-US' ? 'Connection port' : 'Porta de conexão'}
              </span>
              <Select
                disabled={connectionStatus.isConnected}
                value={selectedPort}
                onOpenChange={async () => {
                  queryClient.invalidateQueries({ queryKey: ['fetchPorts'] })
                }}
                onValueChange={port => {
                  setValue('port', port)
                }}
              >
                <SelectTrigger className="w-full bg-card border-muted-foreground">
                  <SelectValue
                    placeholder={`${language === 'en-US' ? 'Select the communication port' : 'Selecione a porta para comunicação'}`}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {ports ? (
                      ports?.toSorted().map(port => {
                        return (
                          <SelectItem key={port} value={port}>
                            {port}
                          </SelectItem>
                        )
                      })
                    ) : (
                      <LoaderCircle className="animateSpin" />
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <span className="text-xs text-destructive">
                {errors.port && language === 'pt-BR' && errors.port.message}
                {errors.port && language === 'en-US' && `Field error ('${errors.port.message}')`}
              </span>
            </div>
            <div className="flex gap-2">
              <div>
                <span className="text-xs text-foreground/50">
                  {language === 'en-US' ? 'Address' : 'Endereço'}
                </span>
                <Input
                  disabled={connectionStatus.isConnected}
                  type="number"
                  className="w-full bg-card border-muted-foreground"
                  {...register('address', {
                    setValueAs: v => (v === '' ? undefined : Number(v)),
                  })}
                />
              </div>

              <div>
                <span className="text-xs text-foreground/50">Baudrate</span>
                <Select
                  disabled={connectionStatus.isConnected}
                  value={selectedBaudrate.toString()}
                  defaultValue="9600"
                  onValueChange={baudrate => {
                    setValue('baudrate', Number(baudrate))
                  }}
                >
                  <SelectTrigger className="w-[150px] bg-card border-muted-foreground">
                    <SelectValue placeholder="Baudrate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="4800">4800</SelectItem>
                      <SelectItem value="9600">9600</SelectItem>
                      <SelectItem value="19200">19200</SelectItem>
                      <SelectItem value="57600">57600</SelectItem>
                      <SelectItem value="115200">115200</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <span className="text-xs text-foreground/50">Databits</span>
                <Select
                  defaultValue="8"
                  disabled
                  onValueChange={dataBits => {
                    setValue('dataBits', Number(dataBits))
                  }}
                >
                  <SelectTrigger className="w-[110px] bg-card border-muted-foreground">
                    <SelectValue placeholder="Data bits" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="8">8</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <span className="text-xs text-foreground/50">
                  {language === 'en-US' ? 'Parity' : 'Paridade'}
                </span>
                <Select
                  disabled={connectionStatus.isConnected}
                  value={selectedParity}
                  defaultValue="none"
                  onValueChange={parity => {
                    setValue('parity', parity as ConnectionFormType['parity'], {
                      shouldDirty: true,
                    })
                  }}
                >
                  <SelectTrigger className="w-[110px] bg-card border-muted-foreground">
                    <SelectValue placeholder="Parity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="even">Even</SelectItem>
                      <SelectItem value="odd">Odd</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <span className="text-xs text-foreground/50">Stopbits</span>
                <Select
                  disabled={connectionStatus.isConnected}
                  value={selectedStopbits.toString()}
                  defaultValue="1"
                  onValueChange={stopBits => {
                    setValue('stopBits', Number(stopBits))
                  }}
                >
                  <SelectTrigger className="w-[110px] bg-card border-muted-foreground">
                    <SelectValue placeholder="Stop bits" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-destructive">
                {errors.address && language === 'pt-BR' && errors.address?.message}
                {errors.address &&
                  language === 'en-US' &&
                  `Address field error ('${errors.address.message}')`}
              </span>
              <span className="text-xs text-destructive">
                {errors.baudrate && language === 'pt-BR' && errors.baudrate?.message}
                {errors.baudrate &&
                  language === 'en-US' &&
                  `Baudrate field error ('${errors.baudrate.message}')`}
              </span>
              <span className="text-xs text-destructive">
                {errors.parity && language === 'pt-BR' && errors.parity?.message}
                {errors.parity &&
                  language === 'en-US' &&
                  `Parity field error ('${errors.parity.message}')`}
              </span>
              <span className="text-xs text-destructive">
                {errors.stopBits && language === 'pt-BR' && errors.stopBits?.message}
                {errors.stopBits &&
                  language === 'en-US' &&
                  `StopBits field error ('${errors.stopBits.message}')`}
              </span>
            </div>

            <div>
              <span className="text-xs text-foreground/50">Timeout</span>
              <Input
                disabled={connectionStatus.isConnected}
                type="number"
                placeholder="Timeout"
                className="w-full bg-card border-muted-foreground"
                // defaultValue={3000}
                {...register('timeout', {
                  setValueAs: v => (v === '' ? undefined : Number(v)),
                })}
              />
              <span className="text-xs text-destructive">{errors.timeout?.message}</span>
            </div>
            <Button
              type="submit"
              className={'mt-2 w-full cursor-pointer text-gray-950'}
              hidden={connectionStatus.isConnected}
              disabled={isConnecting}
            >
              <>
                <Plug className="size-4" />
                {language === 'en-US' ? 'Connect' : 'Conectar'}
              </>
            </Button>
            <Button
              type="button"
              onClick={() => handleCloseConnection()}
              variant={'destructive'}
              className="my-2 w-full cursor-pointer text-destructive-foreground"
              hidden={!connectionStatus.isConnected}
              disabled={isDisconnecting}
            >
              <Unplug className="size-4" />
              {language === 'en-US' ? 'Disconnect' : 'Desconectar'}
            </Button>
            <span className="text-xs text-destructive flex justify-center">
              {connectionStatus.message}
            </span>
          </div>
        </div>
      </form>
      {/* <div className="w-xl text-center space-y-2">
        <Separator className="bg-muted-foreground" />
        <Link
          to="/offline-settings"
          className="text-sm text-primary hover:text-foreground hover:border-foreground font-semibold"
        >
          ou parametrize desconectado
        </Link>
      </div> */}
    </div>
  )
}
