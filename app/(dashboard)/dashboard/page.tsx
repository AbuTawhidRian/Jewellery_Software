import { getDashboardMetrics, getGoldBreakdown, getChartData } from '@/app/actions/dashboard-metrics'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Coins, DollarSign, Package, Users, PlusCircle, TrendingUp } from 'lucide-react'
import { ProjectedBarChart } from '@/components/dashboard/projected-bar-chart'

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics()
  const goldBreakdown = await getGoldBreakdown()
  const chartData = await getChartData()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your jewellery business
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
            <Link href="/customers">
              <Users className="mr-2 h-4 w-4" />
              Add Customer
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Grid with Colored Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Gold Balance Card - Amber/Yellow */}
        <Card className="bg-amber-50 border-amber-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-900">Gold Balance</CardTitle>
            <Coins className="h-5 w-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-900">{metrics.goldBalance}g</div>
            <p className="text-xs text-amber-700 mt-1">
              Pure gold in inventory
            </p>
            {/* Karat Breakdown */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-amber-800">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  24K Pure
                </span>
                <span className="font-medium text-amber-900">{goldBreakdown.k24}g</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-amber-800">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  22K
                </span>
                <span className="font-medium text-amber-900">{goldBreakdown.k22}g</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-amber-800">
                  <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                  18K
                </span>
                <span className="font-medium text-amber-900">{goldBreakdown.k18}g</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cash Balance Card - Cyan */}
        <Card className="bg-cyan-50 border-cyan-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-cyan-900">Cash Balance</CardTitle>
            <DollarSign className="h-5 w-5 text-cyan-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-cyan-900">${metrics.cashBalance}</div>
            <p className="text-xs text-cyan-700 mt-1">
              USD Balance
            </p>
            {/* Cash Breakdown */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-cyan-800">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  BDT
                </span>
                <span className="font-medium text-cyan-900">+50,000.00</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-cyan-800">
                  <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                  AED
                </span>
                <span className="font-medium text-cyan-900">3,500.00</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Orders Card - Purple */}
        <Card className="bg-purple-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">Active Orders</CardTitle>
            <Package className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">{metrics.pendingOrders}</div>
            <p className="text-xs text-purple-700 mt-1">
              Orders in progress
            </p>
            {/* Order Status Breakdown */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-purple-800">
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                  Pending
                </span>
                <span className="font-medium text-purple-900">1</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-purple-800">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  In Production
                </span>
                <span className="font-medium text-purple-900">1</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Active customers</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Metal Rates</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$62.50</div>
            <p className="text-xs text-muted-foreground">Gold (per gram)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Orders this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>
              Weekly performance
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[240px]">
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
                <Coins className="mr-2 h-4 w-4" />
                Record Gold Transaction
              </Link>
            </Button>
            <Button asChild variant="secondary" className="w-full justify-start">
              <Link href="/transactions/cash">
                <DollarSign className="mr-2 h-4 w-4" />
                Record Cash Transaction
              </Link>
            </Button>
            <Button asChild variant="secondary" className="w-full justify-start">
              <Link href="/metal-rates">
                <TrendingUp className="mr-2 h-4 w-4" />
                Update Metal Rates
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
