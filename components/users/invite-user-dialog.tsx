'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import { Plus, Loader2, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import { inviteUser } from '@/app/actions/users'

const inviteSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
  role: z.enum(['SUPER_ADMIN', 'OWNER', 'COMPANY_ADMIN', 'ACCOUNTANT', 'PRODUCTION_STAFF', 'VIEWER']),
  companyId: z.string().optional(),
}).refine((data) => {
  return true
})

interface InviteUserDialogProps {
  companies?: { id: string; name: string }[]
  currentUserRole?: string
}

export function InviteUserDialog({ companies = [], currentUserRole }: InviteUserDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [inviteDetails, setInviteDetails] = useState<{email: string, password: string} | null>(null)
  const [copied, setCopied] = useState(false)

  const headers = { 
    'SUPER_ADMIN': ['SUPER_ADMIN', 'OWNER', 'COMPANY_ADMIN', 'ACCOUNTANT', 'PRODUCTION_STAFF', 'VIEWER'],
    'OWNER': ['OWNER', 'COMPANY_ADMIN', 'ACCOUNTANT', 'PRODUCTION_STAFF', 'VIEWER'],
    'COMPANY_ADMIN': ['ACCOUNTANT', 'PRODUCTION_STAFF', 'VIEWER'],
  }
  
  // @ts-ignore
  const allowedRoles = headers[currentUserRole] || ['VIEWER']

  const form = useForm<z.infer<typeof inviteSchema>>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'VIEWER',
      companyId: '',
    },
  })

  // Watch the role to conditionally show company select
  const selectedRole = form.watch('role')
  const showCompanySelect = (currentUserRole === 'OWNER' || currentUserRole === 'SUPER_ADMIN') && 
                            selectedRole !== 'OWNER' && 
                            selectedRole !== 'SUPER_ADMIN'

  async function onSubmit(values: z.infer<typeof inviteSchema>) {
    setLoading(true)
    try {
      if (showCompanySelect && !values.companyId) {
        form.setError('companyId', { message: 'Company is required for this role' })
        setLoading(false)
        return
      }

      await inviteUser(values)
      toast.success('User invite sent successfully')
      // Save details to show in UI
      setInviteDetails({ email: values.email, password: values.password })
      form.reset()
    } catch (error: any) {
      toast.error(error.message || 'Failed to invite user')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (!inviteDetails) return
    const text = `Here are your login details:\nURL: ${window.location.origin}/login\nEmail: ${inviteDetails.email}\nPassword: ${inviteDetails.password}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Login details copied to clipboard')
  }

  const handleReset = () => {
    setOpen(false)
    setInviteDetails(null)
    setCopied(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) handleReset()
      else setOpen(true)
    }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Invite User
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            {inviteDetails 
              ? "User invited successfully. Share these credentials with them."
              : "Add a new user to your organization. They will act within your company context."
            }
          </DialogDescription>
        </DialogHeader>

        {inviteDetails ? (
           <div className="space-y-4">
             <div className="p-4 bg-muted rounded-md space-y-2 text-sm">
               <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                 <span className="font-semibold text-muted-foreground">URL:</span>
                 <span className="font-mono bg-background px-2 py-1 rounded border overflow-hidden text-ellipsis whitespace-nowrap">{typeof window !== 'undefined' ? window.location.origin : ''}/login</span>
               </div>
               <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                 <span className="font-semibold text-muted-foreground">Email:</span>
                 <span className="font-mono bg-background px-2 py-1 rounded border">{inviteDetails.email}</span>
               </div>
               <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                 <span className="font-semibold text-muted-foreground">Password:</span>
                 <span className="font-mono bg-background px-2 py-1 rounded border">{inviteDetails.password}</span>
               </div>
             </div>
             
             <DialogFooter className="sm:justify-between gap-2">
               <Button variant="outline" onClick={handleReset} className="w-full sm:w-auto order-2 sm:order-1">
                 Close
               </Button>
               <Button onClick={handleCopy} className="w-full sm:w-auto order-1 sm:order-2">
                 {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                 {copied ? 'Copied' : 'Copy Details'}
               </Button>
             </DialogFooter>
           </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {/* 
                          Dynamically render roles based on permissions could be better, 
                          but for now let's just show options. 
                          Ideally we filter this list.
                        */}
                        {allowedRoles.includes('SUPER_ADMIN') && <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>}
                        {allowedRoles.includes('OWNER') && <SelectItem value="OWNER">Owner</SelectItem>}
                        {allowedRoles.includes('COMPANY_ADMIN') && <SelectItem value="COMPANY_ADMIN">Company Admin</SelectItem>}
                        {allowedRoles.includes('ACCOUNTANT') && <SelectItem value="ACCOUNTANT">Accountant</SelectItem>}
                        {allowedRoles.includes('PRODUCTION_STAFF') && <SelectItem value="PRODUCTION_STAFF">Production Staff</SelectItem>}
                        {allowedRoles.includes('VIEWER') && <SelectItem value="VIEWER">Viewer</SelectItem>}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {showCompanySelect && (
                <FormField
                  control={form.control}
                  name="companyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a company" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {companies.map((company) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <DialogFooter>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Invite
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
