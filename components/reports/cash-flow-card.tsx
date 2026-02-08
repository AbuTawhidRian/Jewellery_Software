import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowDownIcon, ArrowUpIcon, WalletIcon } from 'lucide-react'

interface CashFlowItem {
  currency: string
  income: number
  expenses: number
  balance: number
}

interface CashFlowCardProps {
  cashFlow: CashFlowItem[]
}

export function CashFlowCard({ cashFlow }: CashFlowCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cash Flow Statement</CardTitle>
        <CardDescription>Income vs expenses summary</CardDescription>
      </CardHeader>
      <CardContent>
        {cashFlow.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No cash transactions yet
          </p>
        ) : (
          <div className="space-y-4">
            {cashFlow.map((item) => (
              <div key={item.currency} className="space-y-3">
                <h3 className="font-semibold text-lg">{item.currency}</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  {/* Income */}
                  <div className="flex items-center space-x-4 rounded-lg border p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                      <ArrowDownIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Income</p>
                      <p className="text-2xl font-bold text-green-600">
                        {item.income.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Expenses */}
                  <div className="flex items-center space-x-4 rounded-lg border p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                      <ArrowUpIcon className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Expenses</p>
                      <p className="text-2xl font-bold text-red-600">
                        {item.expenses.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Balance */}
                  <div className="flex items-center space-x-4 rounded-lg border p-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                      item.balance >= 0 ? 'bg-blue-100' : 'bg-orange-100'
                    }`}>
                      <WalletIcon className={`h-6 w-6 ${
                        item.balance >= 0 ? 'text-blue-600' : 'text-orange-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Balance</p>
                      <p className={`text-2xl font-bold ${
                        item.balance >= 0 ? 'text-blue-600' : 'text-orange-600'
                      }`}>
                        {item.balance.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
