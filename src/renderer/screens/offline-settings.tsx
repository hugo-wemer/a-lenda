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
} from '../components/ui/select'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/ui/button'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ChevronLeftIcon } from 'lucide-react'
import { queryClient } from '../lib/react-query'
import { useLanguage } from 'renderer/store/language'
import { Link } from 'react-router-dom'

export function OfflineSettings() {
  const language = useLanguage(s => s.language)
  const [equipment, setEquipment] = useState<string | null>()
  const [connectionStatus, setConnectionStatus] = useState<{
    isConnected: boolean
    message?: string
  }>({ isConnected: false })
  const [connectedIED, setConnectedIED] = useState<ConnectionFormType | undefined>()

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
  } = useForm<any>({
    resolver: zodResolver(connectionFormSchema),
  })

  const selectedEquipment = watch('equipment')
  const selectedFirmware = watch('firmwareVersion')

  const firmwares = useMemo(() => {
    setValue('firmwareVersion', '')
    if (!equipmentsConfig || !equipment) return []
    return equipmentsConfig.filter(e => e.name === equipment)
  }, [equipmentsConfig, equipment])

  const {
    data: settings,
    mutateAsync: createConnection,
    isPending: isConnecting,
  } = useMutation({
    mutationFn: async (data: any) => {
      const csv = await window.App.fetchCsv({
        equipment: data.selectedEquipment,
        firmwareVersion: data.selectedFirmware,
      })
      return csv
    },
  })

  useEffect(() => {
    if (selectedEquipment && selectedFirmware) {
      createConnection({ selectedEquipment, selectedFirmware })
    }
  }, [selectedEquipment, selectedFirmware])

  return (
    <>
      <div className="py-4 px-2 bg-muted border-b border-muted-foreground">
        <Button variant="secondary" asChild className="absolute">
          <Link to="/">
            <ChevronLeftIcon />
            voltar
          </Link>
        </Button>
        <div className="flex justify-center items-center">
          <div className="">
            <div className="flex gap-2 items-center">
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
              </div>
            </div>
          </div>
        </div>
      </div>
      {settings && <pre>{settings.toString()}</pre>}
    </>
  )
}
