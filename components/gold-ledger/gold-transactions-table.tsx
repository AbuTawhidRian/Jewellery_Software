'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatPurity, formatTransactionType, getTransactionTypeColor } from '@/lib/karat-utils'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'

interface GoldTransaction {
  id: string
  date: Date
  type: string
  weight: any
  purity: any
  notes: string | null
  customer: { id: string; name: string } | null
}

interface GoldTransactionsTableProps {
  transactions: GoldTransaction[]
}

export function GoldTransactionsTable({ transactions }: GoldTransactionsTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [customerFilter, setCustomerFilter] = useState('all')

  // Get unique customers for filter
  const customers = Array.from(
    new Map(
      transactions
        .filter(t => t.customer)
        .map(t => [t.customer!.id, t.customer!])
    ).values()
  )

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    // Type filter
    if (typeFilter !== 'all' && transaction.type !== typeFilter) {
      return false
    }

    // Customer filter
    if (customerFilter !== 'all' && transaction.customer?.id !== customerFilter) {
      return false
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesCustomer = transaction.customer?.name.toLowerCase().includes(query)
      const matchesNotes = transaction.notes?.toLowerCase().includes(query)
      
      if (!matchesCustomer && !matchesNotes) {
        return false
      }
    }

    return true
  })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by customer or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="RECEIVE">Receive (Gold In)</SelectItem>
            <SelectItem value="PAY">Pay (Gold Out)</SelectItem>
            <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>

          </SelectContent>
        </Select>

        <Select value={customerFilter} onValueChange={setCustomerFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by customer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Customers</SelectItem>
            {customers.map((customer) => (
              <SelectItem key={customer.id} value={customer.id}>
                {customer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="text-right">Weight (g)</TableHead>
              <TableHead>Purity</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No transactions found.
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">
                    {format(new Date(transaction.date), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={getTransactionTypeColor(transaction.type)}
                    >
                      {formatTransactionType(transaction.type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {transaction.customer ? (
                      <span className="text-sm">{transaction.customer.name}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {Number(transaction.weight).toFixed(3)}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {formatPurity(Number(transaction.purity))}
                    </span>
                  </TableCell>
                  <TableCell>
                    {transaction.notes ? (
                      <span className="text-sm text-muted-foreground">
                        {transaction.notes}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredTransactions.length} of {transactions.length} transactions
      </p>
    </div>
  )
}
