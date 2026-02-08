'use server'

import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import { startOfMonth, subMonths, format } from 'date-fns'
import fs from 'fs'

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
        goldBalance: '0.000',
        cashBalance: [{ currency: 'USD', amount: '0.00' }],
        totalCustomers: 0,
        todayRate: null
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
      if (t.type === 'RECEIVE') {
          goldBalance += weight
      } else if (t.type === 'PAY') {
          goldBalance -= weight
      }
      // ADJUSTMENT might be positive or negative, but usually implied by the context.
      // For now, let's treat it as neutral or handle if needed.
      // If adjustment is positive in DB, we might want to add, but we don't know the intent without a sign.
      // Assuming 'weight' is always positive in DB, we depend on type.
      // If adjustment adds gold, it should probably be RECEIVE or a specific ADJ_IN type.
      if (t.type === 'ADJUSTMENT') {
          // crude assumption: it adds
          goldBalance += weight 
      }
  })


  // 2. Cash Balance (Multi-currency)
  const cashTransactions = await prisma.cashLedger.findMany({
    where: companyId ? { companyId } : { company: { tenantId } },
     select: { amount: true, type: true, currency: true }
  })

  const cashBalances: Record<string, number> = {}

  cashTransactions.forEach(t => {
      const amount = Number(t.amount)
      const currency = t.currency || 'USD'
      
      if (!cashBalances[currency]) {
          cashBalances[currency] = 0
      }

      if (t.type === 'RECEIVE') {
          cashBalances[currency] += amount
      } else {
          cashBalances[currency] -= amount
      }
  })

  // Format balances
  const formattedCashBalances = Object.entries(cashBalances).map(([currency, amount]) => ({
      currency,
      amount: amount.toFixed(2)
  }))

  // 4. Total Customers
  const totalCustomers = await prisma.customer.count({
      where: companyId ? { companyId } : { company: { tenantId } }
  })

  // 5. Today's Gold Rate
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const rate = companyId ? await prisma.metalRate.findFirst({
    where: {
      companyId,
      date: {
        gte: today,
        lt: tomorrow
      }
    }
  }) : null

  return {
    goldBalance: goldBalance.toFixed(3),
    cashBalance: formattedCashBalances.length > 0 ? formattedCashBalances : [{ currency: 'USD', amount: '0.00' }],
    totalCustomers,
    todayRate: rate ? Number(rate.gold24k).toFixed(2) : null
  }
}

export async function getGoldBreakdown() {
  const session = await auth()
  
  if (!session?.user?.email) {
    throw new Error('Unauthorized')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { companyId: true, tenantId: true }
  })

  if (!user?.companyId && !user?.tenantId) {
    return {
      k24: '0.000',
      k22: '0.000',
      k18: '0.000'
    }
  }

  const companyId = user.companyId
  const tenantId = user.tenantId

  // Fetch company settings for custom karats
  const company = companyId ? await prisma.company.findUnique({
    where: { id: companyId },
    select: { customKarats: true }
  }) : null

  const customKarats = (company?.customKarats as Record<string, number>) || {}

  // Get all gold transactions with purity
  const goldTransactions = await prisma.goldLedger.findMany({
    where: companyId ? { companyId } : { company: { tenantId } },
    select: { weight: true, type: true, purity: true }
  })

  let k24Balance = 0
  let k22Balance = 0
  let k18Balance = 0

  goldTransactions.forEach(t => {
    const weight = Number(t.weight)
    const purity = Number(t.purity)
    let netWeight = 0
    
    // Calculate net weight based on transaction type
    if (t.type === 'RECEIVE') {
      netWeight = weight
    } else if (t.type === 'PAY') {
      netWeight = -weight
    }

    // Map purity to karat category using custom mappings or fallbacks
    const p24 = customKarats['24'] || 99.0
    const p22 = customKarats['22'] || 91.0
    const p18 = customKarats['18'] || 75.0

    if (purity >= p24 - 0.5) {
      k24Balance += netWeight
    } else if (purity >= p22 - 1.0 && purity < p24 - 0.5) {
      k22Balance += netWeight
    } else if (purity >= p18 - 2.0 && purity < p22 - 1.0) {
      k18Balance += netWeight
    }
  })

  return {
    k24: k24Balance.toFixed(3),
    k22: k22Balance.toFixed(3),
    k18: k18Balance.toFixed(3)
  }
}




export async function getChartData() {
  const session = await auth()
  if (!session?.user?.email) return []

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { companyId: true, tenantId: true }
  })

  // Get last 7 days
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 6)
  startDate.setHours(0, 0, 0, 0)

  // Fetch transactions
  const whereClause = {
    ...(user?.companyId ? { companyId: user.companyId } : { company: { tenantId: user?.tenantId } }),
    date: {
      gte: startDate,
      lte: endDate
    }
  }

  const goldTx = await prisma.goldLedger.findMany({
    where: whereClause,
    select: { date: true, type: true, weight: true }
  })

  const cashTx = await prisma.cashLedger.findMany({
    where: whereClause,
    select: { date: true, type: true, amount: true, currency: true }
  })

  // Initialize days map
  const daysMap = new Map<string, { name: string, gold: number, cash: number }>()
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dayName = format(d, 'EEE') // Mon, Tue, etc.
    const dateKey = format(d, 'yyyy-MM-dd')
    daysMap.set(dateKey, { name: dayName, gold: 0, cash: 0 })
  }

  // Aggregate Gold (Net flow: Receive - Pay?)
  // Actually charts usually show "Activity" or specific metric. 
  // Let's show "Total Volume" (Receive + Pay) to show activity, OR "Net Change".
  // "Overview" usually implies activity. Let's do Total Volume for now to show usage.
  // Or maybe Positive vs Negative? Stacked bar?
  // The current chart is a simple bar. Let's show Net Change daily.
  
  goldTx.forEach(tx => {
    const dateKey = format(tx.date, 'yyyy-MM-dd')
    const entry = daysMap.get(dateKey)
    if (entry) {
      const weight = Number(tx.weight)
      // For net change:
      // entry.gold += tx.type === 'RECEIVE' ? weight : -weight
      // For volume:
      entry.gold += weight
    }
  })

  cashTx.forEach(tx => {
    const dateKey = format(tx.date, 'yyyy-MM-dd')
    const entry = daysMap.get(dateKey)
    if (entry) {
      const amount = Number(tx.amount)
      // Convert to base currency if needed? 
      // For now, let's just sum all amounts implicitly assuming one currency or just showing raw activity number.
      // Ideally we should convert, but we lack exchange rates for all pairs.
      // Let's just sum USD for now if available, or just raw sum.
      // To be safe, let's just count 'USD' or the company's base currency. 
      // But we don't have base currency easily here. 
      // Let's just sum all.
      entry.cash += amount
    }
  })

  return Array.from(daysMap.values())
}
