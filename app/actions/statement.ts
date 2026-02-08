'use server'

import { prisma } from '@/lib/db'
import { auth } from '@/auth'

interface StatementTransaction {
  date: Date
  type: 'RECEIVE' | 'PAY' | 'ADJUSTMENT'
  weight?: number
  purity?: number
  amount?: number
  currency?: string
  makingRate?: number
  notes?: string | null
  runningBalance: number
}

interface StatementData {
  customer?: {
    name: string
    phone?: string | null
    email?: string | null
    address?: string | null
  }
  vendor?: {
    name: string
    phone?: string | null
    email?: string | null
    address?: string | null
  }
  dateRange: {
    start?: Date
    end?: Date
  }
  goldTransactions: StatementTransaction[]
  cashTransactions: StatementTransaction[]
  summary: {
    gold: {
      totalReceived: number
      totalPaid: number
      balance: number
    }
    cash: Record<string, {
      received: number
      paid: number
      balance: number
    }>
  }
}

export async function getCustomerStatement(
  customerId: string,
  startDate?: Date,
  endDate?: Date
): Promise<StatementData> {
  const session = await auth()
  if (!session?.user?.email) {
    throw new Error('Unauthorized')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { companyId: true, tenantId: true }
  })

  // Fetch customer details
  const customer = await prisma.customer.findFirst({
    where: {
      id: customerId,
      ...(user?.companyId ? { companyId: user.companyId } : { company: { tenantId: user?.tenantId } })
    }
  })

  if (!customer) {
    throw new Error('Customer not found')
  }

  // Fetch gold transactions
  const goldTx = await prisma.goldLedger.findMany({
    where: {
      customerId,
      ...(startDate && { date: { gte: startDate } }),
      ...(endDate && { date: { lte: endDate } })
    },
    orderBy: { date: 'asc' }
  })

  // Fetch cash transactions
  const cashTx = await prisma.cashLedger.findMany({
    where: {
      customerId,
      ...(startDate && { date: { gte: startDate } }),
      ...(endDate && { date: { lte: endDate } })
    },
    orderBy: { date: 'asc' }
  })

  // Calculate running balances for gold
  let goldBalance = 0
  const goldTransactions: StatementTransaction[] = goldTx.map(tx => {
    const weight = Number(tx.weight)
    goldBalance += tx.type === 'RECEIVE' ? weight : -weight
    
    return {
      date: tx.date,
      type: tx.type,
      weight,
      purity: Number(tx.purity),
      makingRate: tx.makingRate ? Number(tx.makingRate) : undefined,
      notes: tx.notes,
      runningBalance: goldBalance
    }
  })

  // Calculate running balances for cash (by currency)
  const cashByurrency = new Map<string, number>()
  const cashTransactions: StatementTransaction[] = cashTx.map(tx => {
    const amount = Number(tx.amount)
    const currency = tx.currency
    const currentBalance = cashByurrency.get(currency) || 0
    const newBalance = currentBalance + (tx.type === 'RECEIVE' ? amount : -amount)
    cashByurrency.set(currency, newBalance)
    
    return {
      date: tx.date,
      type: tx.type,
      amount,
      currency,
      notes: tx.notes,
      runningBalance: newBalance
    }
  })

  // Calculate summary
  const goldSummary = goldTx.reduce(
    (acc, tx) => {
      const weight = Number(tx.weight)
      if (tx.type === 'RECEIVE') acc.totalReceived += weight
      else acc.totalPaid += weight
      return acc
    },
    { totalReceived: 0, totalPaid: 0, balance: 0 }
  )
  goldSummary.balance = goldSummary.totalReceived - goldSummary.totalPaid

  const cashSummary: Record<string, { received: number; paid: number; balance: number }> = {}
  cashTx.forEach(tx => {
    if (!cashSummary[tx.currency]) {
      cashSummary[tx.currency] = { received: 0, paid: 0, balance: 0 }
    }
    const amount = Number(tx.amount)
    if (tx.type === 'RECEIVE') {
      cashSummary[tx.currency].received += amount
    } else {
      cashSummary[tx.currency].paid += amount
    }
  })
  
  Object.keys(cashSummary).forEach(currency => {
    cashSummary[currency].balance = 
      cashSummary[currency].received - cashSummary[currency].paid
  })

  return {
    customer: {
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address
    },
    dateRange: {
      start: startDate,
      end: endDate
    },
    goldTransactions,
    cashTransactions,
    summary: {
      gold: goldSummary,
      cash: cashSummary
    }
  }
}

