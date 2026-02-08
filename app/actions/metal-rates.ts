'use server'

import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const metalRateSchema = z.object({
  gold24k: z.number().min(0),
  gold22k: z.number().min(0),
  gold18k: z.number().min(0),
  silver: z.number().min(0),
})

export async function getTodayMetalRate() {
  const session = await auth()
  if (!session?.user?.email) return null

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { companyId: true, tenantId: true }
  })

  if (!user?.companyId) return null

  // Get today's rate
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const rate = await prisma.metalRate.findFirst({
    where: {
      companyId: user.companyId,
      date: {
        gte: today,
        lt: tomorrow
      }
    }
  })

  if (rate) {
    return {
      gold24k: Number(rate.gold24k),
      gold22k: Number(rate.gold22k),
      gold18k: Number(rate.gold18k),
      silver: Number(rate.silver),
      updatedAt: rate.updatedAt
    }
  }

  // If no rate today, try to get yesterday's rate as fallback
  const lastRate = await prisma.metalRate.findFirst({
    where: { companyId: user.companyId },
    orderBy: { date: 'desc' }
  })

  if (lastRate) {
    return {
      gold24k: Number(lastRate.gold24k),
      gold22k: Number(lastRate.gold22k),
      gold18k: Number(lastRate.gold18k),
      silver: Number(lastRate.silver),
      updatedAt: lastRate.updatedAt,
      isOldRate: true
    }
  }

  return null
}

export async function updateTodayMetalRate(data: z.infer<typeof metalRateSchema>) {
  const session = await auth()
  if (!session?.user?.email) throw new Error('Unauthorized')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { companyId: true }
  })

  if (!user?.companyId) throw new Error('Company not found')

  const validated = metalRateSchema.parse(data)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Check if rate exists for today
  const existingRate = await prisma.metalRate.findFirst({
    where: {
      companyId: user.companyId,
      date: {
        gte: today,
        lt: tomorrow
      }
    }
  })

  if (existingRate) {
    await prisma.metalRate.update({
      where: { id: existingRate.id },
      data: {
        gold24k: validated.gold24k,
        gold22k: validated.gold22k,
        gold18k: validated.gold18k,
        silver: validated.silver,
      }
    })
  } else {
    await prisma.metalRate.create({
      data: {
        companyId: user.companyId,
        date: today, // Store as midnight
        gold24k: validated.gold24k,
        gold22k: validated.gold22k,
        gold18k: validated.gold18k,
        silver: validated.silver,
      }
    })
  }

  revalidatePath('/dashboard')
  revalidatePath('/settings')
  return { success: true }
}
