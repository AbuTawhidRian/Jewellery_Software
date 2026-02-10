'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createCustomer, CustomerFormData } from '@/app/actions/customers'
import { COUNTRIES } from '@/lib/countries'
import { toast } from 'sonner'

import { useLanguage } from '@/components/providers/language-provider'

export function AddCustomerDialog({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    phone: '',
    email: '',
    address: '',
    trn: '',
    country: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await createCustomer(formData)
      toast.success('Customer added successfully')
      setOpen(false)
      setFormData({
        name: '',
        phone: '',
        email: '',
        address: '',
        trn: '',
        country: '',
      })
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to add customer')
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
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t.customers.add}</DialogTitle>
            <DialogDescription>
              {/* Optional: Add a localized description or remove it. Removing for simplicity/cleanliness as title is self-explanatory */}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{t.table.name} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t.table.name}
                required
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">{t.table.phone}</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1234567890"
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">{t.table.email}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="customer@example.com"
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="trn">TRN Number</Label>
              <Input
                id="trn"
                value={formData.trn}
                onChange={(e) => setFormData({ ...formData, trn: e.target.value })}
                placeholder="TRN Number"
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="country">Country</Label>
              <Select
                value={formData.country}
                onValueChange={(value) => setFormData({ ...formData, country: value })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country.code} value={country.name}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">{t.table.address}</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder={t.table.address}
                rows={3}
                disabled={loading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t.common.loading : t.common.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
