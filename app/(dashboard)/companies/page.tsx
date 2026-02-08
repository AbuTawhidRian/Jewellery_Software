import { getCompanies } from '@/app/actions/companies'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default async function CompaniesPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/login')
  }

  // This page is only for OWNER and SUPER_ADMIN
  const companies = await getCompanies().catch(() => {
    redirect('/dashboard') // Redirect if not authorized
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
          <p className="text-muted-foreground">
            Manage your multiple companies and branches.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Company
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {companies.map((company) => (
          <Card key={company.id}>
            <CardHeader>
              <CardTitle>{company.name}</CardTitle>
              <CardDescription>
                {company.country} • {company.currency}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {company._count.users} team member{company._count.users !== 1 ? 's' : ''}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {companies.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No companies yet</p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Company
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
