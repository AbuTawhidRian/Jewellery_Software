import { getUsers } from '@/app/actions/users'
import { UsersTable } from '@/components/users/users-table'
import { InviteUserDialog } from '@/components/users/invite-user-dialog'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { getCompanies } from '@/app/actions/companies'

export default async function UsersPage() {
  const session = await auth()
  
  if (!session?.user?.email) {
    redirect('/login')
  }

  // Check user role - only OWNER, SUPER_ADMIN, and COMPANY_ADMIN can access
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true }
  })

  if (!user || (user.role !== 'OWNER' && user.role !== 'SUPER_ADMIN' && user.role !== 'COMPANY_ADMIN')) {
    redirect('/dashboard')
  }

  const users = await getUsers()
  
  let companies: { id: string; name: string }[] = []
  if (user.role === 'OWNER' || user.role === 'SUPER_ADMIN') {
    // Only fetch companies for owners/super admins who can assign them
    try {
      companies = await getCompanies()
    } catch (error) {
      console.error('Failed to fetch companies:', error)
      // Don't crash the page, just pass empty array
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
          <p className="text-muted-foreground">
            Manage your team's access and roles.
          </p>
        </div>
        <InviteUserDialog companies={companies} currentUserRole={user.role} />
      </div>

      <UsersTable users={users} />
    </div>
  )
}
