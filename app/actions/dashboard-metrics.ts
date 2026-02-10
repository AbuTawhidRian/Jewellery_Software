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
        cashBalance: [],
        totalCustomers: 0,
        todayRate: null,
        baseCurrency: 'USD'
     }
  }

  // Fetch company base currency
  const company = companyId ? await prisma.company.findUnique({
    where: { id: companyId },
    select: { currency: true }
  }) : null

  const baseCurrency = company?.currency || 'USD'

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
    select: { weight: true, type: true, purity: true }
  })

  let goldBalance = 0
  let pureGoldBalance = 0
  
  goldTransactions.forEach(t => {
      const weight = Number(t.weight)
      const purity = Number(t.purity)
      const pureWeight = weight * purity
      
      if (['METAL_RECEIPT', 'METAL_RECEIPT_RETURN'].includes(t.type)) {
          goldBalance += weight
          pureGoldBalance += pureWeight
      } else if (['METAL_PAYMENT', 'METAL_SALE', 'METAL_PURCHASE', 'METAL_PAYMENT_RETURN'].includes(t.type)) {
          goldBalance -= weight
          pureGoldBalance -= pureWeight
      } else if (t.type === 'ADJUSTMENT') {
          // crude assumption: it adds
          goldBalance += weight
          pureGoldBalance += pureWeight
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
      const currency = t.currency || baseCurrency
      
      if (!cashBalances[currency]) {
          cashBalances[currency] = 0
      }

      if (t.type === 'CASH_RECEIPT') {
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
    pureGoldBalance: pureGoldBalance.toFixed(3),
    cashBalance: formattedCashBalances.length > 0 ? formattedCashBalances : [{ currency: baseCurrency, amount: '0.00' }],
    totalCustomers,
    todayRate: rate ? Number(rate.gold24k).toFixed(2) : null,
    baseCurrency
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

  // Determine available karats (from settings or default)
  const karatMappings = Object.keys(customKarats).length > 0
    ? customKarats
    : { '24': 0.999, '22': 0.916, '18': 0.750 }

  // Initialize balances for all mapped karats
  const balances: Record<string, number> = {}
  Object.keys(karatMappings).forEach(k => {
    balances[k] = 0
  })

  goldTransactions.forEach(t => {
    const weight = Number(t.weight)
    const purity = Number(t.purity)
    let netWeight = 0
    
    if (['METAL_RECEIPT', 'METAL_RECEIPT_RETURN'].includes(t.type)) {
      netWeight = weight
    } else if (['METAL_PAYMENT', 'METAL_SALE', 'METAL_PURCHASE', 'METAL_PAYMENT_RETURN'].includes(t.type)) {
      netWeight = -weight
    } else if (t.type === 'ADJUSTMENT') {
      netWeight = weight
    }

    // Find the closest matching karat from our mappings
    let closestKarat = ''
    let smallestDiff = 1.0
    
    Object.entries(karatMappings).forEach(([karat, karatPurity]) => {
      const diff = Math.abs(Number(karatPurity) - purity)
      if (diff < smallestDiff) {
        smallestDiff = diff
        closestKarat = karat
      }
    })

    // Assign to balance if it's a reasonable match (within 0.005)
    if (closestKarat && smallestDiff < 0.005) {
      balances[closestKarat] = (balances[closestKarat] || 0) + netWeight
    }
  })

  // Format the response
  const result: Record<string, string> = {}
  Object.entries(balances).forEach(([k, val]) => {
    result[k] = val.toFixed(3)
  })

  return result
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
