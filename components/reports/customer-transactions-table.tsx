import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { TransactionType } from '@prisma/client'

interface CustomerTransaction {
  id: string
  date: Date
  customerId: string
  customerName: string
  type: TransactionType
  transactionType: 'GOLD' | 'CASH'
  amount: string
  notes: string | null
}

interface CustomerTransactionsTableProps {
  transactions: CustomerTransaction[]
}

export function CustomerTransactionsTable({ transactions }: CustomerTransactionsTableProps) {
  const isReceiptType = (type: TransactionType) => {
    return ['CASH_RECEIPT', 'METAL_RECEIPT', 'METAL_RECEIPT_RETURN'].includes(type)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Transaction History</CardTitle>
        <CardDescription>All customer-related transactions</CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No customer transactions yet
          </p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Transaction</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      {format(new Date(transaction.date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>{transaction.customerName}</TableCell>
                    <TableCell>
                      <Badge variant={isReceiptType(transaction.type) ? 'default' : 'secondary'}>
                        {transaction.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {transaction.transactionType}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {transaction.amount}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm max-w-xs truncate">
                      {transaction.notes || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
