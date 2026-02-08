import { getCashTransactions, getCashStats } from '@/app/actions/cash-ledger'
import { getCustomers } from '@/app/actions/customers'
import { getAccounts } from '@/app/actions/accounts'
import { getCompanySettings } from '@/app/actions/settings'
import { getVendors } from '@/app/actions/vendors'
import { CashLedgerView } from '@/components/cash-ledger/cash-ledger-view'

export const dynamic = 'force-dynamic'

export default async function CashLedgerPage() {
  const [transactions, stats, customers, accounts, vendors, settings] = await Promise.all([
    getCashTransactions(),
    getCashStats(),
    getCustomers(),
    getAccounts(),
    getVendors(),
    getCompanySettings(),
  ])

  return (
    <CashLedgerView 
      transactions={transactions}
      stats={stats}
      customers={customers}
      accounts={accounts}
      vendors={vendors}
      settings={settings}
    />
  )
}
