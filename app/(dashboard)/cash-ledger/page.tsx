import { getCashTransactions, getCashStats } from '@/app/actions/cash-ledger'
import { getCustomers } from '@/app/actions/customers'
import { getAccounts } from '@/app/actions/accounts'
import { getCompanySettings } from '@/app/actions/settings'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlusCircle, Wallet, ArrowUpRight, ArrowDownLeft, ReceiptText } from 'lucide-react'
import { AddCashTransactionDialog } from '@/components/cash-ledger/add-cash-transaction-dialog'
import { CashTransactionsTable } from '@/components/cash-ledger/cash-transactions-table'
import { formatCurrencyValue } from '@/lib/currencies'

import { getVendors } from '@/app/actions/vendors'

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

  // Get default currency for displays
  const defaultCurrency = settings.currency || 'USD'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cash Ledger</h1>
          <p className="text-muted-foreground">
            Manage income, expenses, and customer payments
          </p>
        </div>
        <AddCashTransactionDialog 
          customers={customers} 
          accounts={accounts}
          vendors={vendors}
          currencies={settings.currencies || ['USD']}
        >
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </AddCashTransactionDialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income (In)</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrencyValue(stats.totalIn, defaultCurrency)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total cash received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expense (Out)</CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrencyValue(stats.totalOut, defaultCurrency)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total cash paid out
            </p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Current Balance</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {formatCurrencyValue(stats.balance, defaultCurrency)}
            </div>
            <p className="text-xs text-blue-700">
              Net cash on hand
            </p>
          </CardContent>
        </Card>


      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Cash Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <CashTransactionsTable transactions={transactions} />
        </CardContent>
      </Card>
    </div>
  )
}
