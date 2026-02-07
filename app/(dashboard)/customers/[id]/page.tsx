import { notFound } from 'next/navigation'
import { getCustomer } from '@/app/actions/customers'
import { EditCustomerDialog } from '@/components/customers/edit-customer-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Mail, Phone, MapPin, Pencil, Package, Coins, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { formatDistance } from 'date-fns'

export const dynamic = 'force-dynamic'

export default async function CustomerDetailsPage({ params }: { params: { id: string } }) {
  const customer = await getCustomer(params.id)

  if (!customer) {
    notFound()
  }

  const totalTransactions = (customer.goldTransactions?.length || 0) + (customer.cashTransactions?.length || 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/customers">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{customer.name}</h1>
            <p className="text-muted-foreground">Customer Details</p>
          </div>
        </div>
        <EditCustomerDialog customer={customer}>
          <Button>
            <Pencil className="mr-2 h-4 w-4" />
            Edit Customer
          </Button>
        </EditCustomerDialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customer.orders?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gold Transactions</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customer.goldTransactions?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Transactions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customer.cashTransactions?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>Customer contact details and address</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {customer.phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{customer.phone}</span>
            </div>
          )}
          {customer.email && (
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{customer.email}</span>
            </div>
          )}
          {customer.address && (
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <span className="whitespace-pre-wrap">{customer.address}</span>
            </div>
          )}
          {!customer.phone && !customer.email && !customer.address && (
            <p className="text-sm text-muted-foreground">No contact information available</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Orders */}
      {customer.orders && customer.orders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Last 10 orders from this customer</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.orders.map((order: any) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id.slice(0, 8)}</TableCell>
                    <TableCell>{formatDistance(new Date(order.createdAt), new Date(), { addSuffix: true })}</TableCell>
                    <TableCell>{order.status}</TableCell>
                    <TableCell className="text-right">${order.totalAmount?.toFixed(2) || '0.00'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      {totalTransactions > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Gold Transactions */}
          {customer.goldTransactions && customer.goldTransactions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Gold Transactions</CardTitle>
                <CardDescription>Last 10 gold transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Weight (g)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customer.goldTransactions.map((transaction: any) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{formatDistance(new Date(transaction.date), new Date(), { addSuffix: true })}</TableCell>
                        <TableCell className="capitalize">{transaction.type.toLowerCase()}</TableCell>
                        <TableCell className="text-right">{transaction.weight.toFixed(3)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Cash Transactions */}
          {customer.cashTransactions && customer.cashTransactions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Cash Transactions</CardTitle>
                <CardDescription>Last 10 cash transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customer.cashTransactions.map((transaction: any) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{formatDistance(new Date(transaction.date), new Date(), { addSuffix: true })}</TableCell>
                        <TableCell className="capitalize">{transaction.type.toLowerCase()}</TableCell>
                        <TableCell className="text-right">${transaction.amount.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Empty State */}
      {!customer.orders?.length && totalTransactions === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Activity Yet</h3>
            <p className="text-sm text-muted-foreground text-center">
              This customer hasn't placed any orders or made any transactions yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
