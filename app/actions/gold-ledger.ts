'use server'
import {z} from 'zod'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { TransactionType } from '@prisma/client'
import fs from 'fs'

// Validation schema for gold transaction
const goldTransactionSchema = z.object({
  type: z.enum([
    'METAL_PURCHASE', 'METAL_SALE', 'METAL_RECEIPT', 
    'METAL_PAYMENT', 'METAL_RECEIPT_RETURN', 'METAL_PAYMENT_RETURN',
    'ADJUSTMENT'
  ]),
  weight: z.coerce.number().positive('Weight must be positive'),
  purity: z.coerce.number().min(0).max(1.0, 'Purity must be between 0 and 1.0'),
  customerId: z.string().optional().nullable(),
  vendorId: z.string().optional().nullable(),
  date: z.date().optional(),
  notes: z.string().optional().nullable(),
  makingRate: z.coerce.number().min(0).optional().nullable(),
  metalRate: z.coerce.number().min(0).optional().nullable(),
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
      vendor: {
        select: { id: true, name: true }
      }
    },
    orderBy: { date: 'desc' }
  })

  // Convert Decimal to number for client-side serialization
  return transactions.map(t => ({
    ...t,
    weight: Number(t.weight),
    purity: Number(t.purity),
    makingRate: t.makingRate ? Number(t.makingRate) : null,
  }))
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
  try {
    const validated = goldTransactionSchema.parse(data)

    // Create the transaction using a transaction block to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Create the gold transaction
      const goldTransaction = await tx.goldLedger.create({
        data: {
          type: validated.type,
          weight: validated.weight,
          purity: validated.purity,
          date: validated.date || new Date(),
          notes: validated.notes,
          companyId,
          customerId: validated.customerId,
          vendorId: validated.vendorId,
          makingRate: validated.makingRate,
          metalRate: validated.metalRate,
        },
        include: {
          customer: {
            select: { id: true, name: true }
          },
          vendor: {
            select: { id: true, name: true }
          }
        }
      })

      // Get company currency for cash transactions
      const company = await tx.company.findUnique({
        where: { id: companyId },
        select: { currency: true }
      })
      const currency = company?.currency || 'USD'

      // 1. Handle Metal Price Accounting (Purchase/Sale)
      if (validated.metalRate && validated.metalRate > 0) {
        const metalValue = validated.weight * validated.metalRate
        let cashType: TransactionType | null = null
        let cashNote = ''

        if (validated.type === 'METAL_PURCHASE') {
          cashType = 'METAL_PURCHASE' // Posting for purchase debt/payment
          cashNote = `Metal Purchase: ${validated.weight}g @ ${validated.metalRate}/g`
        } else if (validated.type === 'METAL_SALE') {
          cashType = 'METAL_SALE' // Posting for sale debt/receipt
          cashNote = `Metal Sale: ${validated.weight}g @ ${validated.metalRate}/g`
        }

        if (cashType) {
          await tx.cashLedger.create({
            data: {
              type: cashType,
              amount: metalValue,
              currency,
              date: validated.date || new Date(),
              notes: `${cashNote}. Account: ${goldTransaction.customer?.name || goldTransaction.vendor?.name || 'Unknown'}`,
              companyId,
              customerId: validated.customerId,
              vendorId: validated.vendorId,
              goldTransactionId: goldTransaction.id,
            }
          })
        }
      }

      // 2. Handle Making Charge Accounting
      if (validated.makingRate && validated.makingRate > 0 && (validated.customerId || validated.vendorId)) {
        const makingCharge = validated.weight * validated.makingRate
        
        await tx.cashLedger.create({
          data: {
            type: 'MAKING_CHARGE', // Specific type for service charges
            amount: makingCharge,
            currency,
            date: validated.date || new Date(),
            notes: `Making charges: ${validated.weight}g @ ${validated.makingRate}/g. Account: ${goldTransaction.customer?.name || goldTransaction.vendor?.name || 'Unknown'}`,
            companyId,
            customerId: validated.customerId,
            vendorId: validated.vendorId,
            goldTransactionId: goldTransaction.id,
          }
        })
      }

      return goldTransaction
    })

    revalidatePath('/gold-ledger')
    revalidatePath('/cash-ledger')
    return {
      ...result,
      weight: Number(result.weight),
      purity: Number(result.purity),
      makingRate: result.makingRate ? Number(result.makingRate) : null,
    }
  } catch (error: any) {
    // Log detailed error information
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      data: JSON.stringify(data),
      timestamp: new Date().toISOString()
    }
    fs.appendFileSync('error_debug.log', `[${errorDetails.timestamp}] createGoldTransaction Error:\n${JSON.stringify(errorDetails, null, 2)}\n\n`)
    
    // Re-throw with user-friendly message
    throw new Error(error.message || 'Failed to create gold transaction')
  }
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
  const serializedTransactions = transactions.map(t => {
    const weightVal = Number(t.weight)
    const purityVal = Number(t.purity)

    const isInflow = ['METAL_PURCHASE', 'METAL_RECEIPT', 'METAL_PAYMENT_RETURN'].includes(t.type)
    const isOutflow = ['METAL_SALE', 'METAL_PAYMENT', 'METAL_RECEIPT_RETURN'].includes(t.type)

    if (isInflow) {
      balance += weightVal
    } else if (isOutflow) {
      balance -= weightVal
    } else if (t.type === 'ADJUSTMENT') {
      balance += weightVal // Assuming positive adjustment adds to balance
    }

    return {
      ...t,
      weight: weightVal,
      purity: purityVal,
      makingRate: t.makingRate ? Number(t.makingRate) : null,
    }
  })

  return {
    balance: balance.toFixed(3),
    transactions: serializedTransactions
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
        totalInActual: '0.000',
        totalInPure: '0.000',
        totalOutActual: '0.000',
        totalOutPure: '0.000',
        balanceActual: '0.000',
        balancePure: '0.000',
        karatBreakdown: {}
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

    let totalInActual = 0
    let totalInPure = 0
    let totalOutActual = 0
    let totalOutPure = 0

    // Determine available karats (from settings or default)
    const karatMappings = Object.keys(customKarats).length > 0
      ? customKarats
      : { '24': 0.999, '22': 0.916, '18': 0.750 }

    // Initialize breakdown for all mapped karats
    const karatBreakdown: Record<string, { actual: number; pure: number }> = {}
    Object.keys(karatMappings).forEach(k => {
      karatBreakdown[k] = { actual: 0, pure: 0 }
    })

    transactions.forEach(t => {
      const weight = Number(t.weight)
      const purity = Number(t.purity)
      const pureWeight = weight * purity

      const isInflow = ['METAL_PURCHASE', 'METAL_RECEIPT', 'METAL_PAYMENT_RETURN'].includes(t.type)
      const isOutflow = ['METAL_SALE', 'METAL_PAYMENT', 'METAL_RECEIPT_RETURN'].includes(t.type)

      if (isInflow) {
        totalInActual += weight
        totalInPure += pureWeight
      } else if (isOutflow) {
        totalOutActual += weight
        totalOutPure += pureWeight
      }
      
      if (t.type === 'ADJUSTMENT') {
        if (weight >= 0) {
            totalInActual += weight
            totalInPure += pureWeight
        } else {
            totalOutActual += Math.abs(weight)
            totalOutPure += Math.abs(pureWeight)
        }
      }

      // Calculate net weight for balance
      let netActual = 0
      let netPure = 0
      if (isInflow) {
        netActual = weight
        netPure = pureWeight
      } else if (isOutflow) {
        netActual = -weight
        netPure = -pureWeight
      } else if (t.type === 'ADJUSTMENT') {
        netActual = weight
        netPure = pureWeight
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

      // Assign to breakdown if it's a reasonable match
      if (closestKarat && smallestDiff < 0.005) {
        if (!karatBreakdown[closestKarat]) {
          karatBreakdown[closestKarat] = { actual: 0, pure: 0 }
        }
        karatBreakdown[closestKarat].actual += netActual
        karatBreakdown[closestKarat].pure += netPure
      }
    })

    const balanceActual = totalInActual - totalOutActual
    const balancePure = totalInPure - totalOutPure

    // Prepare formatted breakdown
    const formattedBreakdown: Record<string, { actual: string; pure: string }> = {}
    Object.entries(karatBreakdown).forEach(([k, vals]) => {
      formattedBreakdown[k] = {
        actual: vals.actual.toFixed(3),
        pure: vals.pure.toFixed(3)
      }
    })

    return {
      totalInActual: totalInActual.toFixed(3),
      totalInPure: totalInPure.toFixed(3),
      totalOutActual: totalOutActual.toFixed(3),
      totalOutPure: totalOutPure.toFixed(3),
      balanceActual: balanceActual.toFixed(3),
      balancePure: balancePure.toFixed(3),
      karatBreakdown: formattedBreakdown
    }
  } catch (error) {
    console.error('Error in getGoldStats:', error)
    return {
      totalInActual: '0.000',
      totalInPure: '0.000',
      totalOutActual: '0.000',
      totalOutPure: '0.000',
      balanceActual: '0.000',
      balancePure: '0.000',
      karatBreakdown: {}
    }
  }
}

