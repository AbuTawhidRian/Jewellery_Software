'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createGoldTransaction } from '@/app/actions/gold-ledger'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Check, ChevronsUpDown, User, Truck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatTransactionType } from '@/lib/karat-utils'

interface AddGoldTransactionDialogProps {
  children: React.ReactNode
  customers?: Array<{ id: string; name: string }>
  vendors?: Array<{ id: string; name: string }>
  customKarats?: Record<string, number>
  defaultCurrency?: string
  todayRate?: {
    gold24k: number
    gold22k: number
    gold18k: number
    silver: number
    updatedAt: Date
    isOldRate?: boolean
  } | null
}

export function AddGoldTransactionDialog({ 
  children, 
  customers = [],
  vendors = [],
  customKarats = {},
  defaultCurrency = 'USD',
  todayRate
}: AddGoldTransactionDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [accountSearchOpen, setAccountSearchOpen] = useState(false)
  
  const [formData, setFormData] = useState({
    type: 'METAL_PURCHASE',
    weight: '',
    purity: '',
    karat: '',
    customerId: 'none',
    vendorId: 'none',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    makingRate: '',
    totalMakingCharge: '',
    goldRate: '',
    totalGoldValue: '',
  })

  const [userEditedNotes, setUserEditedNotes] = useState(false)

  // Combined accounts for search
  const accounts = useMemo(() => [
    ...customers.map(c => ({ id: c.id, name: c.name, type: 'CUSTOMER' as const })),
    ...vendors.map(v => ({ id: v.id, name: v.name, type: 'VENDOR' as const }))
  ], [customers, vendors])

  const selectedAccount = useMemo(() => 
    accounts.find(a => 
      (a.type === 'CUSTOMER' && a.id === formData.customerId) || 
      (a.type === 'VENDOR' && a.id === formData.vendorId)
    ), [accounts, formData.customerId, formData.vendorId])

  // Get karats from settings or fallback
  const karats = useMemo(() => (Object.keys(customKarats).length > 0 
    ? Object.entries(customKarats)
        .map(([k, p]) => ({ karat: k, purity: p }))
        .sort((a, b) => Number(b.karat) - Number(a.karat))
    : [
        { karat: '24', purity: 0.999 },
        { karat: '22', purity: 0.916 },
        { karat: '21', purity: 0.875 },
        { karat: '18', purity: 0.750 },
      ]).filter(k => !['999', '995', 'TT Bar'].includes(k.karat)), [customKarats])

  // Auto-narration effect
  useEffect(() => {
    if (userEditedNotes) return

    const typeLabel = formatTransactionType(formData.type)
    const karatLabel = formData.karat === 'custom' ? `${(Number(formData.purity) * 100).toFixed(1)}%` : (formData.karat ? (isNaN(Number(formData.karat)) || Number(formData.karat) > 24 ? formData.karat : `${formData.karat}K`) : '')
    const weightLabel = formData.weight ? `${formData.weight}g` : ''
    const valueLabel = formData.totalGoldValue ? `@ ${formData.goldRate}/${defaultCurrency}` : ''
    
    let parts = []
    if (typeLabel) parts.push(typeLabel)
    if (weightLabel) parts.push(weightLabel)
    if (karatLabel) parts.push(karatLabel)
    if (valueLabel) parts.push(valueLabel)
    
    setFormData(prev => ({ ...prev, notes: parts.join(': ') }))
  }, [formData.type, formData.weight, formData.karat, formData.purity, formData.goldRate, formData.totalGoldValue, defaultCurrency, userEditedNotes])

  // Making Rate / Total Charge calculation
  const handleMakingRateChange = (val: string) => {
    const rate = parseFloat(val)
    const weight = parseFloat(formData.weight)
    let total = ''
    if (!isNaN(rate) && !isNaN(weight)) {
      total = (rate * weight).toFixed(2)
    }
    setFormData({ ...formData, makingRate: val, totalMakingCharge: total })
  }

  const handleTotalMakingChange = (val: string) => {
    const total = parseFloat(val)
    const weight = parseFloat(formData.weight)
    let rate = ''
    if (!isNaN(total) && !isNaN(weight) && weight !== 0) {
      rate = (total / weight).toFixed(2)
    }
    setFormData({ ...formData, totalMakingCharge: val, makingRate: rate })
  }

  // Gold Rate / Total Value calculation
  const handleGoldRateChange = (val: string) => {
    const rate = parseFloat(val)
    const weight = parseFloat(formData.weight)
    let total = ''
    if (!isNaN(rate) && !isNaN(weight)) {
      total = (rate * weight).toFixed(2)
    }
    setFormData({ ...formData, goldRate: val, totalGoldValue: total })
  }

  const handleTotalGoldChange = (val: string) => {
    const total = parseFloat(val)
    const weight = parseFloat(formData.weight)
    let rate = ''
    if (!isNaN(total) && !isNaN(weight) && weight !== 0) {
      rate = (total / weight).toFixed(2)
    }
    setFormData({ ...formData, totalGoldValue: val, goldRate: rate })
  }

  const handleKaratChange = (karatVal: string) => {
    let purity = formData.purity
    let autoRate = ''

    if (karatVal === '999' || karatVal === 'TT Bar') {
      purity = '0.9990'
      if (todayRate) autoRate = todayRate.gold24k.toString()
    } else if (karatVal === '995') {
      purity = '0.9950'
      if (todayRate) autoRate = todayRate.gold24k.toString()
    } else {
      const mapping = karats.find(k => k.karat === karatVal)
      if (mapping) {
        purity = mapping.purity.toFixed(4)
        
        // Auto-rate logic based on karat
        const kNum = Number(karatVal)
        if (todayRate) {
          if (kNum === 24) autoRate = todayRate.gold24k.toString()
          else if (kNum === 22) autoRate = todayRate.gold22k.toString()
          else if (kNum === 18) autoRate = todayRate.gold18k.toString()
        }
      }
    }

    const weight = parseFloat(formData.weight)
    let totalVal = ''
    if (autoRate && !isNaN(weight)) {
      totalVal = (parseFloat(autoRate) * weight).toFixed(2)
    }

    setFormData({
      ...formData,
      karat: karatVal,
      purity,
      goldRate: autoRate || formData.goldRate,
      totalGoldValue: autoRate ? totalVal : formData.totalGoldValue
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        type: formData.type as any,
        weight: parseFloat(formData.weight),
        purity: parseFloat(formData.purity),
        customerId: (formData.customerId && formData.customerId !== 'none') ? formData.customerId : undefined,
        vendorId: (formData.vendorId && formData.vendorId !== 'none') ? formData.vendorId : undefined,
        date: new Date(formData.date),
        notes: formData.notes || undefined,
        makingRate: formData.makingRate ? parseFloat(formData.makingRate) : undefined,
        metalRate: formData.goldRate ? parseFloat(formData.goldRate) : undefined,
      }
      
      await createGoldTransaction(payload)
      
      toast.success('Transaction added successfully')
      setOpen(false)
      resetForm()
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to add transaction')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      type: 'METAL_PURCHASE',
      weight: '',
      purity: '',
      karat: '',
      customerId: 'none',
      vendorId: 'none',
      date: new Date().toISOString().split('T')[0],
      notes: '',
      makingRate: '',
      totalMakingCharge: '',
      goldRate: '',
      totalGoldValue: '',
    })
    setUserEditedNotes(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Gold Transaction</DialogTitle>
          <DialogDescription>
            Record gold transaction and automatically update accounts
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-5 py-4">
            {/* Row 1: Date & Account */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label>Account (Customer/Vendor)</Label>
                <Popover open={accountSearchOpen} onOpenChange={setAccountSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={accountSearchOpen}
                      className="w-full justify-between font-normal"
                    >
                      {selectedAccount ? (
                        <span className="flex items-center gap-2 truncate">
                          {selectedAccount.type === 'CUSTOMER' ? <User className="size-3" /> : <Truck className="size-3" />}
                          {selectedAccount.name}
                        </span>
                      ) : (
                        "Search account..."
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search name..." />
                      <CommandList>
                        <CommandEmpty>No account found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            onSelect={() => {
                              setFormData({ ...formData, customerId: 'none', vendorId: 'none' })
                              setAccountSearchOpen(false)
                            }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", (formData.customerId === 'none' && formData.vendorId === 'none') ? "opacity-100" : "opacity-0")} />
                            None (Direct)
                          </CommandItem>
                          {accounts.map((acc) => (
                            <CommandItem
                              key={`${acc.type}-${acc.id}`}
                              onSelect={() => {
                                setFormData({ 
                                  ...formData, 
                                  customerId: acc.type === 'CUSTOMER' ? acc.id : 'none',
                                  vendorId: acc.type === 'VENDOR' ? acc.id : 'none'
                                })
                                setAccountSearchOpen(false)
                              }}
                            >
                              <Check className={cn("mr-2 h-4 w-4", (acc.id === formData.customerId || acc.id === formData.vendorId) ? "opacity-100" : "opacity-0")} />
                              <div className="flex items-center gap-2">
                                {acc.type === 'CUSTOMER' ? <User className="size-3 text-blue-500" /> : <Truck className="size-3 text-purple-500" />}
                                <span>{acc.name}</span>
                                <span className="text-[10px] text-muted-foreground uppercase">{acc.type}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Row 2: Type */}
            <div className="grid gap-2">
              <Label htmlFor="type">Transaction Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="METAL_PURCHASE">Metal Purchase</SelectItem>
                  <SelectItem value="METAL_SALE">Metal Sale</SelectItem>
                  <SelectItem value="METAL_RECEIPT">Metal Receipt</SelectItem>
                  <SelectItem value="METAL_PAYMENT">Metal Payment</SelectItem>
                  <SelectItem value="METAL_RECEIPT_RETURN">Metal Receipt Return</SelectItem>
                  <SelectItem value="METAL_PAYMENT_RETURN">Metal Payment Return</SelectItem>
                  <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Row 3: Weight & Karat */}
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2 col-span-1">
                <Label htmlFor="weight">Weight (g)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.001"
                  placeholder="0.000"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2 col-span-1">
                <Label htmlFor="karat">Karat</Label>
                <Select
                  value={formData.karat}
                  onValueChange={handleKaratChange}
                >
                  <SelectTrigger id="karat">
                    <SelectValue placeholder="Standard" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom</SelectItem>
                    <SelectItem value="999">999</SelectItem>
                    <SelectItem value="995">995</SelectItem>
                    <SelectItem value="TT Bar">TT Bar</SelectItem>
                    {karats.map((k) => (
                      <SelectItem key={k.karat} value={k.karat}>
                        {isNaN(Number(k.karat)) || Number(k.karat) > 24 ? k.karat : `${k.karat}K`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2 col-span-1">
                <Label htmlFor="purity">Purity</Label>
                <Input
                  id="purity"
                  type="number"
                  step="0.0001"
                  placeholder="0.0000"
                  value={formData.purity}
                  onChange={(e) => setFormData({ ...formData, purity: e.target.value, karat: 'custom' })}
                  required
                />
              </div>
            </div>

            {/* Row 4: Metal Price (Link for Purchase/Sale) */}
            {(formData.type === 'METAL_PURCHASE' || formData.type === 'METAL_SALE') && (
              <div className="bg-amber-50/50 p-4 rounded-lg border border-dashed border-amber-200 space-y-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-amber-900 flex items-center gap-2">
                  <div className="size-1 bg-amber-500 rounded-full" />
                  Gold Value Accounting (Auto Cash Posting)
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="goldRate" className="text-xs">Gold Rate / g</Label>
                    <Input
                      id="goldRate"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="h-8 text-sm"
                      value={formData.goldRate}
                      onChange={(e) => handleGoldRateChange(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="totalGold" className="text-xs">Total Value ({defaultCurrency})</Label>
                    <Input
                      id="totalGold"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="h-8 text-sm font-semibold text-amber-900 bg-amber-100/30"
                      value={formData.totalGoldValue}
                      onChange={(e) => handleTotalGoldChange(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Row 5: Making Charges (Linked) */}
            {(formData.customerId !== 'none' || formData.vendorId !== 'none') && (
              <div className="bg-muted/30 p-4 rounded-lg border border-dashed border-muted-foreground/20 space-y-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <div className="size-1 bg-green-500 rounded-full" />
                  Automatic Account Posting (Making)
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="makingRate" className="text-xs">Making Rate / g</Label>
                    <Input
                      id="makingRate"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="h-8 text-sm"
                      value={formData.makingRate}
                      onChange={(e) => handleMakingRateChange(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="totalMaking" className="text-xs">Total Making ({defaultCurrency})</Label>
                    <Input
                      id="totalMaking"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="h-8 text-sm font-semibold text-green-700 bg-green-50/30"
                      value={formData.totalMakingCharge}
                      onChange={(e) => handleTotalMakingChange(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Row 5: Notes / Narration */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes / Narration</Label>
              <Textarea
                id="notes"
                placeholder="Narration..."
                value={formData.notes}
                onChange={(e) => {
                  setFormData({ ...formData, notes: e.target.value })
                  setUserEditedNotes(true)
                }}
                rows={2}
                className="resize-none"
              />
              {!userEditedNotes && <span className="text-[10px] text-muted-foreground italic px-1">Auto-generated based on details</span>}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="min-w-[120px]">
              {loading ? 'Saving...' : 'Save Transaction'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
