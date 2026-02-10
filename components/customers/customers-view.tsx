'use client'

import { useLanguage } from '@/components/providers/language-provider'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { CustomersTable } from '@/components/customers/customers-table'
import { AddCustomerDialog } from '@/components/customers/add-customer-dialog'

interface Customer {
  id: string
  name: string
  phone: string | null
  email: string | null
  trn: string | null
  country: string | null
  company: { name: string }
  _count: {
    goldTransactions: number
    cashTransactions: number
  }
}

export function CustomersView({ customers }: { customers: Customer[] }) {
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.customers.title}</h1>
          <p className="text-muted-foreground">
            {t.customers.subtitle}
          </p>
        </div>
        <AddCustomerDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t.customers.add}
          </Button>
        </AddCustomerDialog>
      </div>

      <CustomersTable customers={customers} />
    </div>
  )
}
