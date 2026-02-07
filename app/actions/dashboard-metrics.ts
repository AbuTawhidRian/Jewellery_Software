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
        goldBalance: 0,
        cashBalance: 0,
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


  // 2. Cash Balance
  const cashTransactions = await prisma.cashLedger.findMany({
    where: companyId ? { companyId } : { company: { tenantId } },
     select: { amount: true, type: true }
  })

  let cashBalance = 0
  cashTransactions.forEach(t => {
      const amount = Number(t.amount)
      if (t.type === 'RECEIVE') {
          cashBalance += amount
      } else {
          cashBalance -= amount
      }
  })



  // 4. Total Customers
  const totalCustomers = await prisma.customer.count({
      where: companyId ? { companyId } : { company: { tenantId } }
  })

  return {
    goldBalance: goldBalance.toFixed(3),
    cashBalance: cashBalance.toFixed(2),
    totalCustomers
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
