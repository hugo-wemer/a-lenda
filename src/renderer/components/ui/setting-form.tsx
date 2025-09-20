import {
  newSettingSubmitionSchema,
  type UpdateSettingResponse,
  type RegisterReadingsResponse,
} from 'shared/types'
import { Badge } from './badge'
import { useEffect, useMemo, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
import { Button } from './button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Separator } from './separator'

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
      setValue('newValue', setting.ptValue)
    }
  }, [setting])

  async function handleUpdateSetting(data: { newValue: string }) {
    const updateSetting = await window.App.updateSetting({
      register: { id: setting.id, newValue: data.newValue },
    })
    if (updateSetting.isSuccess) {
      await window.App.readingFetch()
    }
  }

  return (
    <div className="flex flex-col items-center h-full gap-2">
      <div className="w-lg flex flex-col items-center justify-center h-full gap-4">
        <div className="space-y-2">
          {setting.ptGroup && <Badge className="bg-blue-500">{setting.ptGroup}</Badge>}
          <h1 className="font-semibold text-lg text-center leading-relaxed">
            {setting.ptDescription}
          </h1>
        </div>
        <Separator className="bg-muted-foreground" />
        <form className="space-y-2" onSubmit={handleSubmit(handleUpdateSetting)}>
          {setting.ptConversion?.options.length !== 0 ? (
            <Select
              key={setting.id}
              defaultValue={(Number(setting.value) || Number(setting.value === 'true')).toString()}
              onValueChange={newValue => {
                setValue('newValue', newValue)
              }}
            >
              <SelectTrigger className="w-[346px] bg-card border-muted-foreground">
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
              <div className="flex bg-card items-center px-3 py-1.5 rounded-md border border-muted-foreground">
                <input
                  type="number"
                  step={1 / Number(setting.divisor)}
                  className="outline-none text-sm w-xs py-px"
                  {...register('newValue')}
                />
                {setting.ptUnit && (
                  <span className="text-muted-foreground text-sm">{setting.ptUnit}</span>
                )}
              </div>
            </div>
          )}
          <Button className="w-full cursor-pointer">Alterar parâmetro</Button>

          {/* {updateSettingResponse?.error && (
            <div className="text-xs text-destructive text-center">
              {updateSettingResponse.error}
            </div>
          )} */}
        </form>
      </div>
    </div>
  )
}
