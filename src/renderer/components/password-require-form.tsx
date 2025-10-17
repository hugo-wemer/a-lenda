import { Lock, LockKeyholeOpen } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'

import { Dialog, DialogContent, DialogTitle, DialogTrigger } from './ui/dialog'
import { useForm } from 'react-hook-form'
import { userPasswordFormSchema, type userPasswordFormType } from 'shared/types'
import { zodResolver } from '@hookform/resolvers/zod'

export function PasswordRequireForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<userPasswordFormType>({
    resolver: zodResolver(userPasswordFormSchema),
  })

  async function handleChangeUserPassword(data: userPasswordFormType) {
    await window.App.updateUserPassword(data)
  }

  return (
    <Dialog>
      <DialogTrigger className="cursor-pointer p-2 hover:bg-muted-foreground/50 rounded outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]">
        <Lock className="size-4 text-primary" />
      </DialogTrigger>
      <DialogContent className="border-none shadow-shape w-fit">
        <form className="space-y-1" onSubmit={handleSubmit(handleChangeUserPassword)}>
          <DialogTitle className="text-sm font-semibold">Senha de usuário</DialogTitle>
          <div className="flex gap-1">
            <Input
              type="password"
              id="password"
              defaultValue={0}
              {...register('password', { setValueAs: v => (v === '' ? undefined : Number(v)) })}
            />
            <Button size="icon" className="cursor-pointer">
              <LockKeyholeOpen />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
