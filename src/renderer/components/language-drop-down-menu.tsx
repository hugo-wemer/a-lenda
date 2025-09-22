import { Languages } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { useEffect, useState } from 'react'
import { useLanguage } from 'renderer/store/language'

export function LanguageDropDownMenu() {
  // const lang = useLanguage(s => s.language)
  const { language, updateLanguage } = useLanguage()
  const [position, setPosition] = useState(language)

  useEffect(() => {
    console.log(language)
    setPosition(language)
  }, [language])

  function handleChangeLanguage(language: string) {
    setPosition(language)
    updateLanguage(language)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="cursor-pointer p-2 hover:bg-muted-foreground/50 rounded outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]">
        <Languages className="size-4 text-primary" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mr-1">
        <DropdownMenuRadioGroup value={position} onValueChange={handleChangeLanguage}>
          <DropdownMenuRadioItem value="pt-BR" className="cursor-pointer">
            <img src="../assets/brazil-logo.svg" alt="Brazil language" />
            pt-BR
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="en-US" className="cursor-pointer">
            <img src="../assets/eua-logo.svg" alt="Brazil language" />
            en-US
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
