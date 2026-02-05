import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { RegisterForm } from './register-form'

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata() {
  return {
    title: 'Register',
  }
}

export default async function RegisterPage() {
  const session = await auth()

  if (session?.user) {
    redirect('/dashboard')
  }

  return <RegisterForm />
}
