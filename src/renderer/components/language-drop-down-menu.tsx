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

import BrazilIcon from '../../resources/public/br-logo.png'
import UsaIcon from '../../resources/public/usa-logo.png'

export function LanguageDropDownMenu() {
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
            <img src={BrazilIcon} alt="Brazil" />
            pt-BR
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="en-US" className="cursor-pointer">
            <img src={UsaIcon} alt="United States" />
            en-US
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