export async function getVendorStatement(
  vendorId: string,
  startDate?: Date,
  endDate?: Date
): Promise<StatementData> {
  const session = await auth()
  if (!session?.user?.email) {
    throw new Error('Unauthorized')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { companyId: true, tenantId: true }
  })

  // Fetch vendor details
  const vendor = await prisma.vendor.findFirst({
    where: {
      id: vendorId,
      ...(user?.companyId ? { companyId: user.companyId } : { company: { tenantId: user?.tenantId } })
    }
  })

  if (!vendor) {
    throw new Error('Vendor not found')
  }

  // Fetch gold transactions
  const goldTx = await prisma.goldLedger.findMany({
    where: {
      vendorId,
      ...(startDate && { date: { gte: startDate } }),
      ...(endDate && { date: { lte: endDate } })
    },
    orderBy: { date: 'asc' }
  })

  // Fetch cash transactions
  const cashTx = await prisma.cashLedger.findMany({
    where: {
      vendorId,
      ...(startDate && { date: { gte: startDate } }),
      ...(endDate && { date: { lte: endDate } })
    },
    orderBy: { date: 'asc' }
  })

  // Calculate running balances for gold
  let goldBalance = 0
  const goldTransactions: StatementTransaction[] = goldTx.map(tx => {
    const weight = Number(tx.weight)
    goldBalance += tx.type === 'RECEIVE' ? weight : -weight
    
    return {
      date: tx.date,
      type: tx.type,
      weight,
      purity: Number(tx.purity),
      notes: tx.notes,
      runningBalance: goldBalance
    }
  })

  // Calculate running balances for cash
  const cashByCurrency = new Map<string, number>()
  const cashTransactions: StatementTransaction[] = cashTx.map(tx => {
    const amount = Number(tx.amount)
    const currency = tx.currency
    const currentBalance = cashByCurrency.get(currency) || 0
    const newBalance = currentBalance + (tx.type === 'RECEIVE' ? amount : -amount)
    cashByCurrency.set(currency, newBalance)
    
    return {
      date: tx.date,
      type: tx.type,
      amount,
      currency,
      notes: tx.notes,
      runningBalance: newBalance
    }
  })

  // Calculate summary
  const goldSummary = goldTx.reduce(
    (acc, tx) => {
      const weight = Number(tx.weight)
      if (tx.type === 'RECEIVE') acc.totalReceived += weight
      else acc.totalPaid += weight
      return acc
    },
    { totalReceived: 0, totalPaid: 0, balance: 0 }
  )
  goldSummary.balance = goldSummary.totalReceived - goldSummary.totalPaid

  const cashSummary: Record<string, { received: number; paid: number; balance: number }> = {}
  cashTx.forEach(tx => {
    if (!cashSummary[tx.currency]) {
      cashSummary[tx.currency] = { received: 0, paid: 0, balance: 0 }
    }
    const amount = Number(tx.amount)
    if (tx.type === 'RECEIVE') {
      cashSummary[tx.currency].received += amount
    } else {
      cashSummary[tx.currency].paid += amount
    }
  })
  
  Object.keys(cashSummary).forEach(currency => {
    cashSummary[currency].balance = 
      cashSummary[currency].received - cashSummary[currency].paid
  })

  return {
    vendor: {
      name: vendor.name,
      phone: vendor.phone,
      email: vendor.email,
      address: vendor.address
    },
    dateRange: {
      start: startDate,
      end: endDate
    },
    goldTransactions,
    cashTransactions,
    summary: {
      gold: goldSummary,
      cash: cashSummary
    }
  }
}
