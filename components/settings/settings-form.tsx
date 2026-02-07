'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { updateCompanySettings } from '@/app/actions/settings'
import { CURRENCIES } from '@/lib/currencies'
import { CurrencyMultiSelect } from './currency-multi-select'
import { KaratEditor } from './karat-editor'
import { AccountEditor } from './account-editor'

const settingsSchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  country: z.string().min(1, 'Country is required'),
  currency: z.string().min(3).max(3),
  timezone: z.string().min(1),
  currencies: z.array(z.string()),
  customKarats: z.record(z.string(), z.number()),
})

interface SettingsFormProps {
  initialData: {
    name: string
    country: string
    currency: string
    timezone: string
    currencies: string[] | null
    customKarats: Record<string, number> | null
  }
}

export function SettingsForm({ initialData }: SettingsFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema) as any,
    defaultValues: {
      name: initialData.name || '',
      country: initialData.country || '',
      currency: initialData.currency || 'USD',
      timezone: initialData.timezone || 'UTC',
      currencies: initialData.currencies || [],
      customKarats: initialData.customKarats || {},
    },
  })

  async function onSubmit(values: z.infer<typeof settingsSchema>) {
    setLoading(true)
    try {
      await updateCompanySettings(values)
      toast.success('Settings updated successfully')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update settings')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="currency">Currency</TabsTrigger>
            <TabsTrigger value="gold">Gold Standards</TabsTrigger>
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Manage your company's basic information and localization.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="timezone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Timezone</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select timezone" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="UTC">UTC</SelectItem>
                            <SelectItem value="Asia/Dhaka">Asia/Dhaka (GMT+6)</SelectItem>
                            <SelectItem value="Asia/Dubai">Asia/Dubai (GMT+4)</SelectItem>
                            <SelectItem value="Asia/Yerevan">Asia/Yerevan (GMT+4)</SelectItem>
                            <SelectItem value="America/New_York">America/New_York (GMT-5)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="currency">
            <Card>
              <CardHeader>
                <CardTitle>Currency Settings</CardTitle>
                <CardDescription>
                  Configure your primary and secondary currencies.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Currency</FormLabel>
                      <FormDescription>
                        The primary currency used for accounting and reporting.
                      </FormDescription>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select primary currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CURRENCIES.map((c) => (
                            <SelectItem key={c.code} value={c.code}>
                              {c.name} ({c.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currencies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Currencies</FormLabel>
                      <FormDescription>
                        Enabled currencies for transactions and payments.
                      </FormDescription>
                      <FormControl>
                        <CurrencyMultiSelect 
                          selected={field.value} 
                          onChange={field.onChange} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gold">
            <Card>
              <CardHeader>
                <CardTitle>Gold Standards</CardTitle>
                <CardDescription>
                  Customize your karat-to-purity mappings. All values are editable.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="customKarats"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <KaratEditor 
                          value={field.value} 
                          onChange={field.onChange} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accounts">
            <AccountEditor />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? 'Saving Changes...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
