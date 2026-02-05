import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { LoginForm } from './login-form'

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata() {
  return {
    title: 'Login',
  }
}

export default async function LoginPage() {
  const session = await auth()

  if (session?.user) {
    redirect('/dashboard')
  }

  return <LoginForm />
}
