import { getCompanies } from '@/app/actions/companies'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Building2, MapPin, Phone, Mail, Hash } from 'lucide-react'
import { AddCompanyDialog } from '@/components/companies/add-company-dialog'

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
        <AddCompanyDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {companies.map((company) => (
          <Card key={company.id} className="overflow-hidden">
            <CardHeader className="bg-muted/50 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-orange-500" />
                  {company.name}
                </CardTitle>
              </div>
              <CardDescription className="flex items-center gap-1">
                {company.country} • {company.currency}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                {company.address && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <span>{company.address}</span>
                  </div>
                )}
                {company.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{company.phone}</span>
                  </div>
                )}
                {company.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="truncate">{company.email}</span>
                  </div>
                )}
                {company.trn && (
                  <div className="flex items-center gap-2 text-sm">
                    <Hash className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>TRN: {company.trn}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t flex items-center justify-between">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {company._count.users} team member{company._count.users !== 1 ? 's' : ''}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {companies.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
            <p className="text-muted-foreground mb-6 text-center max-w-sm">
              You haven't added any companies yet. Companies are the top-level entities for your business operations.
            </p>
            <AddCompanyDialog />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
