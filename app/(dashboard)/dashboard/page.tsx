import { getDashboardMetrics, getGoldBreakdown, getChartData } from '@/app/actions/dashboard-metrics'
import { formatCurrencyValue } from '@/lib/currencies'
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

          <Button asChild variant="outline" size="sm">
            <Link href="/customers">
              <Users className="mr-2 h-4 w-4" />
              Add Customer
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Grid with Colored Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {/* Gold Balance Card - Amber/Yellow */}
        <Card className="bg-amber-50 border-amber-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-900">Pure Gold Balance (Std)</CardTitle>
            <Coins className="h-5 w-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-900">{metrics.pureGoldBalance}g</div>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-amber-700"> Total Weight: {metrics.goldBalance}g</p>
            </div>
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
            <div className="space-y-4">
              {metrics.cashBalance.map((balance: any) => (
                <div key={balance.currency} className="flex flex-col">
                  <div className="text-2xl font-bold text-cyan-900">
                    {formatCurrencyValue(Number(balance.amount), balance.currency)}
                  </div>
                  <p className="text-xs text-cyan-700">
                    {balance.currency} Balance
                  </p>
                </div>
              ))}
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
            <div className="text-2xl font-bold">
              {metrics.todayRate ? `$${metrics.todayRate}` : 'Not Set'}
            </div>
            <p className="text-xs text-muted-foreground">Gold 24K (per gram)</p>
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
              Weekly transaction activity
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
              <Link href="/gold-ledger">
                <Coins className="mr-2 h-4 w-4" />
                Record Gold Transaction
              </Link>
            </Button>
            <Button asChild variant="secondary" className="w-full justify-start">
              <Link href="/cash-ledger">
                <DollarSign className="mr-2 h-4 w-4" />
                Record Cash Transaction
              </Link>
            </Button>
            <Button asChild variant="secondary" className="w-full justify-start">
              <Link href="/settings?tab=rates">
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
