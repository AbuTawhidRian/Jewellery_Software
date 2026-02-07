'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { CURRENCIES } from '@/lib/currencies'

interface CurrencyMultiSelectProps {
  selected: string[]
  onChange: (value: string[]) => void
}

export function CurrencyMultiSelect({ selected, onChange }: CurrencyMultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleUnselect = (code: string) => {
    onChange(selected.filter((s) => s !== code))
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {selected.map((code) => {
          const currency = CURRENCIES.find((c) => c.code === code)
          return (
            <Badge key={code} variant="secondary" className="pl-3 py-1">
              {currency?.name || code} ({code})
              <button
                className="ml-2 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleUnselect(code)
                  }
                }}
                onMouseDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                onClick={() => handleUnselect(code)}
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </Badge>
          )
        })}
        {selected.length === 0 && (
          <p className="text-sm text-muted-foreground">No additional currencies selected</p>
        )}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            Select currencies...
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command>
            <CommandInput placeholder="Search currency..." />
            <CommandList>
              <CommandEmpty>No currency found.</CommandEmpty>
              <CommandGroup heading="Currencies">
                {CURRENCIES.map((currency) => (
                  <CommandItem
                    key={currency.code}
                    onSelect={() => {
                      if (selected.includes(currency.code)) {
                        onChange(selected.filter((s) => s !== currency.code))
                      } else {
                        onChange([...selected, currency.code])
                      }
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selected.includes(currency.code) ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{currency.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {currency.code} - {currency.symbol}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
