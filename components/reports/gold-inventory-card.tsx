import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface GoldInventoryItem {
  purity: number
  receive: number
  pay: number
  balance: number
}

interface GoldInventoryCardProps {
  inventory: GoldInventoryItem[]
}

export function GoldInventoryCard({ inventory }: GoldInventoryCardProps) {
  // Calculate totals
  const totals = inventory.reduce(
    (acc, item) => ({
      receive: acc.receive + item.receive,
      pay: acc.pay + item.pay,
      balance: acc.balance + item.balance
    }),
    { receive: 0, pay: 0, balance: 0 }
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gold Inventory Summary</CardTitle>
        <CardDescription>Current gold stock by karat/purity</CardDescription>
      </CardHeader>
      <CardContent>
        {inventory.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No gold transactions yet
          </p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Karat/Purity</TableHead>
                  <TableHead className="text-right">Received (g)</TableHead>
                  <TableHead className="text-right">Paid (g)</TableHead>
                  <TableHead className="text-right">Balance (g)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((item) => (
                  <TableRow key={item.purity}>
                    <TableCell className="font-medium">{item.purity}K</TableCell>
                    <TableCell className="text-right text-green-600">
                      {item.receive.toFixed(3)}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      {item.pay.toFixed(3)}
                    </TableCell>
                    <TableCell className={`text-right font-semibold ${
                      item.balance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {item.balance.toFixed(3)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right text-green-600">
                    {totals.receive.toFixed(3)}
                  </TableCell>
                  <TableCell className="text-right text-red-600">
                    {totals.pay.toFixed(3)}
                  </TableCell>
                  <TableCell className={`text-right ${
                    totals.balance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {totals.balance.toFixed(3)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
