'use server'

import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import { startOfMonth, subMonths, format } from 'date-fns'

export async function getDashboardMetrics() {
  const session = await auth()
  
  if (!session?.user?.email) {
    throw new Error('Unauthorized')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { companyId: true, tenantId: true }
  })

  // Determine scope: Company level or Tenant level?
  // Ideally, metrics should be scoped to the user's company or all companies in tenant if super admin.
  // For now, let's assume one company per user or fallback to tenant.
  // If companyId is set, use it.
  
  const companyId = user?.companyId
  const tenantId = user?.tenantId

  if (!tenantId) {
     return {
        goldBalance: 0,
        cashBalance: 0,
        pendingOrders: 0,
        totalCustomers: 0
     }
  }

  // 1. Gold Balance (Sum of all GoldLedger weights)
  // Incoming (Positive) - Outgoing (Negative)? 
  // The schema has 'type', so we need to know which types add and which remove.
  // RECEIVE_GOLD (+), USE_FOR_JEWELLERY (-), JEWELLERY_DELIVERY (-), JEWELLERY_RETURN (+?), ADJUSTMENT (+/-)
  // Let's simplify: sum all weight where type is RECEIVE_GOLD or JEWELLERY_RETURN
  // subtract where type is USE_FOR_JEWELLERY or JEWELLERY_DELIVERY
  
  // Actually, a ledger usually implies signed values or strict types.
  // Let's assume for now we just sum everything and rely on the UI to display it, 
  // OR we fetch raw and calculate in JS for flexibility.
  
  const goldTransactions = await prisma.goldLedger.findMany({
    where: companyId ? { companyId } : { company: { tenantId } },
    select: { weight: true, type: true }
  })

  let goldBalance = 0
  goldTransactions.forEach(t => {
      const weight = Number(t.weight)
      if (t.type === 'RECEIVE_GOLD' || t.type === 'JEWELLERY_RETURN') {
          goldBalance += weight
      } else if (t.type === 'USE_FOR_JEWELLERY' || t.type === 'JEWELLERY_DELIVERY') {
          goldBalance -= weight
      }
      // Adjustment could be + or - in real world, usually stored as signed in db or separate column.
      // For now ignore or assume positive if not specified.
  })


  // 2. Cash Balance
  const cashTransactions = await prisma.cashLedger.findMany({
    where: companyId ? { companyId } : { company: { tenantId } },
     select: { amount: true, type: true }
  })

  let cashBalance = 0
  cashTransactions.forEach(t => {
      const amount = Number(t.amount)
      if (t.type === 'RECEIVE_PAYMENT' || t.type === 'OTHER') {
          cashBalance += amount
      } else {
          cashBalance -= amount
      }
  })

  // 3. Pending Orders
  const pendingOrders = await prisma.jewelleryOrder.count({
    where: {
        ...(companyId ? { companyId } : { company: { tenantId } }),
        status: { in: ['PENDING', 'IN_PROGRESS'] }
    }
  })

  // 4. Total Customers
  const totalCustomers = await prisma.customer.count({
      where: companyId ? { companyId } : { company: { tenantId } }
  })

  return {
    goldBalance: goldBalance.toFixed(3),
    cashBalance: cashBalance.toFixed(2),
    pendingOrders,
    totalCustomers
  }
}

export async function getRecentActivity() {
    const session = await auth()
    if (!session?.user?.email) return []

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { companyId: true, tenantId: true }
    })
    
    const companyId = user?.companyId
    const tenantId = user?.tenantId

    if (!tenantId) return []

    // Fetch latest orders
    const recentOrders = await prisma.jewelleryOrder.findMany({
        where: companyId ? { companyId } : { company: { tenantId } },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { customer: true }
    })

    return recentOrders.map(order => ({
        id: order.id,
        type: 'ORDER',
        description: `Order #${order.orderNo} for ${order.customer.name}`,
        date: order.createdAt,
        status: order.status
    }))
}

export async function getChartData() {
    // Mock data for now as we don't have historical aggregates easily available without raw SQL or heavy processing
    // In a real app, we'd group by date.
    
    return [
        { name: 'Mon', gold: 40, cash: 2400 },
        { name: 'Tue', gold: 30, cash: 1398 },
        { name: 'Wed', gold: 20, cash: 9800 },
        { name: 'Thu', gold: 27, cash: 3908 },
        { name: 'Fri', gold: 18, cash: 4800 },
        { name: 'Sat', gold: 23, cash: 3800 },
        { name: 'Sun', gold: 34, cash: 4300 },
    ]
}
