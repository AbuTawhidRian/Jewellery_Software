'use client'

import { useActionState } from 'react'
import { register } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { toast } from 'sonner'

import { ActionState } from '@/app/actions/auth'

const initialState: ActionState = {
  error: '',
  errors: {},
  success: false
}

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(register, initialState)
  const router = useRouter()

  useEffect(() => {
    if (state?.success) {
      toast.success('Account created successfully!')
      router.push('/login')
    } else if (state?.error) {
      toast.error(state.error)
    }
  }, [state, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">Create your account</CardTitle>
          <CardDescription>
            Start managing your jewellery business today
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-4">
            
            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                name="companyName"
                placeholder="Jewellery Co."
                required
                disabled={isPending}
              />
              {state?.errors?.companyName && (
                <p className="text-sm text-red-500">{state.errors.companyName[0]}</p>
              )}
            </div>

            {/* Admin Name */}
            <div className="space-y-2">
              <Label htmlFor="adminName">Full Name</Label>
              <Input
                id="adminName"
                name="adminName"
                placeholder="John Doe"
                required
                disabled={isPending}
              />
               {state?.errors?.adminName && (
                <p className="text-sm text-red-500">{state.errors.adminName[0]}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
                disabled={isPending}
              />
               {state?.errors?.email && (
                <p className="text-sm text-red-500">{state.errors.email[0]}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                disabled={isPending}
              />
               {state?.errors?.password && (
                <p className="text-sm text-red-500">{state.errors.password[0]}</p>
              )}
            </div>

          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Creating Account...' : 'Create Account'}
            </Button>
            <div className="text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-primary hover:text-primary/80 hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
