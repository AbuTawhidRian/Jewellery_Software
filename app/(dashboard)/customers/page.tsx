import { getCustomers } from '@/app/actions/customers'
import { CustomersView } from '@/components/customers/customers-view'

export const dynamic = 'force-dynamic'

export default async function CustomersPage() {
  const customers = await getCustomers()

  return (
    <CustomersView customers={customers} />
  )
}
