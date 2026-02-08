'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Gem,
  Wallet,
  Users,
  Store,
  FileText,
  Building2,
  ChevronRight,
  Settings,
} from 'lucide-react'

import { useLanguage } from '@/components/providers/language-provider'

interface NavigationItem {
  key: keyof import('@/lib/i18n/dictionaries').Dictionary['sidebar']
  href: string
  icon: any
  roles?: string[]
}

const navigation: NavigationItem[] = [
  { key: 'dashboard', href: '/dashboard', icon: LayoutDashboard },
  { key: 'goldLedger', href: '/gold-ledger', icon: Gem },
  { key: 'cashLedger', href: '/cash-ledger', icon: Wallet },
  { key: 'customers', href: '/customers', icon: Users },
  { key: 'vendors', href: '/vendors', icon: Store },

  { key: 'companies', href: '/companies', icon: Building2, roles: ['OWNER', 'SUPER_ADMIN'] },
  { key: 'team', href: '/team', icon: Users, roles: ['OWNER', 'SUPER_ADMIN', 'COMPANY_ADMIN'] },
  { key: 'reports', href: '/reports', icon: FileText },
  { key: 'settings', href: '/settings', icon: Settings, roles: ['OWNER', 'SUPER_ADMIN', 'COMPANY_ADMIN'] },
]

interface SidebarProps {
  userRole?: string
  userName?: string | null
  userEmail?: string | null
}

export function Sidebar({ userRole, userName, userEmail }: SidebarProps) {
  const pathname = usePathname()
  const { t } = useLanguage()

  // Filter navigation items based on user role
  const filteredNavigation = navigation.filter(item => {
    // If no roles specified, show to everyone
    if (!item.roles) return true
    // If roles specified, check if user's role is in the allowed roles
    return userRole && item.roles.includes(userRole)
  })
  
  // Format role for display
  const displayRole = userRole ? userRole.replace('_', ' ') : 'User'

  // Get initials for avatar
  const initials = userName
    ? userName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : userEmail?.substring(0, 2).toUpperCase() || 'U'

  return (
    <div className="hidden border-r bg-white lg:block lg:w-64">
      <div className="flex h-full flex-col">
        {/* Logo Section */}
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500">
              <Gem className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">JewelCraft</h1>
              <p className="text-xs text-gray-500">Manufacturing Suite</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-4 py-2">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  'group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={cn(
                    "h-5 w-5",
                    isActive ? "text-white" : "text-gray-400"
                  )} />
                  <span>{t.sidebar[item.key]}</span>
                </div>
                {isActive && (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* User Profile Section */}
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white font-semibold">
              {initials}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-semibold text-gray-900">{userName || 'User'}</p>
              <div className="flex items-center justify-between">
                <p className="truncate text-xs text-gray-500" title={userEmail || ''}>{userEmail}</p>
              </div>
              <p className="mt-0.5 text-[10px] font-medium text-orange-600 uppercase tracking-wider">{displayRole}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
