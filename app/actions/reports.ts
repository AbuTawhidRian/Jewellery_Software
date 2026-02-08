'use server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { purityToKarat } from '@/lib/karat-utils'

// Get current user's company
async function getCurrentUserCompany() {
  const session = await auth()
  
  if (!session?.user?.email) {
    throw new Error('Unauthorized')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { companyId: true, role: true }
  })

  if (!user?.companyId) {
    throw new Error('User not associated with a company')
  }

  return user.companyId
}

// Gold Inventory Summary - Aggregate gold by purity/karat
export async function getGoldInventorySummary() {
  const companyId = await getCurrentUserCompany()

  const goldTransactions = await prisma.goldLedger.findMany({
    where: { companyId },
    select: {
      purity: true,
      weight: true,
      type: true
    }
  })

  // Group by purity and calculate net balance
  const inventoryMap = new Map<string, { receive: number; pay: number }>()

  goldTransactions.forEach(transaction => {
    const purityKey = transaction.purity.toString()
    const weight = parseFloat(transaction.weight.toString())
    
    if (!inventoryMap.has(purityKey)) {
      inventoryMap.set(purityKey, { receive: 0, pay: 0 })
    }

    const current = inventoryMap.get(purityKey)!
    
    if (transaction.type === 'RECEIVE') {
      current.receive += weight
    } else if (transaction.type === 'PAY') {
      current.pay += weight
    }
  })

  // Convert to array and calculate balance
  const inventory = Array.from(inventoryMap.entries()).map(([purity, amounts]) => ({
    purity: parseFloat(purity),
    receive: amounts.receive,
    pay: amounts.pay,
    balance: amounts.receive - amounts.pay
  })).sort((a, b) => b.purity - a.purity) // Sort by purity descending (24K first)

  return inventory
}

// Cash Flow Statement - Calculate income, expenses, and balance
export async function getCashFlowStatement() {
  const companyId = await getCurrentUserCompany()

  const cashTransactions = await prisma.cashLedger.findMany({
    where: { companyId },
    select: {
      amount: true,
      currency: true,
      type: true
    }
  })

  // Group by currency
  const cashFlowMap = new Map<string, { income: number; expenses: number }>()

  cashTransactions.forEach(transaction => {
    const currency = transaction.currency
    const amount = parseFloat(transaction.amount.toString())

    if (!cashFlowMap.has(currency)) {
      cashFlowMap.set(currency, { income: 0, expenses: 0 })
    }

    const current = cashFlowMap.get(currency)!

    if (transaction.type === 'RECEIVE') {
      current.income += amount
    } else if (transaction.type === 'PAY') {
      current.expenses += amount
    }
  })

  // Convert to array and calculate balance
  const cashFlow = Array.from(cashFlowMap.entries()).map(([currency, amounts]) => ({
    currency,
    income: amounts.income,
    expenses: amounts.expenses,
    balance: amounts.income - amounts.expenses
  }))

  return cashFlow
}

// Customer Transaction History - List all customer transactions
export async function getCustomerTransactionHistory() {
  const companyId = await getCurrentUserCompany()

  // Get gold transactions
  const goldTransactions = await prisma.goldLedger.findMany({
    where: { 
      companyId,
      customerId: { not: null }
    },
    select: {
      id: true,
      date: true,
      type: true,
      weight: true,
      purity: true,
      notes: true,
      customer: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: { date: 'desc' }
  })

  // Get cash transactions
  const cashTransactions = await prisma.cashLedger.findMany({
    where: {
      companyId,
      customerId: { not: null }
    },
    select: {
      id: true,
      date: true,
      type: true,
      amount: true,
      currency: true,
      notes: true,
      customer: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: { date: 'desc' }
  })

  // Combine and format transactions
  const transactions = [
    ...goldTransactions.map(t => ({
      id: t.id,
      date: t.date,
      customerId: t.customer?.id || '',
      customerName: t.customer?.name || 'Unknown',
      type: t.type,
      transactionType: 'GOLD' as const,
      amount: `${t.weight}g (${purityToKarat(Number(t.purity))})`,
      notes: t.notes
    })),
    ...cashTransactions.map(t => ({
      id: t.id,
      date: t.date,
      customerId: t.customer?.id || '',
      customerName: t.customer?.name || 'Unknown',
      type: t.type,
      transactionType: 'CASH' as const,
      amount: `${t.currency} ${t.amount}`,
      notes: t.notes
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime())

  return transactions
}

// Vendor Purchase Summary - Aggregate vendor transactions
export async function getVendorPurchaseSummary() {
  const companyId = await getCurrentUserCompany()

  // Get all vendors for the company
  const vendors = await prisma.vendor.findMany({
    where: { companyId },
    select: {
      id: true,
      name: true,
      goldTransactions: {
        select: {
          weight: true,
          type: true,
          date: true
        }
      },
      cashTransactions: {
        select: {
          amount: true,
          currency: true,
          type: true,
          date: true
        }
      }
    }
  })

  // Calculate summary for each vendor
  const vendorSummaries = vendors.map(vendor => {
    // Calculate gold purchased (PAY transactions from company perspective)
    const goldPurchased = vendor.goldTransactions
      .filter(t => t.type === 'PAY')
      .reduce((sum, t) => sum + parseFloat(t.weight.toString()), 0)

    // Calculate cash spent
    const cashByCurrency = new Map<string, number>()
    vendor.cashTransactions
      .filter(t => t.type === 'PAY')
      .forEach(t => {
        const currency = t.currency
        const amount = parseFloat(t.amount.toString())
        cashByCurrency.set(currency, (cashByCurrency.get(currency) || 0) + amount)
      })

    // Get last transaction date
    const allDates = [
      ...vendor.goldTransactions.map(t => t.date),
      ...vendor.cashTransactions.map(t => t.date)
    ]
    const lastTransactionDate = allDates.length > 0 
      ? new Date(Math.max(...allDates.map(d => d.getTime())))
      : null

    return {
      id: vendor.id,
      name: vendor.name,
      goldPurchased,
      cashSpent: Array.from(cashByCurrency.entries()).map(([currency, amount]) => ({
        currency,
        amount
      })),
      transactionCount: vendor.goldTransactions.length + vendor.cashTransactions.length,
      lastTransactionDate
    }
  }).filter(v => v.transactionCount > 0) // Only show vendors with transactions

  return vendorSummaries
}
