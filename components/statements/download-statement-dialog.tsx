'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Download, Loader2 } from 'lucide-react'
import { getCustomerStatement, getVendorStatement } from '@/app/actions/statement'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface DownloadStatementDialogProps {
  entityId: string
  entityName: string
  entityType: 'customer' | 'vendor'
  children?: React.ReactNode
}

export function DownloadStatementDialog({ 
  entityId, 
  entityName, 
  entityType,
  children
}: DownloadStatementDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })

  const handleDownload = async () => {
    setLoading(true)
    try {
      const startDate = dateRange.startDate ? new Date(dateRange.startDate) : undefined
      const endDate = dateRange.endDate ? new Date(dateRange.endDate) : undefined

      // Fetch statement data
      const statementData = entityType === 'customer'
        ? await getCustomerStatement(entityId, startDate, endDate)
        : await getVendorStatement(entityId, startDate, endDate)

      // Create HTML content
      const htmlContent = generateStatementHTML(statementData, entityName, entityType)

      // Create blob and download
      const blob = new Blob([htmlContent], { type: 'text/html' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const dateStr = format(new Date(), 'yyyy-MM-dd')
      a.download = `statement-${entityType}-${entityName.replace(/\s+/g, '-')}-${dateStr}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast.success('Statement downloaded successfully')
      setOpen(false)
    } catch (error: any) {
      console.error('Error downloading statement:', error)
      toast.error(error.message || 'Failed to download statement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download Statement
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Download Account Statement</DialogTitle>
          <DialogDescription>
            Generate a statement for {entityName}. Leave dates empty for all transactions.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="startDate">Start Date (Optional)</Label>
            <Input
              id="startDate"
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="endDate">End Date (Optional)</Label>
            <Input
              id="endDate"
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleDownload} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function generateStatementHTML(data: any, entityName: string, entityType: 'customer' | 'vendor'): string {
  const entity = data.customer || data.vendor
  const { startDate, endDate } = data.dateRange
  
  const dateRangeStr = startDate && endDate
    ? `${format(new Date(startDate), 'MMM dd, yyyy')} - ${format(new Date(endDate), 'MMM dd, yyyy')}`
    : startDate
    ? `From ${format(new Date(startDate), 'MMM dd, yyyy')}`
    : endDate
    ? `Until ${format(new Date(endDate), 'MMM dd, yyyy')}`
    : 'All Transactions'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Statement of Account - ${entityName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; background: #f5f5f5; }
    .container { max-width: 900px; margin: 0 auto; background: white; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { text-align: center; border-bottom: 3px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { font-size: 28px; margin-bottom: 5px; }
    .header p { color: #666; font-size: 14px; }
    .entity-info { background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
    .entity-info h3 { margin-bottom: 10px; color: #333; }
    .entity-info p { margin: 5px 0; color: #666; }
    .section { margin-bottom: 40px; }
    .section h2 { font-size: 20px; margin-bottom: 15px; color: #333; border-bottom: 2px solid #ddd; padding-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th { background: #333; color: white; padding: 12px; text-align: left; font-weight: 600; }
    td { padding: 10px 12px; border-bottom: 1px solid #eee; }
    tr:hover { background: #f9f9f9; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
    .badge-receive { background: #10b981; color: white; }
    .badge-pay { background: #ef4444; color: white; }
    .summary { background: #f9f9f9; padding: 20px; border-radius: 8px; }
    .summary-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ddd; }
    .summary-row:last-child { border-bottom: none; font-weight: 600; font-size: 16px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #ddd; text-align: center; color: #666; font-size: 12px; }
    .empty-state { text-align: center; padding: 40px; color: #999; }
    @media print { body { padding: 0; background: white; } .container { box-shadow: none; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>STATEMENT OF ACCOUNT</h1>
      <p>${dateRangeStr}</p>
    </div>

    <div class="entity-info">
      <h3>${entityType === 'customer' ? 'Customer' : 'Vendor'} Details</h3>
      <p><strong>Name:</strong> ${entity.name}</p>
      ${entity.phone ? `<p><strong>Phone:</strong> ${entity.phone}</p>` : ''}
      ${entity.email ? `<p><strong>Email:</strong> ${entity.email}</p>` : ''}
      ${entity.address ? `<p><strong>Address:</strong> ${entity.address}</p>` : ''}
    </div>

    ${data.goldTransactions.length > 0 ? `
    <div class="section">
      <h2>Gold Transactions</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th class="text-right">Weight (g)</th>
            <th class="text-right">Purity (%)</th>
            ${data.goldTransactions.some((t: any) => t.makingRate) ? '<th class="text-right">Making Rate</th>' : ''}
            <th class="text-right">Running Balance (g)</th>
          </tr>
        </thead>
        <tbody>
          ${data.goldTransactions.map((tx: any) => `
            <tr>
              <td>${format(new Date(tx.date), 'MMM dd, yyyy')}</td>
              <td><span class="badge badge-${tx.type.toLowerCase()}">${tx.type}</span></td>
              <td class="text-right">${tx.weight.toFixed(3)}</td>
              <td class="text-right">${tx.purity.toFixed(2)}</td>
              ${data.goldTransactions.some((t: any) => t.makingRate) ? `<td class="text-right">${tx.makingRate ? tx.makingRate.toFixed(2) : '-'}</td>` : ''}
              <td class="text-right"><strong>${tx.runningBalance.toFixed(3)}</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ` : '<div class="section"><h2>Gold Transactions</h2><div class="empty-state">No gold transactions found</div></div>'}

    ${data.cashTransactions.length > 0 ? `
    <div class="section">
      <h2>Cash Transactions</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th class="text-right">Amount</th>
            <th>Currency</th>
            <th class="text-right">Running Balance</th>
          </tr>
        </thead>
        <tbody>
          ${data.cashTransactions.map((tx: any) => `
            <tr>
              <td>${format(new Date(tx.date), 'MMM dd, yyyy')}</td>
              <td><span class="badge badge-${tx.type.toLowerCase()}">${tx.type}</span></td>
              <td class="text-right">${tx.amount.toFixed(2)}</td>
              <td>${tx.currency}</td>
              <td class="text-right"><strong>${tx.runningBalance.toFixed(2)}</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ` : '<div class="section"><h2>Cash Transactions</h2><div class="empty-state">No cash transactions found</div></div>'}

    <div class="section">
      <h2>Summary</h2>
      <div class="summary">
        <h3 style="margin-bottom: 15px;">Gold</h3>
        <div class="summary-row">
          <span>Total Gold Received:</span>
          <span>${data.summary.gold.totalReceived.toFixed(3)} g</span>
        </div>
        <div class="summary-row">
          <span>Total Gold Paid:</span>
          <span>${data.summary.gold.totalPaid.toFixed(3)} g</span>
        </div>
        <div class="summary-row">
          <span>Net Gold Balance:</span>
          <span style="color: ${data.summary.gold.balance >= 0 ? '#10b981' : '#ef4444'}">${data.summary.gold.balance.toFixed(3)} g</span>
        </div>

        ${Object.keys(data.summary.cash).length > 0 ? `
          <h3 style="margin: 20px 0 15px 0;">Cash</h3>
          ${Object.entries(data.summary.cash).map(([currency, summary]: any) => `
            <div style="margin-bottom: 15px;">
              <h4 style="margin-bottom: 10px; color: #666;">${currency}</h4>
              <div class="summary-row">
                <span>Total Cash Received:</span>
                <span>${summary.received.toFixed(2)}</span>
              </div>
              <div class="summary-row">
                <span>Total Cash Paid:</span>
                <span>${summary.paid.toFixed(2)}</span>
              </div>
              <div class="summary-row">
                <span>Net Cash Balance:</span>
                <span style="color: ${summary.balance >= 0 ? '#10b981' : '#ef4444'}">${summary.balance.toFixed(2)}</span>
              </div>
            </div>
          `).join('')}
        ` : ''}
      </div>
    </div>

    <div class="footer">
      <p>Generated on ${format(new Date(), 'MMMM dd, yyyy hh:mm a')}</p>
      <p>This is a computer-generated statement and does not require a signature.</p>
    </div>
  </div>
</body>
</html>
  `
}
