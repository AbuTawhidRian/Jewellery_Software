'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import fs from 'fs'

// Validation schema for gold transaction
const goldTransactionSchema = z.object({
  type: z.enum(['RECEIVE_GOLD', 'USE_FOR_JEWELLERY', 'JEWELLERY_DELIVERY', 'JEWELLERY_RETURN', 'ADJUSTMENT']),
  weight: z.number().positive('Weight must be positive'),
  purity: z.number().min(0).max(100, 'Purity must be between 0 and 100'),
  customerId: z.string().optional(),
  orderId: z.string().optional(),
  date: z.date().optional(),
  notes: z.string().optional(),
})

type GoldTransactionFormData = z.infer<typeof goldTransactionSchema>

/**
 * Get all gold transactions with relations
 */
export async function getGoldTransactions() {
  const session = await auth()
  
  if (!session?.user?.email) {
    throw new Error('Unauthorized')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { companyId: true, tenantId: true }
  })

  const companyId = user?.companyId
  const tenantId = user?.tenantId

  if (!tenantId) {
    return []
  }

  const transactions = await prisma.goldLedger.findMany({
    where: companyId ? { companyId } : { company: { tenantId } },
    include: {
      customer: {
        select: { id: true, name: true }
      },
      order: {
        select: { id: true, orderNo: true }
      }
    },
    orderBy: { date: 'desc' }
  })

  return transactions
}

/**
 * Create a new gold transaction
 */
export async function createGoldTransaction(data: GoldTransactionFormData) {
  const session = await auth()
  
  if (!session?.user?.email) {
    throw new Error('Unauthorized')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { companyId: true, tenantId: true, role: true }
  })

  // Only certain roles can add transactions
  if (!user || (user.role === 'VIEWER')) {
    throw new Error('Insufficient permissions')
  }

  const companyId = user.companyId
  
  if (!companyId) {
    throw new Error('User must be associated with a company')
  }

  // Validate the data
  const validated = goldTransactionSchema.parse(data)

  // Create the transaction
  const transaction = await prisma.goldLedger.create({
    data: {
      type: validated.type,
      weight: validated.weight,
      purity: validated.purity,
      date: validated.date || new Date(),
      notes: validated.notes,
      companyId,
      customerId: validated.customerId,
      orderId: validated.orderId,
    },
    include: {
      customer: {
        select: { id: true, name: true }
      }
    }
  })

  revalidatePath('/gold-ledger')
  return transaction
}

/**
 * Get customer-specific gold balance
 */
export async function getCustomerGoldBalance(customerId: string) {
  const session = await auth()
  
  if (!session?.user?.email) {
    throw new Error('Unauthorized')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { companyId: true, tenantId: true }
  })

  const companyId = user?.companyId
  const tenantId = user?.tenantId

  if (!tenantId) {
    return { balance: 0, transactions: [] }
  }

  const transactions = await prisma.goldLedger.findMany({
    where: {
      customerId,
      ...(companyId ? { companyId } : { company: { tenantId } })
    },
    include: {
      customer: {
        select: { id: true, name: true }
      }
    },
    orderBy: { date: 'desc' }
  })

  let balance = 0
  transactions.forEach(t => {
    const weight = Number(t.weight)
    if (t.type === 'RECEIVE_GOLD' || t.type === 'JEWELLERY_RETURN') {
      balance += weight
    } else if (t.type === 'USE_FOR_JEWELLERY' || t.type === 'JEWELLERY_DELIVERY') {
      balance -= weight
    }
    // ADJUSTMENT can be positive or negative based on weight sign
  })

  return {
    balance: balance.toFixed(3),
    transactions
  }
}

/**
 * Get gold statistics and summary
 */
export async function getGoldStats() {
  try {
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
        totalIn: '0.000',
        totalOut: '0.000',
        balance: '0.000',
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

    const transactions = await prisma.goldLedger.findMany({
      where: companyId ? { companyId } : { company: { tenantId } },
      select: { weight: true, type: true, purity: true }
    })

    let totalIn = 0
    let totalOut = 0
    let k24Balance = 0
    let k22Balance = 0
    let k18Balance = 0

    transactions.forEach(t => {
      const weight = Number(t.weight)
      const purity = Number(t.purity)

      if (t.type === 'RECEIVE_GOLD' || t.type === 'JEWELLERY_RETURN') {
        totalIn += weight
      } else if (t.type === 'USE_FOR_JEWELLERY' || t.type === 'JEWELLERY_DELIVERY') {
        totalOut += weight
      }

      // Calculate net weight for balance
      let netWeight = 0
      if (t.type === 'RECEIVE_GOLD' || t.type === 'JEWELLERY_RETURN') {
        netWeight = weight
      } else if (t.type === 'USE_FOR_JEWELLERY' || t.type === 'JEWELLERY_DELIVERY') {
        netWeight = -weight
      }

      // Map to karat buckets using custom mappings or fallbacks
      // We'll define ranges based on the custom mappings
      const p24 = customKarats['24'] || 99.9
      const p22 = customKarats['22'] || 91.6
      const p18 = customKarats['18'] || 75.0

      if (purity >= p24 - 0.5) {
        k24Balance += netWeight
      } else if (purity >= p22 - 1.0 && purity < p24 - 0.5) {
        k22Balance += netWeight
      } else if (purity >= p18 - 2.0 && purity < p22 - 1.0) {
        k18Balance += netWeight
      }
    })

    const balance = totalIn - totalOut

    return {
      totalIn: totalIn.toFixed(3),
      totalOut: totalOut.toFixed(3),
      balance: balance.toFixed(3),
      k24: k24Balance.toFixed(3),
      k22: k22Balance.toFixed(3),
      k18: k18Balance.toFixed(3)
    }
  } catch (err: any) {
    fs.appendFileSync('error_debug.log', `[${new Date().toISOString()}] getGoldStats Error: ${err.message}\n${err.stack}\n`)
    throw err
  }
}

