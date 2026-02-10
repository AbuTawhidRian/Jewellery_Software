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
import { createCompany } from '@/app/actions/companies'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { useLanguage } from '@/components/providers/language-provider'

export function AddCompanyDialog() {
  const { t } = useLanguage()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    currency: 'USD',
    address: '',
    phone: '',
    email: '',
    trn: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await createCompany(formData)
      toast.success('Company created successfully')
      setOpen(false)
      setFormData({
        name: '',
        country: '',
        currency: 'USD',
        address: '',
        phone: '',
        email: '',
        trn: '',
      })
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to create company')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Company
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Company</DialogTitle>
            <DialogDescription>
              Enter the details of the new company. These details will appear on invoices and reports.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Company Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="JewelCraft Solutions"
                  required
                  disabled={loading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="trn">TRN Number</Label>
                <Input
                  id="trn"
                  value={formData.trn}
                  onChange={(e) => setFormData({ ...formData, trn: e.target.value })}
                  placeholder="100XXXXXXXXXXXX"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="United Arab Emirates"
                  required
                  disabled={loading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="currency">Base Currency *</Label>
                <Input
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  placeholder="AED"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+971 50 XXXXXXX"
                  disabled={loading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="info@company.com"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Business Tower, Office 404, Dubai, UAE"
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
              {loading ? t.common.loading : 'Create Company'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
