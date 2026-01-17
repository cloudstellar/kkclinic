'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

type MenuItem = {
    label: string
    href: string
    icon: string
    roles: string[]
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

export function Sidebar({ userRole }: { userRole: string }) {
    const pathname = usePathname()

    const visibleItems = menuItems.filter(item => item.roles.includes(userRole))

    return (
        <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col">{/* Hidden on mobile, visible on md+ */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <Image
                        src="/kkclinic.svg"
                        alt="KKClinic Logo"
                        width={64}
                        height={64}
                        className="object-contain"
                    />
                    <div>
                        <h1 className="text-lg font-bold text-primary">KKClinic</h1>
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
                                className={cn(
                                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
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

            <div className="p-4 border-t border-gray-200 text-xs text-muted-foreground">
                KKClinic MVP v1.0
            </div>
        </aside>
    )
}
