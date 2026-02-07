import { getVendors } from '@/app/actions/vendors'
import { VendorsTable } from '@/components/vendors/vendors-table'
import { AddVendorDialog } from '@/components/vendors/add-vendor-dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function VendorsPage() {
  const vendors = await getVendors()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendors</h1>
          <p className="text-muted-foreground">
            Manage your vendors and suppliers
          </p>
        </div>
        <AddVendorDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Vendor
          </Button>
        </AddVendorDialog>
      </div>

      <VendorsTable vendors={vendors} />
    </div>
  )
}
