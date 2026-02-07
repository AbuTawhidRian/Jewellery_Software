import { getCustomers } from '@/app/actions/customers'
import { CustomersTable } from '@/components/customers/customers-table'
import { AddCustomerDialog } from '@/components/customers/add-customer-dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function CustomersPage() {
  const customers = await getCustomers()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            Manage your customers and view their transaction history
          </p>
        </div>
        <AddCustomerDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </AddCustomerDialog>
      </div>

      <CustomersTable customers={customers} />
    </div>
  )
}
