import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  type ConnectionFormType,
  type EquipmentProps,
  connectionFormSchema,
} from 'shared/types'
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
import { useQuery } from '@tanstack/react-query'
import { LoaderCircle } from 'lucide-react'
import { queryClient } from '../lib/react-query'

export function ConnectionForm() {
  const [equipment, setEquipment] = useState<string | null>()

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
  })

  const uniqueEquipmentList = useMemo(() => {
    if (!equipmentsConfig) return []
    return Array.from(new Map(equipmentsConfig.map(e => [e.name, e])).values())
  }, [equipmentsConfig])

  const firmwares = useMemo(() => {
    if (!equipmentsConfig || !equipment) return []
    return equipmentsConfig.filter(e => e.name === equipment)
  }, [equipmentsConfig, equipment])

  useEffect(() => {
    //@ts-ignore
    setValue('firmwareVersion', undefined)
  }, [equipment])

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<ConnectionFormType>({
    resolver: zodResolver(connectionFormSchema),
    defaultValues: {
      baudrate: 9600,
      dataBits: 8,
      parity: 'none',
      stopBits: 1,
      timeout: 3000,
    },
  })

  async function handleCreateConnection(data: ConnectionFormType) {
    // console.log(data)
    const csv = await window.App.fetchCsv({
      equipment: data.equipment,
      firmwareVersion: data.firmwareVersion,
    })
    console.log(csv)
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(handleCreateConnection)}
      className="space-y-4 flex flex-col items-center flex-1 justify-center"
    >
      <div className="w-xl">
        <h1 className="font-semibold mb-2 text-sm">Equipamento</h1>
        <div className="flex gap-2">
          <div>
            <Select
              onValueChange={equipment => {
                setValue('equipment', equipment)
                setEquipment(equipment)
                queryClient.invalidateQueries({
                  queryKey: ['fetchEquipmentsConfig'],
                })
              }}
            >
              <SelectTrigger className="w-[220px] bg-card border-muted-foreground">
                <SelectValue placeholder="Selecione um equipamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel className="">Linha Black</SelectLabel>
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
              {errors.equipment?.message}
            </span>
          </div>
          <div>
            <Select
              disabled={!equipment}
              onValueChange={firmwareVersion => {
                setValue('firmwareVersion', firmwareVersion)
              }}
            >
              <SelectTrigger className="w-[220px] bg-card border-muted-foreground">
                <SelectValue placeholder="Versão de firmware" />
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
              {errors.firmwareVersion?.message}
            </span>
          </div>
        </div>
      </div>
      <div className="w-xl">
        <h1 className="font-semibold mb-2 text-sm">Configuração</h1>
        <div className="space-y-2">
          <div>
            <span className="text-xs text-foreground/50">Porta de conexão</span>
            <Select
              onOpenChange={async () => {
                queryClient.invalidateQueries({ queryKey: ['fetchPorts'] })
              }}
              onValueChange={port => {
                setValue('port', port)
              }}
            >
              <SelectTrigger className="w-full bg-card border-muted-foreground">
                <SelectValue placeholder="Selecione a porta para comunicação" />
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
              {errors.port?.message}
            </span>
          </div>
          <div className="flex gap-2">
            <div>
              <span className="text-xs text-foreground/50">Baudrate</span>
              <Select
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
              <span className="text-xs text-destructive">
                {errors.baudrate?.message}
              </span>
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
                <SelectTrigger className="w-[130px] bg-card border-muted-foreground">
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
              <span className="text-xs text-foreground/50">Paridade</span>
              <Select
                defaultValue="none"
                onValueChange={parity => {
                  setValue('parity', parity as ConnectionFormType['parity'])
                }}
              >
                <SelectTrigger className="w-[130px] bg-card border-muted-foreground">
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
              <span className="text-xs text-destructive">
                {errors.parity?.message}
              </span>
            </div>
            <div>
              <span className="text-xs text-foreground/50">Stopbits</span>
              <Select
                defaultValue="1"
                onValueChange={stopBits => {
                  setValue('stopBits', Number(stopBits))
                }}
              >
                <SelectTrigger className="w-[130px] bg-card border-muted-foreground">
                  <SelectValue placeholder="Stop bits" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <span className="text-xs text-destructive">
                {errors.stopBits?.message}
              </span>
            </div>
          </div>
          <div>
            <span className="text-xs text-foreground/50">Timeout</span>
            <Input
              type="number"
              placeholder="Timeout"
              className="w-full bg-card border-muted-foreground"
              // defaultValue={3000}
              {...register('timeout', {
                setValueAs: v => (v === '' ? undefined : Number(v)),
              })}
            />
            <span className="text-xs text-destructive">
              {errors.timeout?.message}
            </span>
          </div>
          <Button type="submit" className="mt-2 w-full cursor-pointer">
            Conectar
          </Button>
        </div>
      </div>
    </form>
  )
}
