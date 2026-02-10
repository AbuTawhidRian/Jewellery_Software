'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlusCircle, Gem, TrendingUp, TrendingDown, Scale } from 'lucide-react'
import { AddGoldTransactionDialog } from '@/components/gold-ledger/add-gold-transaction-dialog'
import { GoldTransactionsTable } from '@/components/gold-ledger/gold-transactions-table'
import { useLanguage } from '@/components/providers/language-provider'

interface GoldLedgerViewProps {
  transactions: any[] // Using any for minimal change, or defining Interface
  stats: {
    totalInActual: string
    totalInPure: string
    totalOutActual: string
    totalOutPure: string
    balanceActual: string
    balancePure: string
    karatBreakdown: Record<string, { actual: string; pure: string }>
  }
  customers: any[]
  vendors: any[]
  settings: any
  todayRate: any
}

export function GoldLedgerView({ transactions, stats, customers, vendors, settings, todayRate }: GoldLedgerViewProps) {
  const { t } = useLanguage()
  const customKarats = settings.customKarats || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.goldLedger.title}</h1>
          <p className="text-muted-foreground">
            {t.goldLedger.subtitle}
          </p>
        </div>
        <AddGoldTransactionDialog 
          customers={customers}
          vendors={vendors} 
          customKarats={customKarats}
          defaultCurrency={settings.currency || 'USD'}
          todayRate={todayRate}
        >
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t.goldLedger.add}
          </Button>
        </AddGoldTransactionDialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.goldLedger.totalIn}</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInPure}g</div>
            <div className="text-sm font-medium text-muted-foreground mt-1">
              Actual: {stats.totalInActual}g
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t.goldLedger.received}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.goldLedger.totalOut}</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOutPure}g</div>
            <div className="text-sm font-medium text-muted-foreground mt-1">
                Actual: {stats.totalOutActual}g
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t.goldLedger.used}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-900">{t.goldLedger.balance}</CardTitle>
            <Scale className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
              <div>
                <div className="text-2xl font-bold text-amber-900">{stats.balancePure}g</div>
                <div className="text-sm font-medium text-amber-700 mt-1">
                    Actual: {stats.balanceActual}g
                </div>
                <p className="text-xs text-amber-700 mt-1">
                  {t.goldLedger.inventory}
                </p>
              </div>
              
              <div className="flex-1 xl:max-w-[260px] border-t xl:border-t-0 xl:border-l border-amber-200 pt-4 xl:pt-0 xl:pl-4">
                <div className="flex items-center justify-between mb-2 px-1">
                  <p className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">Inventory By Karat</p>
                </div>
                
                <div className="rounded-md overflow-hidden border border-amber-200/50">
                  <div className="grid grid-cols-3 bg-amber-100/50 py-1.5 px-2 text-[10px] font-bold text-amber-900 uppercase tracking-tighter border-b border-amber-200/50">
                    <span>Karat</span>
                    <span className="text-right">Pure (g)</span>
                    <span className="text-right">Actual (g)</span>
                  </div>
                  <div className="divide-y divide-amber-200/30 max-h-[160px] overflow-y-auto">
                    {Object.entries(stats.karatBreakdown || {}).sort((a, b) => {
                      const numA = parseFloat(a[0].replace(/[^0-9.]/g, ''))
                      const numB = parseFloat(b[0].replace(/[^0-9.]/g, ''))
                      if (!isNaN(numA) && !isNaN(numB)) return numB - numA
                      return a[0].localeCompare(b[0])
                    }).map(([karat, vals]) => (
                      <div key={karat} className="grid grid-cols-3 py-2 px-2 text-[11px] hover:bg-amber-100/30 transition-colors">
                        <span className="text-amber-800 font-bold truncate">
                          {isNaN(Number(karat)) || Number(karat) > 24 ? karat : `${karat}K`}
                        </span>
                        <span className="text-amber-900 font-medium text-right font-mono">{vals.pure}</span>
                        <span className="text-amber-700 text-right font-mono">{vals.actual}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="capitalize">{t.table.transactions}</CardTitle>
        </CardHeader>
        <CardContent>
          <GoldTransactionsTable transactions={transactions} customKarats={customKarats} />
        </CardContent>
      </Card>
    </div>
  )
}
