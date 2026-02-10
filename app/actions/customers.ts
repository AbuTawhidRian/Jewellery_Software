'use server'

import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { TransactionType } from '@prisma/client'

// Schema for customer validation
const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional(),
  trn: z.string().optional(),
  country: z.string().optional(),
})

export type CustomerFormData = z.infer<typeof customerSchema>

export type SerializedCustomer = {
  id: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
  trn: string | null
  country: string | null
  companyId: string
  createdAt: Date
  updatedAt: Date
  company: {
    id: string
    name: string
    [key: string]: any
  }
  goldTransactions: {
    id: string
    date: Date
    weight: number
    purity: number
    type: TransactionType
    makingRate: number | null
    [key: string]: any
  }[]
  cashTransactions: {
    id: string
    date: Date
    amount: number
    type: TransactionType
    currency: string
    [key: string]: any
  }[]
}

export async function getCustomers() {
  const session = await auth()
  if (!session?.user?.email) {
    throw new Error('Unauthorized')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { companyId: true, tenantId: true, role: true }
  })

  if (!user?.tenantId) {
    return []
  }

  // Get customers based on user's company or all if super admin
  const customers = await prisma.customer.findMany({
    where: user.companyId ? { companyId: user.companyId } : { company: { tenantId: user.tenantId } },
    include: {
      company: {
        select: { name: true }
      },
      _count: {
        select: {
          goldTransactions: true,
          cashTransactions: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return customers
}

export async function getCustomer(id: string): Promise<SerializedCustomer | null> {
  const session = await auth()
  if (!session?.user?.email) {
    throw new Error('Unauthorized')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { companyId: true, tenantId: true }
  })

  const customer = await prisma.customer.findFirst({
    where: {
      id,
      ...(user?.companyId ? { companyId: user.companyId } : { company: { tenantId: user?.tenantId } })
    },
    include: {
      company: true,
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

  if (!customer) {
    return null
  }

  // Serialize Decimal fields to numbers for client components
  return {
    ...customer,
    goldTransactions: customer.goldTransactions.map(t => ({
      ...t,
      weight: Number(t.weight),
      purity: Number(t.purity),
      makingRate: t.makingRate ? Number(t.makingRate) : null,
    })),
    cashTransactions: customer.cashTransactions.map(t => ({
      ...t,
      amount: Number(t.amount),
    }))
  } as SerializedCustomer
}

export async function createCustomer(data: CustomerFormData) {
  const session = await auth()
  if (!session?.user?.email) {
    throw new Error('Unauthorized')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { companyId: true, role: true }
  })

  if (!user?.companyId) {
    throw new Error('User must be assigned to a company')
  }

  // Validate permissions
  if (user.role === 'VIEWER') {
    throw new Error('Insufficient permissions')
  }

  const validated = customerSchema.parse(data)

  const customer = await prisma.customer.create({
    data: {
      ...validated,
      companyId: user.companyId
    }
  })

  revalidatePath('/dashboard/customers')
  return customer
}

export async function updateCustomer(id: string, data: CustomerFormData) {
  const session = await auth()
  if (!session?.user?.email) {
    throw new Error('Unauthorized')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { companyId: true, role: true }
  })

  if (user?.role === 'VIEWER') {
    throw new Error('Insufficient permissions')
  }

  const validated = customerSchema.parse(data)

  const customer = await prisma.customer.update({
    where: {
      id,
      ...(user?.companyId && { companyId: user.companyId })
    },
    data: validated
  })

  revalidatePath('/dashboard/customers')
  revalidatePath(`/dashboard/customers/${id}`)
  return customer
}

export async function deleteCustomer(id: string) {
  const session = await auth()
  if (!session?.user?.email) {
    throw new Error('Unauthorized')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { companyId: true, role: true }
  })

  // Only COMPANY_ADMIN, OWNER and SUPER_ADMIN can delete
  if (!['OWNER', 'COMPANY_ADMIN', 'SUPER_ADMIN'].includes(user?.role || '')) {
    throw new Error('Insufficient permissions')
  }



  await prisma.customer.delete({
    where: {
      id,
      ...(user?.companyId && { companyId: user.companyId })
    }
  })

  revalidatePath('/dashboard/customers')
  return { success: true }
}
