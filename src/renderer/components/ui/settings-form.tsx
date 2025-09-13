import {
  newSettingSubmitionSchema,
  type RegisterReadingsResponse,
  type SettingsFetchResponse,
} from 'shared/types'
import { Badge } from './badge'
import { useEffect, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
import { Input } from './input'
import { Button } from './button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

export function SettingsForm({ setting }: { setting: RegisterReadingsResponse }) {
  const [isLoadingConversion, setIsLoadingConversion] = useState(true)
  const [settingOptions, setSettingOptions] = useState<SettingsFetchResponse>()
  const { register, handleSubmit, setValue } = useForm({
    resolver: zodResolver(newSettingSubmitionSchema),
  })
  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const options = await window.App.fetchSettingOptions({ uuid: setting.id })
        if (!active) return
        setSettingOptions(options)
      } catch (err) {
        console.error('Erro ao buscar opções:', err)
      } finally {
        setIsLoadingConversion(false)
      }
    })()

    return () => {
      active = false
    }
  }, [setting.id])

  function handleUpdateSetting(data: any) {
    console.log(data)
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-2">
      {setting.ptGroup && <Badge className="bg-blue-500">{setting.ptGroup}</Badge>}
      <h1 className="font-semibold text-lg text-center">{setting.ptDescription}</h1>
      <form className="space-y-2" onSubmit={handleSubmit(handleUpdateSetting)}>
        {settingOptions?.options.length !== 0 ? (
          <Select
            onValueChange={conversion => {
              setValue('newValue', conversion)
            }}
          >
            <SelectTrigger className="w-[220px] bg-card border-muted-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {settingOptions?.options.map(option => {
                return (
                  <SelectItem key={option.conversion} value={option.conversion}>
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
