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
  timezone: z.string().min(1),
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
    timezone: company.timezone,
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
    select: { companyId: true, role: true }
  })

  // Only admins can update settings
  if (!user || !['COMPANY_ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
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
      timezone: validated.timezone,
      currencies: (validated.currencies || null) as Prisma.InputJsonValue,
      customKarats: (validated.customKarats || null) as Prisma.InputJsonValue,
    },
  })

  revalidatePath('/settings')
  return company
}
