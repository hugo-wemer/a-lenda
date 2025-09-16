import {
  newSettingSubmitionSchema,
  type RegisterReadingsResponse,
  type SettingsFetchResponse,
} from 'shared/types'
import { Badge } from './badge'
import { useEffect, useMemo, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
import { Input } from './input'
import { Button } from './button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

export function SettingForm({ setting }: { setting: RegisterReadingsResponse }) {
  const { register, handleSubmit, setValue, reset } = useForm({
    resolver: zodResolver(newSettingSubmitionSchema),
    defaultValues: { newValue: '' },
  })

  const hasOptions = (setting.ptConversion?.options?.length ?? 0) > 0

  const initialValue = useMemo(() => {
    if (hasOptions) {
      return String(setting.value)
    }
    if (setting.divisor) {
      const val = Number(setting.value) / Number(setting.divisor)
      // ex.: divisor "100" -> 2 casas; ajuste conforme sua regra
      const casas = String(setting.divisor).length - 1
      return val.toFixed(Math.max(casas, 0))
    }
    return String(setting.value ?? '')
  }, [hasOptions, setting.value, setting.divisor])

  useEffect(() => {
    reset({ newValue: initialValue })
  }, [initialValue, reset])

  useEffect(() => {
    if (setting.ptConversion?.options.length && setting.ptConversion?.options.length > 0) {
      setValue('newValue', setting.value.toString())
    } else if (setting.divisor) {
      setValue(
        'newValue',
        (Number(setting.value) / Number(setting.divisor))
          .toFixed(setting.divisor.length - 1)
          .toString()
      )
    }
  }, [setting])

  async function handleUpdateSetting(data: { newValue: string }) {
    const updateSetting = await window.App.updateSetting({
      register: { id: setting.id, newValue: data.newValue },
    })
    console.log(updateSetting)
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-2">
      {setting.ptGroup && <Badge className="bg-blue-500">{setting.ptGroup}</Badge>}
      <h1 className="font-semibold text-lg text-center">{setting.ptDescription}</h1>
      <form className="space-y-2" onSubmit={handleSubmit(handleUpdateSetting)}>
        {setting.ptConversion?.options.length !== 0 ? (
          <Select
            key={setting.id}
            defaultValue={setting.value.toString()}
            onValueChange={newValue => {
              setValue('newValue', newValue)
            }}
          >
            <SelectTrigger className="w-[220px] bg-card border-muted-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {setting.ptConversion?.options.map(option => {
                return (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.conversion}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        ) : (
          <div className="flex items-center gap-1">
            <Input className="bg-card" type="number" {...register('newValue')} />
            {setting.ptUnit && <span className="text-muted-foreground">{setting.ptUnit}</span>}
          </div>
        )}
        <Button className="w-full">Alterar parâmetro</Button>
      </form>
    </div>
  )
}
