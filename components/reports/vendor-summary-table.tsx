import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format } from 'date-fns'

interface VendorSummary {
  id: string
  name: string
  goldPurchased: number
  cashSpent: Array<{ currency: string; amount: number }>
  transactionCount: number
  lastTransactionDate: Date | null
}

interface VendorSummaryTableProps {
  vendors: VendorSummary[]
}

export function VendorSummaryTable({ vendors }: VendorSummaryTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendor Purchase Summary</CardTitle>
        <CardDescription>Total purchases from each vendor</CardDescription>
      </CardHeader>
      <CardContent>
        {vendors.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No vendor transactions yet
          </p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor Name</TableHead>
                  <TableHead className="text-right">Gold Purchased (g)</TableHead>
                  <TableHead className="text-right">Cash Spent</TableHead>
                  <TableHead className="text-right">Transactions</TableHead>
                  <TableHead>Last Transaction</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendors.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell className="font-medium">{vendor.name}</TableCell>
                    <TableCell className="text-right font-mono">
                      {vendor.goldPurchased.toFixed(3)}
                    </TableCell>
                    <TableCell className="text-right">
                      {vendor.cashSpent.length === 0 ? (
                        <span className="text-muted-foreground">-</span>
                      ) : (
                        <div className="space-y-1">
                          {vendor.cashSpent.map((cash, idx) => (
                            <div key={idx} className="font-mono text-sm">
                              {cash.currency} {cash.amount.toFixed(2)}
                            </div>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {vendor.transactionCount}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {vendor.lastTransactionDate
                        ? format(new Date(vendor.lastTransactionDate), 'MMM dd, yyyy')
                        : '-'}
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
