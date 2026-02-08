'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
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
import { deleteCustomer } from '@/app/actions/customers'
import { toast } from 'sonner'
import { useLanguage } from '@/components/providers/language-provider'

type Customer = {
  id: string
  name: string
  phone: string | null
  email: string | null
  company: { name: string }
  _count: {
    goldTransactions: number
    cashTransactions: number
  }
}

export function CustomersTable({ customers }: { customers: Customer[] }) {
  const { t } = useLanguage()
  const [search, setSearch] = useState('')

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: string, name: string) => {
    // TODO: Add localized confirm dialog if needed, for now standard confirm
    if (!confirm(`Are you sure you want to delete customer "${name}"?`)) return

    try {
      await deleteCustomer(id)
      toast.success('Customer deleted successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete customer')
    }
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder={t.table.search}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.table.name}</TableHead>
              <TableHead>{t.table.phone}</TableHead>
              <TableHead>{t.table.email}</TableHead>
              <TableHead>{t.table.company}</TableHead>
              <TableHead className="text-right">{t.table.transactions}</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  {t.table.noData}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">
                    <Link href={`/customers/${customer.id}`} className="hover:underline">
                      {customer.name}
                    </Link>
                  </TableCell>
                  <TableCell>{customer.phone || '-'}</TableCell>
                  <TableCell>{customer.email || '-'}</TableCell>
                  <TableCell>{customer.company.name}</TableCell>
                  <TableCell className="text-right">
                    {customer._count.goldTransactions + customer._count.cashTransactions}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{t.common.actions}</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/customers/${customer.id}`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            {t.common.edit}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(customer.id, customer.name)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t.common.delete}
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
    </div>
  )
}
