import { Lock } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'

import { Dialog, DialogContent, DialogTitle, DialogTrigger } from './ui/dialog'

export function PasswordRequireForm() {
  return (
    <Dialog>
      <DialogTrigger className="cursor-pointer p-2 hover:bg-muted-foreground/50 rounded outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]">
        <Lock className="size-4 text-primary" />
      </DialogTrigger>
      <DialogContent className="border-none shadow-shape w-fit">
        <form className="space-y-1">
          <DialogTitle className="text-sm font-semibold">Senha de usuário</DialogTitle>
          <div className="flex gap-1">
            <Input type="password" id="password" defaultValue={0} />
            <Button size="icon" className="cursor-pointer">
              <Lock />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
