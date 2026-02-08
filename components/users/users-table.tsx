'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Shield, Trash } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { updateUserRole, removeUser } from '@/app/actions/users'
import { Badge } from '@/components/ui/badge'

interface User {
  id: string
  name: string | null
  email: string
  role: string
  createdAt: Date
}

interface UsersTableProps {
  users: User[]
  currentUserId?: string
}

export function UsersTable({ users, currentUserId }: UsersTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleRoleChange = async (userId: string, newRole: string) => {
    setLoadingId(userId)
    try {
      await updateUserRole(userId, newRole as any)
      toast.success('Role updated successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update role')
    } finally {
      setLoadingId(null)
    }
  }

  const handleRemoveUser = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this user? This action cannot be undone.')) return

    setLoadingId(userId)
    try {
      await removeUser(userId)
      toast.success('User removed successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove user')
    } finally {
      setLoadingId(null)
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'destructive'
      case 'COMPANY_ADMIN':
        return 'default'
      case 'ACCOUNTANT':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant={getRoleBadgeVariant(user.role) as any}>
                  {user.role.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell>{format(new Date(user.createdAt), 'MMM d, yyyy')}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0" disabled={loadingId === user.id}>
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <Shield className="mr-2 h-4 w-4" />
                        Change Role
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuRadioGroup 
                          value={user.role} 
                          onValueChange={(val) => handleRoleChange(user.id, val)}
                        >
                          <DropdownMenuRadioItem value="VIEWER">Viewer</DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="PRODUCTION_STAFF">Production Staff</DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="ACCOUNTANT">Accountant</DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="COMPANY_ADMIN">Company Admin</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => handleRemoveUser(user.id)}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Remove User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {users.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No users found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
