'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
import { Textarea } from '@/components/ui/textarea'
import { createVendor, updateVendor } from '@/app/actions/vendors'
import { toast } from 'sonner'
import { Store } from 'lucide-react'

const vendorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional().nullable(),
  email: z.string().email('Invalid email').optional().nullable().or(z.literal('')),
  address: z.string().optional().nullable(),
  taxId: z.string().optional().nullable(),
})

type VendorFormValues = z.infer<typeof vendorSchema>

interface AddVendorDialogProps {
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  vendorToEdit?: any
}

export function AddVendorDialog({ children, open, onOpenChange, vendorToEdit }: AddVendorDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen
  const setIsOpen = isControlled ? onOpenChange : setInternalOpen

  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      address: '',
      taxId: '',
    },
  })

  // Reset form when dialog opens/closes or edit mode changes
  useEffect(() => {
    if (isOpen) {
      if (vendorToEdit) {
        form.reset({
          name: vendorToEdit.name,
          phone: vendorToEdit.phone || '',
          email: vendorToEdit.email || '',
          address: vendorToEdit.address || '',
          taxId: vendorToEdit.taxId || '',
        })
      } else {
        form.reset({
          name: '',
          phone: '',
          email: '',
          address: '',
          taxId: '',
        })
      }
    }
  }, [isOpen, vendorToEdit, form])

  async function onSubmit(data: VendorFormValues) {
    try {
      if (vendorToEdit) {
        await updateVendor(vendorToEdit.id, data)
        toast.success('Vendor updated successfully')
      } else {
        await createVendor(data)
        toast.success('Vendor created successfully')
      }
      setIsOpen?.(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to save vendor')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{vendorToEdit ? 'Edit Vendor' : 'Add Vendor'}</DialogTitle>
          <DialogDescription>
            {vendorToEdit 
              ? 'Update existing vendor details.' 
              : 'Add a new vendor to your contacts.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Vendor Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                        <Input placeholder="+1234567890" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                
                <FormField
                control={form.control}
                name="taxId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Tax ID</FormLabel>
                    <FormControl>
                        <Input placeholder="Tax ID / VAT" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="vendor@example.com" type="email" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Address" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">
                {vendorToEdit ? 'Save Changes' : 'Create Vendor'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
