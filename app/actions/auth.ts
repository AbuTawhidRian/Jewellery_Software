'use server'

export type ActionState = {
  error?: string
  success?: boolean
  errors?: { [key: string]: string[] }
  [key: string]: any // Loosen type for now to satisfy useActionState
}

import { z } from 'zod'
import { prisma } from '@/lib/db'
import { signIn } from '@/auth'
import { hashPassword, comparePassword } from '@/lib/auth'
import { UserRole, SubscriptionStatus } from '@prisma/client'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { loginRateLimiter, registerRateLimiter } from '@/lib/rate-limit'



const RegisterSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  adminName: z.string().min(2, "Admin name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
})

const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

// -----------------------------------------------------------------------------
// ACTIONS
// -----------------------------------------------------------------------------

export async function register(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const data = Object.fromEntries(formData)
  const validation = RegisterSchema.safeParse(data)

  if (!validation.success) {
    return { error: 'Invalid input', errors: validation.error.flatten().fieldErrors }
  }

  const { companyName, adminName, email, password } = validation.data

  // Rate limiting: 3 registration attempts per hour per IP
  const identifier = `register:${email}`
  const { success: rateLimitOk } = await registerRateLimiter.limit(identifier)
  
  if (!rateLimitOk) {
    return { error: 'Too many registration attempts. Please try again later.' }
  }

  try {
    // 1. Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      // Use generic error to prevent email enumeration
      return { error: 'Registration failed. Please check your information and try again.' }
    }

    // 2. Hash password
    const hashedPassword = await hashPassword(password)

    // 3. Transaction: Create Tenant, Subscription, Company, User
    await prisma.$transaction(async (tx) => {
      // Create Tenant
      const tenant = await tx.tenant.create({
        data: {
          name: companyName + "'s Tenant",
        },
      })

      // Create Subscription (Trial)
      await tx.subscription.create({
        data: {
          tenantId: tenant.id,
          status: SubscriptionStatus.TRIAL,
          plan: 'TRIAL',
        },
      })

      // Create Company
      const company = await tx.company.create({
        data: {
          name: companyName,
          country: 'US', // Default, should be selectable
          tenantId: tenant.id,
        },
      })

      // Create User (Company Admin)
      await tx.user.create({
        data: {
            email,
            passwordHash: hashedPassword,
            name: adminName,
            role: UserRole.COMPANY_ADMIN,
            tenantId: tenant.id,
            companyId: company.id
        }
      })
    })

    return { success: true }
  } catch (error) {
    // Log error securely without exposing details to client
    if (error instanceof Error) {
      console.error('[Registration Error]', { message: error.message, email })
    }
    return { error: 'Registration failed. Please try again later.' }
  }
}

export async function login(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const data = Object.fromEntries(formData)
    const validation = LoginSchema.safeParse(data)

    if (!validation.success) {
        return { error: 'Invalid credentials' }
    }

    const { email, password } = validation.data

    // Rate limiting: 5 login attempts per 15 minutes per email
    const identifier = `login:${email}`
    const { success: rateLimitOk } = await loginRateLimiter.limit(identifier)
    
    if (!rateLimitOk) {
        return { error: 'Too many login attempts. Please try again in 15 minutes.' }
    }

    try {
        // Always fetch user and perform password comparison to prevent timing attacks
        const user = await prisma.user.findUnique({
            where: { email }
        })

        // Use a dummy hash for non-existent users to maintain constant time
        const hashToCompare = user?.passwordHash || '$2a$10$dummyhashfornonexistentusertopreventtimingattacks'
        
        // Always perform password comparison (even if user doesn't exist)
        const passwordsMatch = await comparePassword(password, hashToCompare)

        // Check both conditions together to prevent user enumeration
        if (!user || !user.passwordHash || !passwordsMatch) {
            return { error: 'Invalid credentials' }
        }

        // Authenticate with NextAuth
        await signIn('credentials', {
           email,
           password,
           redirect: false
        })
        
        return { success: true }

    } catch (error) {
        if ((error as Error).message.includes('CredentialsSignin')) {
            return { error: 'Invalid credentials' }
        }
        // Log error securely without exposing details
        if (error instanceof Error) {
            console.error('[Login Error]', { message: error.message, email })
        }
        return { error: 'Authentication failed. Please try again.' }
    }
}

export async function logout() {
    const cookieStore = await cookies()
    cookieStore.delete('session')
    redirect('/login')
}
