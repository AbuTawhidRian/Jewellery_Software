import { 
  getGoldInventorySummary, 
  getCashFlowStatement, 
  getCustomerTransactionHistory,
  getVendorPurchaseSummary 
} from '@/app/actions/reports'
import { GoldInventoryCard } from '@/components/reports/gold-inventory-card'
import { CashFlowCard } from '@/components/reports/cash-flow-card'
import { CustomerTransactionsTable } from '@/components/reports/customer-transactions-table'
import { VendorSummaryTable } from '@/components/reports/vendor-summary-table'

export default async function ReportsPage() {
  // Fetch all report data
  const [goldInventory, cashFlow, customerTransactions, vendorSummary] = await Promise.all([
    getGoldInventorySummary(),
    getCashFlowStatement(),
    getCustomerTransactionHistory(),
    getVendorPurchaseSummary()
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Financial and operational insights for your business
        </p>
      </div>

      {/* Financial Overview */}
      <div className="grid gap-6 md:grid-cols-2">
        <GoldInventoryCard inventory={goldInventory} />
        <CashFlowCard cashFlow={cashFlow} />
      </div>

      {/* Transaction Details */}
      <div className="space-y-6">
        <CustomerTransactionsTable transactions={customerTransactions} />
        <VendorSummaryTable vendors={vendorSummary} />
      </div>
    </div>
  )
}
