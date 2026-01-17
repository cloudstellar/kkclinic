'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { logout } from '@/app/(auth)/actions'

type User = {
    full_name: string
    email: string
    role: string
}

export function Header({ user }: { user: User | null }) {
    const [isPending, startTransition] = useTransition()

    const handleLogout = () => {
        startTransition(() => {
            logout()
        })
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">Admin</span>
            case 'doctor':
                return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">แพทย์</span>
            case 'staff':
                return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">พนักงาน</span>
            default:
                return null
        }
    }

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
            <div>
                {/* Breadcrumb or page title can go here */}
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                                {user ? getInitials(user.full_name) : '?'}
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{user?.full_name || 'User'}</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                        <div className="flex flex-col gap-1">
                            <span>{user?.full_name}</span>
                            <span className="text-xs text-muted-foreground">{user?.email}</span>
                            <div className="mt-1">{user && getRoleBadge(user.role)}</div>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={handleLogout}
                        disabled={isPending}
                        className="text-red-600 cursor-pointer"
                    >
                        {isPending ? 'กำลังออกจากระบบ...' : 'ออกจากระบบ'}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    )
}
