'use client'

import { useState } from 'react'
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

interface AddGoldTransactionDialogProps {
  children: React.ReactNode
  customers?: Array<{ id: string; name: string }>
  customKarats?: Record<string, number>
}

export function AddGoldTransactionDialog({ 
  children, 
  customers = [],
  customKarats = {}
}: AddGoldTransactionDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: 'RECEIVE_GOLD',
    weight: '',
    purity: '',
    karat: '',
    customerId: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  })

  // Get karats from settings or fallback
  const karats = Object.keys(customKarats).length > 0 
    ? Object.entries(customKarats)
        .map(([k, p]) => ({ karat: k, purity: p }))
        .sort((a, b) => Number(b.karat) - Number(a.karat))
    : [
        { karat: '24', purity: 99.9 },
        { karat: '22', purity: 91.6 },
        { karat: '21', purity: 87.5 },
        { karat: '18', purity: 75.0 },
      ]

  const handleKaratChange = (karatVal: string) => {
    const mapping = karats.find(k => k.karat === karatVal)
    setFormData({
      ...formData,
      karat: karatVal,
      purity: mapping ? mapping.purity.toString() : formData.purity
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await createGoldTransaction({
        type: formData.type as any,
        weight: parseFloat(formData.weight),
        purity: parseFloat(formData.purity),
        customerId: formData.customerId || undefined,
        date: new Date(formData.date),
        notes: formData.notes || undefined,
      })

      toast.success('Transaction added successfully')
      setOpen(false)
      setFormData({
        type: 'RECEIVE_GOLD',
        weight: '',
        purity: '',
        karat: '',
        customerId: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      })
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to add transaction')
    } finally {
      setLoading(false)
    }
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
            Record a new gold transaction in the ledger
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Transaction Type */}
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
                  <SelectItem value="RECEIVE_GOLD">Receive Gold</SelectItem>
                  <SelectItem value="USE_FOR_JEWELLERY">Use for Jewellery</SelectItem>
                  <SelectItem value="JEWELLERY_DELIVERY">Jewellery Delivery</SelectItem>
                  <SelectItem value="JEWELLERY_RETURN">Jewellery Return</SelectItem>
                  <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Weight */}
            <div className="grid gap-2">
              <Label htmlFor="weight">Weight (grams)</Label>
              <Input
                id="weight"
                type="number"
                step="0.001"
                placeholder="100.500"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                required
              />
            </div>

            {/* Karat & Purity */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="karat">Karat</Label>
                <Select
                  value={formData.karat}
                  onValueChange={handleKaratChange}
                >
                  <SelectTrigger id="karat">
                    <SelectValue placeholder="Select Karat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom</SelectItem>
                    {karats.map((k) => (
                      <SelectItem key={k.karat} value={k.karat}>
                        {k.karat}K
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="purity">Purity (%)</Label>
                <Input
                  id="purity"
                  type="number"
                  step="0.01"
                  placeholder="91.60"
                  value={formData.purity}
                  onChange={(e) => setFormData({ ...formData, purity: e.target.value, karat: 'custom' })}
                  required
                />
              </div>
            </div>


            {/* Customer */}
            <div className="grid gap-2">
              <Label htmlFor="customer">Customer (Optional)</Label>
              <Select
                value={formData.customerId}
                onValueChange={(value) => setFormData({ ...formData, customerId: value })}
              >
                <SelectTrigger id="customer">
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
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

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Additional details..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Transaction'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
