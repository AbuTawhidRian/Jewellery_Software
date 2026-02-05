import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const users = await prisma.user.findMany()
    const sanitizedUsers = users.map(u => ({
      email: u.email,
      hasPasswordHash: !!u.passwordHash,
      hashLength: u.passwordHash?.length,
      role: u.role
    }))
    return NextResponse.json({ users: sanitizedUsers })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
