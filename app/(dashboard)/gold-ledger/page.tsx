import { getGoldTransactions, getGoldStats } from '@/app/actions/gold-ledger'
import { getCustomers } from '@/app/actions/customers'
import { getCompanySettings } from '@/app/actions/settings'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlusCircle, Gem, TrendingUp, TrendingDown, Scale } from 'lucide-react'
import { AddGoldTransactionDialog } from '@/components/gold-ledger/add-gold-transaction-dialog'
import { GoldTransactionsTable } from '@/components/gold-ledger/gold-transactions-table'

export const dynamic = 'force-dynamic'

export default async function GoldLedgerPage() {
  const [transactions, stats, customers, settings] = await Promise.all([
    getGoldTransactions(),
    getGoldStats(),
    getCustomers(),
    getCompanySettings(),
  ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gold Ledger</h1>
          <p className="text-muted-foreground">
            Track and manage all gold transactions
          </p>
        </div>
        <AddGoldTransactionDialog 
          customers={customers} 
          customKarats={settings.customKarats || {}}
        >
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </AddGoldTransactionDialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gold In</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalIn}g</div>
            <p className="text-xs text-muted-foreground">
              Gold received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gold Out</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOut}g</div>
            <p className="text-xs text-muted-foreground">
              Gold used/delivered
            </p>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-900">Current Balance</CardTitle>
            <Scale className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">{stats.balance}g</div>
            <p className="text-xs text-amber-700">
              Net gold in inventory
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">By Karat</CardTitle>
            <Gem className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">24K:</span>
                <span className="font-medium">{stats.k24}g</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">22K:</span>
                <span className="font-medium">{stats.k22}g</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">18K:</span>
                <span className="font-medium">{stats.k18}g</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <GoldTransactionsTable transactions={transactions} />
        </CardContent>
      </Card>
    </div>
  )
}
