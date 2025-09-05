import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { type ConnectionFormType, connectionFormSchema } from 'shared/types'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { useEffect, useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'

export function ConnectionForm() {
  const [equipment, setEquipment] = useState<string | null>()
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<ConnectionFormType>({
    resolver: zodResolver(connectionFormSchema),
  })

  const defaultFields = {
    baudrate: 9600,
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    timeout: 3000,
  }

  useEffect(() => {
    setValue('baudrate', defaultFields.baudrate)
    setValue('dataBits', defaultFields.dataBits)
    setValue('parity', defaultFields.parity)
    setValue('stopBits', defaultFields.stopBits)
    setValue('timeout', defaultFields.timeout)
  }, [])

  function handleCreateConnection(data: any) {
    console.log(data)
  }

  return (
    <form
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
              }}
            >
              <SelectTrigger className="w-[220px] bg-card border-muted-foreground">
                <SelectValue placeholder="Selecione um equipamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel className="">Linha Black</SelectLabel>
                  <SelectItem value="tm">TM</SelectItem>
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
                  <SelectItem value="tm">1.00 r0 - 1.02 r6</SelectItem>
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
              onValueChange={port => {
                setValue('port', port)
              }}
            >
              <SelectTrigger className="w-full bg-card border-muted-foreground">
                <SelectValue placeholder="Selecione a porta para comunicação" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="COM5">COM5</SelectItem>
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
                    <SelectItem value="9600">9600</SelectItem>
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
                  setValue('parity', parity)
                }}
              >
                <SelectTrigger className="w-[130px] bg-card border-muted-foreground">
                  <SelectValue placeholder="Parity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="none">None</SelectItem>
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
              placeholder="Timeout"
              className="w-full bg-card border-muted-foreground"
              // defaultValue={3000}
              {...register('timeout')}
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
