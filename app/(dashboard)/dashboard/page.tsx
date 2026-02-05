import { getDashboardMetrics, getChartData, getRecentActivity } from '@/app/actions/dashboard-metrics'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowUpRight, DollarSign, Package, Users, PlusCircle } from 'lucide-react'
import { ProjectedBarChart } from '@/components/dashboard/projected-bar-chart'

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics()
  const chartData = await getChartData()
  // const recentActivity = await getRecentActivity() // Use when implemented fully

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your jewellery management system
          </p>
        </div>
        <div className="flex items-center gap-2">
            <Button asChild size="sm">
                <Link href="/orders/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Order
                </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
                <Link href="/customers/new">
                    <Users className="mr-2 h-4 w-4" />
                    Add Customer
                </Link>
            </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gold Balance</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.goldBalance}g</div>
            <p className="text-xs text-muted-foreground">
              Total gold in inventory
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.cashBalance}</div>
            <p className="text-xs text-muted-foreground">
              Net receivables/payables
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">
              Orders in progress
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              Active customers
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>
                Weekly performance
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[240px]"> {/* Fixed height wrapper for Recharts */}
                <ProjectedBarChart data={chartData} />
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and operations
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
             <Button asChild variant="secondary" className="w-full justify-start">
                 <Link href="/transactions/gold">
                    <Package className="mr-2 h-4 w-4" />
                    Record Gold Transaction
                 </Link>
             </Button>
             <Button asChild variant="secondary" className="w-full justify-start">
                 <Link href="/transactions/cash">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Record Cash Transaction
                 </Link>
             </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
