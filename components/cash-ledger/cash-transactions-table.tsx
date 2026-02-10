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

import { useLanguage } from '@/components/providers/language-provider'

export function CashTransactionsTable({ transactions }: CashTransactionsTableProps) {
  const { t } = useLanguage()

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t.table.date}</TableHead>
            <TableHead>{t.table.type}</TableHead>
            <TableHead>{t.table.customer} / {t.table.vendor}</TableHead>
            <TableHead>{t.table.amount}</TableHead>
            <TableHead>{t.table.notes}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                {t.table.noData}
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((t_item) => (
              <TableRow key={t_item.id}>
                <TableCell>{format(new Date(t_item.date), 'dd MMM yyyy')}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={t_item.type === 'CASH_RECEIPT' ? 'text-green-600 border-green-600' : 'text-red-600 border-red-600'}>
                    {t_item.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  {t_item.account ? (
                    <div className="flex flex-col">
                      <span className="font-medium text-blue-600">{t_item.account.name}</span>
                      <span className="text-xs text-muted-foreground uppercase">{t_item.account.type}</span>
                    </div>
                  ) : t_item.vendor ? (
                    <div className="flex flex-col">
                      <span className="font-medium text-purple-600">{t_item.vendor.name}</span>
                      <span className="text-xs text-muted-foreground uppercase">{t.table.vendor}</span>
                    </div>
                  ) : t_item.customer ? (
                    <div className="flex flex-col">
                      <span className="font-medium">{t_item.customer.name}</span>
                      <span className="text-xs text-muted-foreground italic">{t.table.customer}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className={`font-bold ${t_item.type === 'CASH_RECEIPT' ? 'text-green-600' : 'text-red-600'}`}>
                  {t_item.type === 'CASH_RECEIPT' ? '+' : '-'} {formatCurrencyValue(Number(t_item.amount), t_item.currency)}
                </TableCell>
                <TableCell className="max-w-[200px] truncate" title={t_item.notes || ''}>
                  {t_item.notes || '-'}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
