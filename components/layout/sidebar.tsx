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

interface NavigationItem {
  name: string
  href: string
  icon: any
  roles?: ('OWNER' | 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'STAFF')[]
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Gold Ledger', href: '/gold-ledger', icon: Gem },
  { name: 'Cash Ledger', href: '/cash-ledger', icon: Wallet },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Vendors', href: '/vendors', icon: Store },

  { name: 'Companies / Branches', href: '/companies', icon: Building2, roles: ['OWNER', 'SUPER_ADMIN'] },
  { name: 'Team', href: '/team', icon: Users, roles: ['OWNER', 'SUPER_ADMIN', 'COMPANY_ADMIN'] },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings, roles: ['OWNER', 'SUPER_ADMIN', 'COMPANY_ADMIN'] },
]

interface SidebarProps {
  userRole?: 'OWNER' | 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'STAFF'
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()

  // Filter navigation items based on user role
  const filteredNavigation = navigation.filter(item => {
    // If no roles specified, show to everyone
    if (!item.roles) return true
    // If roles specified, check if user's role is in the allowed roles
    return userRole && item.roles.includes(userRole)
  })

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
                key={item.name}
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
                  <span>{item.name}</span>
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
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white font-semibold">
              R
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-gray-900">Rian Bitm</p>
              <p className="truncate text-xs text-gray-500">bitmrian@gmail.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
