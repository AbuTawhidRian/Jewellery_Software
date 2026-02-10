'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlusCircle, Wallet, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { AddCashTransactionDialog } from '@/components/cash-ledger/add-cash-transaction-dialog'
import { CashTransactionsTable } from '@/components/cash-ledger/cash-transactions-table'
import { formatCurrencyValue } from '@/lib/currencies'
import { useLanguage } from '@/components/providers/language-provider'

interface CashLedgerViewProps {
  transactions: any[]
  stats: {
    totalIn: number
    totalOut: number
    balance: number
  }
  customers: any[]
  accounts: any[]
  vendors: any[]
  settings: any
}

export function CashLedgerView({ transactions, stats, customers, accounts, vendors, settings }: CashLedgerViewProps) {
  const { t } = useLanguage()
  const defaultCurrency = settings.currency || 'USD'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.cashLedger.title}</h1>
          <p className="text-muted-foreground">
            {t.cashLedger.subtitle}
          </p>
        </div>
        <AddCashTransactionDialog 
          customers={customers} 
          accounts={accounts}
          vendors={vendors}
          currencies={settings.currencies || ['USD']}
          defaultCurrency={defaultCurrency}
        >
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t.cashLedger.add}
          </Button>
        </AddCashTransactionDialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.cashLedger.totalIn}</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrencyValue(stats.totalIn, defaultCurrency)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t.cashLedger.received}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.cashLedger.totalOut}</CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrencyValue(stats.totalOut, defaultCurrency)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t.cashLedger.paid}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">{t.cashLedger.balance}</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {formatCurrencyValue(stats.balance, defaultCurrency)}
            </div>
            <p className="text-xs text-blue-700">
              {t.cashLedger.netCash}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="capitalize">{t.table.transactions}</CardTitle>
        </CardHeader>
        <CardContent>
          <CashTransactionsTable transactions={transactions} />
        </CardContent>
      </Card>
    </div>
  )
}
