'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Package,
  Box,
  TrendingUp,
  FileText,
  Settings,
  LogOut,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Orders', href: '/orders', icon: Package },
  { name: 'Inventory', href: '/inventory', icon: Box },
  { name: 'Metal Rates', href: '/metal-rates', icon: TrendingUp },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden border-r bg-gray-50/40 lg:block lg:w-64">
      <div className="flex h-full flex-col gap-2">
        {/* Logo */}
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Box className="h-6 w-6 text-primary" />
            <span className="text-lg">Jewellery SaaS</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="border-t p-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-700"
            asChild
          >
            <form action="/api/auth/signout" method="POST">
              <button type="submit" className="flex w-full items-center gap-3">
                <LogOut className="h-5 w-5" />
                Sign Out
              </button>
            </form>
          </Button>
        </div>
      </div>
    </div>
  )
}
