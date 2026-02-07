'use client'

import { format } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatCurrencyValue } from '@/lib/currencies'

interface CashTransactionsTableProps {
  transactions: any[]
}

export function CashTransactionsTable({ transactions }: CashTransactionsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Account / Customer</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                No transactions found.
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((t) => (
              <TableRow key={t.id}>
                <TableCell>{format(new Date(t.date), 'dd MMM yyyy')}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={t.type === 'RECEIVE' ? 'text-green-600 border-green-600' : 'text-red-600 border-red-600'}>
                    {t.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  {t.account ? (
                    <div className="flex flex-col">
                      <span className="font-medium text-blue-600">{t.account.name}</span>
                      <span className="text-xs text-muted-foreground uppercase">{t.account.type}</span>
                    </div>
                  ) : t.vendor ? (
                    <div className="flex flex-col">
                      <span className="font-medium text-purple-600">{t.vendor.name}</span>
                      <span className="text-xs text-muted-foreground uppercase">Vendor</span>
                    </div>
                  ) : t.customer ? (
                    <div className="flex flex-col">
                      <span className="font-medium">{t.customer.name}</span>
                      <span className="text-xs text-muted-foreground italic">Customer Payment</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className={`font-bold ${t.type === 'RECEIVE' ? 'text-green-600' : 'text-red-600'}`}>
                  {t.type === 'RECEIVE' ? '+' : '-'} {formatCurrencyValue(Number(t.amount), t.currency)}
                </TableCell>
                <TableCell className="max-w-[200px] truncate" title={t.notes || ''}>
                  {t.notes || '-'}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
