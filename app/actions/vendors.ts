'use server'

import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// Validation schema for vendor
const vendorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional().nullable(),
  email: z.string().email('Invalid email').optional().nullable().or(z.literal('')),
  address: z.string().optional().nullable(),
  taxId: z.string().optional().nullable(),
})

export type VendorFormData = z.infer<typeof vendorSchema>

/**
 * Get all vendors for the company
 */
export async function getVendors() {
  const session = await auth()
  if (!session?.user?.email) throw new Error('Unauthorized')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { companyId: true, tenantId: true }
  })

  const companyId = user?.companyId
  const tenantId = user?.tenantId

  if (!tenantId) return []

  const vendors = await prisma.vendor.findMany({
    where: companyId ? { companyId } : { company: { tenantId } },
    include: {
        _count: {
            select: {
                goldTransactions: true,
                cashTransactions: true
            }
        }
    },
    orderBy: { createdAt: 'desc' }
  })

  return vendors
}

/**
 * Get a single vendor by ID
 */
export async function getVendor(id: string) {
  const session = await auth()
  if (!session?.user?.email) throw new Error('Unauthorized')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { companyId: true }
  })

  // Ensure user has access to this vendor
  const vendor = await prisma.vendor.findUnique({
    where: { 
        id,
        ...(user?.companyId && { companyId: user.companyId })
    },
    include: {
      goldTransactions: {
        orderBy: { date: 'desc' },
        take: 10
      },
      cashTransactions: {
        orderBy: { date: 'desc' },
        take: 10
      }
    }
  })

  if (!vendor) return null

  // Serialize transactions to avoid Decimal errors
  const serializedGold = vendor.goldTransactions.map(t => ({
      ...t,
      weight: Number(t.weight),
      purity: Number(t.purity)
  }))

  const serializedCash = vendor.cashTransactions.map(t => ({
      ...t,
      amount: Number(t.amount)
  }))

  return {
      ...vendor,
      goldTransactions: serializedGold,
      cashTransactions: serializedCash
  }
}

/**
 * Create a new vendor
 */
export async function createVendor(data: VendorFormData) {
  const session = await auth()
  if (!session?.user?.email) throw new Error('Unauthorized')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { companyId: true, role: true }
  })

  if (!user?.companyId) throw new Error('No company context')
  if (user.role === 'VIEWER') throw new Error('Insufficient permissions')

  const validated = vendorSchema.parse(data)

  const vendor = await prisma.vendor.create({
    data: {
      ...validated,
      companyId: user.companyId
    }
  })

  revalidatePath('/vendors')
  return vendor
}

/**
 * Update a vendor
 */
export async function updateVendor(id: string, data: VendorFormData) {
  const session = await auth()
  if (!session?.user?.email) throw new Error('Unauthorized')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { companyId: true, role: true }
  })

  if (!user?.companyId) throw new Error('No company context')
  if (user.role === 'VIEWER') throw new Error('Insufficient permissions')

  const validated = vendorSchema.parse(data)

  const vendor = await prisma.vendor.update({
    where: { 
        id,
        companyId: user.companyId
    },
    data: validated
  })

  revalidatePath('/vendors')
  revalidatePath(`/vendors/${id}`)
  return vendor
}

/**
 * Delete a vendor
 */
export async function deleteVendor(id: string) {
    const session = await auth()
    if (!session?.user?.email) throw new Error('Unauthorized')
  
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { companyId: true, role: true }
    })
  
    if (!user?.companyId) throw new Error('No company context')
    if (user.role !== 'SUPER_ADMIN' && user.role !== 'COMPANY_ADMIN') throw new Error('Insufficient permissions')
  
    // Check for existing transactions
    const vendorWithTransactions = await prisma.vendor.findUnique({
        where: { id },
        include: {
            _count: {
                select: {
                    goldTransactions: true,
                    cashTransactions: true
                }
            }
        }
    })

    if (vendorWithTransactions) {
        if (vendorWithTransactions._count.goldTransactions > 0 || vendorWithTransactions._count.cashTransactions > 0) {
            throw new Error('Cannot delete vendor with existing transactions')
        }
    }

    await prisma.vendor.delete({
      where: { 
          id,
          companyId: user.companyId
      }
    })
  
    revalidatePath('/vendors')
  }
