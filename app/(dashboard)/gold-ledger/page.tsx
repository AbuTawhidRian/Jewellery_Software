import { getGoldTransactions, getGoldStats } from '@/app/actions/gold-ledger'
import { getCustomers } from '@/app/actions/customers'
import { getCompanySettings } from '@/app/actions/settings'
import { getVendors } from '@/app/actions/vendors'
import { GoldLedgerView } from '@/components/gold-ledger/gold-ledger-view'

export const dynamic = 'force-dynamic'

export default async function GoldLedgerPage() {
  const [transactions, stats, customers, vendors, settings] = await Promise.all([
    getGoldTransactions(),
    getGoldStats(),
    getCustomers(),
    getVendors(),
    getCompanySettings(),
  ])

  return (
    <GoldLedgerView 
      transactions={transactions}
      stats={stats}
      customers={customers}
      vendors={vendors}
      settings={settings}
    />
  )
}
