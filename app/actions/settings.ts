'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const companySettingsSchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  country: z.string().min(1, 'Country is required'),
  currency: z.string().min(3).max(3),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  trn: z.string().optional(),
  currencies: z.array(z.string()).optional(),
  customKarats: z.record(z.string(), z.number()).optional(),
})

type CompanySettingsFormData = z.infer<typeof companySettingsSchema>

/**
 * Get current company settings
 */
export async function getCompanySettings() {
  const session = await auth()
  
  if (!session?.user?.email) {
    throw new Error('Unauthorized')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { companyId: true, tenantId: true, role: true }
  })

  if (!user?.companyId) {
    throw new Error('User must be associated with a company')
  }

  const company = await prisma.company.findUnique({
    where: { id: user.companyId },
  })

  if (!company) {
    throw new Error('Company not found')
  }

  return {
    id: company.id,
    name: company.name,
    country: company.country,
    currency: company.currency,
    address: company.address,
    phone: company.phone,
    email: company.email,
    trn: company.trn,
    currencies: company.currencies as string[] | null,
    customKarats: company.customKarats as Record<string, number> | null,
    createdAt: company.createdAt,
    updatedAt: company.updatedAt,
  }
}

/**
 * Update company settings (admin only)
 */
export async function updateCompanySettings(data: CompanySettingsFormData) {
  const session = await auth()
  
  if (!session?.user?.email) {
    throw new Error('Unauthorized')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { companyId: true, role: true, tenantId: true }
  })

  // Only admins and owners can update settings
  if (!user || !['OWNER', 'COMPANY_ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    throw new Error('Insufficient permissions. Only admins can modify settings.')
  }

  if (!user.companyId) {
    throw new Error('User must be associated with a company')
  }

  // Validate the data
  const validated = companySettingsSchema.parse(data)

  // Update company
  const company = await prisma.company.update({
    where: { id: user.companyId },
    data: {
      name: validated.name,
      country: validated.country,
      currency: validated.currency,
      address: validated.address,
      phone: validated.phone,
      email: validated.email,
      trn: validated.trn,
      currencies: (validated.currencies || null) as Prisma.InputJsonValue,
      customKarats: (validated.customKarats || null) as Prisma.InputJsonValue,
    },
  })

  // If user is OWNER or SUPER_ADMIN, propagate customKarats to all companies in the same tenant
  if (['OWNER', 'SUPER_ADMIN'].includes(user.role) && user.tenantId) {
    await prisma.company.updateMany({
      where: { 
        tenantId: user.tenantId,
        id: { not: user.companyId } // Already updated above
      },
      data: {
        customKarats: (validated.customKarats || null) as Prisma.InputJsonValue,
      }
    })
  }

  revalidatePath('/settings')
  revalidatePath('/dashboard')
  revalidatePath('/companies')
  revalidatePath('/gold-ledger')
  revalidatePath('/cash-ledger')
  revalidatePath('/reports')
  revalidatePath('/team')
  return company
}
