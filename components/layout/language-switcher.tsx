'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLanguage } from '@/components/providers/language-provider'
import { Globe } from 'lucide-react'

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Globe className="h-4 w-4" />
          <span className="sr-only">Switch Language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLanguage('en')} className={language === 'en' ? 'bg-accent' : ''}>
          <img src="https://flagcdn.com/w40/us.png" alt="US" className="mr-2 h-4 w-6 object-cover rounded shadow-sm" /> English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('ar')} className={language === 'ar' ? 'bg-accent' : ''}>
          <img src="https://flagcdn.com/w40/sa.png" alt="AR" className="mr-2 h-4 w-6 object-cover rounded shadow-sm" /> العربية (Arabic)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('ru')} className={language === 'ru' ? 'bg-accent' : ''}>
          <img src="https://flagcdn.com/w40/ru.png" alt="RU" className="mr-2 h-4 w-6 object-cover rounded shadow-sm" /> Русский (Russian)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('hy')} className={language === 'hy' ? 'bg-accent' : ''}>
          <img src="https://flagcdn.com/w40/am.png" alt="AM" className="mr-2 h-4 w-6 object-cover rounded shadow-sm" /> Հայերեն (Armenian)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('hi')} className={language === 'hi' ? 'bg-accent' : ''}>
          <img src="https://flagcdn.com/w40/in.png" alt="IN" className="mr-2 h-4 w-6 object-cover rounded shadow-sm" /> हिन्दी (Hindi)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('bn')} className={language === 'bn' ? 'bg-accent' : ''}>
          <img src="https://flagcdn.com/w40/bd.png" alt="BD" className="mr-2 h-4 w-6 object-cover rounded shadow-sm" /> বাংলা (Bangla)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('es')} className={language === 'es' ? 'bg-accent' : ''}>
          <img src="https://flagcdn.com/w40/es.png" alt="ES" className="mr-2 h-4 w-6 object-cover rounded shadow-sm" /> Español (Spanish)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('fr')} className={language === 'fr' ? 'bg-accent' : ''}>
          <img src="https://flagcdn.com/w40/fr.png" alt="FR" className="mr-2 h-4 w-6 object-cover rounded shadow-sm" /> Français (French)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('ur')} className={language === 'ur' ? 'bg-accent' : ''}>
          <img src="https://flagcdn.com/w40/pk.png" alt="PK" className="mr-2 h-4 w-6 object-cover rounded shadow-sm" /> اردو (Urdu)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('fil')} className={language === 'fil' ? 'bg-accent' : ''}>
          <img src="https://flagcdn.com/w40/ph.png" alt="PH" className="mr-2 h-4 w-6 object-cover rounded shadow-sm" /> Filipino (Philippines)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
