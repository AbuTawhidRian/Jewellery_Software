'use client'

import { useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createCashTransaction } from '@/app/actions/cash-ledger'

const cashTransactionSchema = z.object({
  type: z.enum(['CASH_RECEIPT', 'CASH_PAYMENT', 'ADJUSTMENT']),
  amount: z.coerce.number().positive('Amount must be positive'),
  currency: z.string().min(1, 'Currency is required'),
  notes: z.string().optional(),
  customerId: z.string().optional().nullable(),
  vendorId: z.string().optional().nullable(),
  accountId: z.string().optional().nullable(),
  date: z.string().optional(),
})

type CashTransactionFormValues = z.infer<typeof cashTransactionSchema>

interface AddCashTransactionDialogProps {
  customers: { id: string; name: string }[]
  accounts: { id: string; name: string; type: string }[]
  vendors: { id: string; name: string }[]
  currencies: string[]
  defaultCurrency?: string
  children?: React.ReactNode
}

export function AddCashTransactionDialog({
  customers,
  accounts,
  vendors,
  currencies,
  defaultCurrency,
  children
}: AddCashTransactionDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [targetType, setTargetType] = useState<'CUSTOMER' | 'ACCOUNT' | 'VENDOR'>('ACCOUNT')

  const form = useForm<CashTransactionFormValues>({
    resolver: zodResolver(cashTransactionSchema) as Resolver<CashTransactionFormValues>,
    defaultValues: {
      type: 'CASH_PAYMENT',
      amount: 0,
      currency: defaultCurrency || currencies[0] || 'USD',
      notes: '',
      customerId: null,
      vendorId: null,
      accountId: null,
      date: new Date().toISOString().split('T')[0],
    },
  })

  async function onSubmit(values: CashTransactionFormValues) {
    setLoading(true)
    try {
      await createCashTransaction({
        ...values,
        date: values.date ? new Date(values.date) : new Date(),
      })
      toast.success('Transaction recorded')
      setOpen(false)
      form.reset()
    } catch (error: any) {
      toast.error(error.message || 'Failed to record transaction')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Cash Transaction
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Cash Transaction</DialogTitle>
          <DialogDescription>
            Record cash income, expense, or customer payment.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CASH_RECEIPT">Cash Receipt (Money In)</SelectItem>
                        <SelectItem value="CASH_PAYMENT">Cash Payment (Money Out)</SelectItem>
                        <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currencies.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <FormLabel>Transaction With</FormLabel>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant={targetType === 'ACCOUNT' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setTargetType('ACCOUNT')
                    form.setValue('customerId', null)
                    form.setValue('vendorId', null)
                  }}
                >
                  Account
                </Button>
                <Button 
                  type="button" 
                  variant={targetType === 'CUSTOMER' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setTargetType('CUSTOMER')
                    form.setValue('accountId', null)
                    form.setValue('vendorId', null)
                  }}
                >
                  Customer
                </Button>
                <Button 
                  type="button" 
                  variant={targetType === 'VENDOR' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setTargetType('VENDOR')
                    form.setValue('accountId', null)
                    form.setValue('customerId', null)
                  }}
                >
                  Vendor
                </Button>
              </div>
            </div>

            {targetType === 'ACCOUNT' ? (
              <FormField
                control={form.control}
                name="accountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category / Account</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accounts.map((acc) => (
                          <SelectItem key={acc.id} value={acc.id}>
                            {acc.name} ({acc.type.toLowerCase()})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : targetType === 'CUSTOMER' ? (
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="vendorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vendor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vendors.map((v) => (
                          <SelectItem key={v.id} value={v.id}>
                            {v.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Optional details..." 
                      className="resize-none" 
                      {...field} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Saving...' : 'Record Transaction'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
