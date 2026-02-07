import { notFound } from 'next/navigation'
import { getVendor } from '@/app/actions/vendors'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pencil, ArrowLeft, Phone, Mail, MapPin, Store } from 'lucide-react'
import Link from 'next/link'
import { AddVendorDialog } from '@/components/vendors/add-vendor-dialog'
import { formatDistance } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function VendorDetailsPage({ params }: PageProps) {
  const { id } = await params
  const vendor = await getVendor(id)

  if (!vendor) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/vendors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{vendor.name}</h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Store className="h-4 w-4" />
            <span>Vendor Details</span>
          </div>
        </div>
        <AddVendorDialog vendorToEdit={vendor}>
          <Button variant="outline">
            <Pencil className="mr-2 h-4 w-4" />
            Edit Vendor
          </Button>
        </AddVendorDialog>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Contact Info */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Vendor contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {vendor.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{vendor.phone}</span>
              </div>
            )}
            {vendor.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{vendor.email}</span>
              </div>
            )}
            {vendor.address && (
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                <span className="whitespace-pre-wrap">{vendor.address}</span>
              </div>
            )}
            {vendor.taxId && (
              <div className="pt-2 border-t mt-2">
                <p className="text-sm font-medium text-muted-foreground">Tax ID</p>
                <p>{vendor.taxId}</p>
              </div>
            )}
            {!vendor.phone && !vendor.email && !vendor.address && (
                <p className="text-muted-foreground text-sm">No contact information available</p>
            )}
          </CardContent>
        </Card>

        {/* Transactions */}
        <div className="md:col-span-2 space-y-6">
            {/* Gold Transactions */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Gold Transactions</CardTitle>
                    <CardDescription>Last 10 gold transactions with this vendor</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="text-right">Weight (g)</TableHead>
                                <TableHead>Purity</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {vendor.goldTransactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground">No transactions found</TableCell>
                                </TableRow>
                            ) : (
                                vendor.goldTransactions.map((t: any) => (
                                    <TableRow key={t.id}>
                                        <TableCell>{formatDistance(new Date(t.date), new Date(), { addSuffix: true })}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{t.type}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">{t.weight.toFixed(3)}</TableCell>
                                        <TableCell>{t.purity.toFixed(2)}%</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Cash Transactions */}
             <Card>
                <CardHeader>
                    <CardTitle>Recent Cash Transactions</CardTitle>
                    <CardDescription>Last 10 cash transactions with this vendor</CardDescription>
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
                            {vendor.cashTransactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-muted-foreground">No transactions found</TableCell>
                                </TableRow>
                            ) : (
                                vendor.cashTransactions.map((t: any) => (
                                    <TableRow key={t.id}>
                                        <TableCell>{formatDistance(new Date(t.date), new Date(), { addSuffix: true })}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{t.type}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">{t.amount.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}
