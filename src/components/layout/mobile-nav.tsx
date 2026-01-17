'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Menu, LogOut } from 'lucide-react'
import { logout } from '@/app/(auth)/actions'

type MenuItem = {
    label: string
    href: string
    icon: string
    roles: string[]
}

type User = {
    full_name: string
    email: string
    role: string
}

const menuItems: MenuItem[] = [
    { label: 'แดชบอร์ด', href: '/dashboard', icon: '🏠', roles: ['admin', 'doctor', 'staff'] },
    { label: 'ผู้ป่วย', href: '/patients', icon: '👤', roles: ['admin', 'doctor', 'staff'] },
    { label: 'ใบสั่งยา', href: '/prescriptions', icon: '📝', roles: ['admin', 'doctor'] },
    { label: 'จ่ายยา', href: '/dispensing', icon: '💊', roles: ['admin', 'staff'] },
    { label: 'คิดเงิน', href: '/billing', icon: '💳', roles: ['admin', 'staff'] },
    { label: 'คลังยา', href: '/inventory', icon: '📦', roles: ['admin', 'staff'] },
    { label: 'ตั้งค่า', href: '/settings', icon: '⚙️', roles: ['admin'] },
]

export function MobileNav({ userRole, user }: { userRole: string; user: User | null }) {
    const pathname = usePathname()
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()

    const visibleItems = menuItems.filter(item => item.roles.includes(userRole))

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
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
            {/* Left side: hamburger + logo */}
            <div className="flex items-center gap-3">
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu className="h-6 w-6" />
                            <span className="sr-only">เปิดเมนู</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64 p-0">
                        <VisuallyHidden.Root>
                            <SheetTitle>เมนูนำทาง</SheetTitle>
                        </VisuallyHidden.Root>
                        <div className="flex flex-col h-full">
                            <div className="p-4 border-b border-gray-200">
                                <div className="flex items-center gap-3">
                                    <Image
                                        src="/kkclinic.svg"
                                        alt="KKClinic Logo"
                                        width={48}
                                        height={48}
                                        className="object-contain"
                                    />
                                    <div>
                                        <h1 className="text-base font-bold text-primary">KKClinic</h1>
                                        <p className="text-xs text-muted-foreground">ระบบบริหารจัดการคลินิก</p>
                                    </div>
                                </div>
                            </div>

                            <nav className="flex-1 p-4">
                                <ul className="space-y-1">
                                    {visibleItems.map((item) => (
                                        <li key={item.href}>
                                            <Link
                                                href={item.href}
                                                onClick={() => setOpen(false)}
                                                className={cn(
                                                    'flex items-center gap-3 px-3 py-3 rounded-md text-sm transition-colors',
                                                    pathname === item.href || pathname.startsWith(item.href + '/')
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'text-gray-700 hover:bg-gray-100'
                                                )}
                                            >
                                                <span>{item.icon}</span>
                                                <span>{item.label}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </nav>

                            {/* User info + logout in drawer */}
                            <div className="p-4 border-t border-gray-200">
                                {user && (
                                    <div className="flex items-center gap-3 mb-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                                                {getInitials(user.full_name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{user.full_name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                            <div className="mt-1">{getRoleBadge(user.role)}</div>
                                        </div>
                                    </div>
                                )}
                                <Button
                                    variant="outline"
                                    className="w-full text-red-600 border-red-200 hover:bg-red-50"
                                    onClick={handleLogout}
                                    disabled={isPending}
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    {isPending ? 'กำลังออกจากระบบ...' : 'ออกจากระบบ'}
                                </Button>
                            </div>

                            <div className="p-4 border-t border-gray-200 text-xs text-muted-foreground">
                                KKClinic MVP v1.0
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>

                <div className="flex items-center gap-2">
                    <Image
                        src="/kkclinic.svg"
                        alt="KKClinic Logo"
                        width={32}
                        height={32}
                        className="object-contain"
                    />
                    <h1 className="text-base font-bold text-primary">KKClinic</h1>
                </div>
            </div>

            {/* Right side: user avatar */}
            {user && (
                <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {getInitials(user.full_name)}
                    </AvatarFallback>
                </Avatar>
            )}
        </div>
    )
}
