'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MoreHorizontal, Pencil, Trash2, Store, Phone, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { deleteVendor } from '@/app/actions/vendors'
import { toast } from 'sonner'
import { AddVendorDialog } from './add-vendor-dialog'

interface Vendor {
  id: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
  trn: string | null
  country: string | null
  _count: {
      goldTransactions: number
      cashTransactions: number
  }
}

export function VendorsTable({ vendors }: { vendors: Vendor[] }) {
  const [search, setSearch] = useState('')
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null)
  
  const filtered = vendors.filter(v => 
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.phone?.includes(search) ||
    v.email?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete vendor "${name}"?`)) return

    try {
      await deleteVendor(id)
      toast.success('Vendor deleted successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete vendor')
    }
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search vendors..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Transactions</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Store className="h-8 w-8 text-muted-foreground/50" />
                    <p>No vendors found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell className="font-medium">
                    <Link href={`/vendors/${vendor.id}`} className="hover:underline flex flex-col">
                      <span className="font-semibold">{vendor.name}</span>
                      {vendor.trn && <span className="text-xs text-muted-foreground">TRN: {vendor.trn}</span>}
                      {vendor.country && <span className="text-xs text-muted-foreground">{vendor.country}</span>}
                    </Link>
                  </TableCell>
                  <TableCell>
                      <div className="flex flex-col gap-1 text-sm">
                          {vendor.phone && (
                              <div className="flex items-center gap-2">
                                  <Phone className="h-3 w-3 text-muted-foreground" />
                                  <span>{vendor.phone}</span>
                              </div>
                          )}
                          {vendor.email && (
                              <div className="flex items-center gap-2">
                                  <Mail className="h-3 w-3 text-muted-foreground" />
                                  <span>{vendor.email}</span>
                              </div>
                          )}
                          {!vendor.phone && !vendor.email && <span className="text-muted-foreground">-</span>}
                      </div>
                  </TableCell>
                  <TableCell>
                      <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1" title="Gold Transactions">
                              <span className="font-medium text-amber-600">{vendor._count.goldTransactions}</span>
                              <span className="text-muted-foreground text-xs">Gold</span>
                          </div>
                          <div className="flex items-center gap-1" title="Cash Transactions">
                              <span className="font-medium text-green-600">{vendor._count.cashTransactions}</span>
                              <span className="text-muted-foreground text-xs">Cash</span>
                          </div>
                      </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setEditingVendor(vendor)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(vendor.id, vendor.name)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AddVendorDialog 
        open={!!editingVendor} 
        onOpenChange={(open) => !open && setEditingVendor(null)}
        vendorToEdit={editingVendor}
      />
    </div>
  )
}
