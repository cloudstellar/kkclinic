import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Get user profile
    const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'admin': return 'ผู้ดูแลระบบ'
            case 'doctor': return 'แพทย์'
            case 'staff': return 'พนักงาน'
            default: return role
        }
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">แดชบอร์ด</h1>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-lg font-semibold mb-2">ยินดีต้อนรับ</h2>
                <p className="text-muted-foreground">
                    สวัสดี, <strong>{profile?.full_name || user.email}</strong>
                </p>
                <p className="text-sm text-muted-foreground">
                    Role: <span className="font-medium">{getRoleLabel(profile?.role || '')}</span>
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="font-semibold text-lg">👤 ผู้ป่วย</h3>
                    <p className="text-3xl font-bold mt-2">-</p>
                    <p className="text-sm text-muted-foreground">รายทั้งหมด</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="font-semibold text-lg">💊 ใบสั่งยา</h3>
                    <p className="text-3xl font-bold mt-2">-</p>
                    <p className="text-sm text-muted-foreground">รอจ่ายยา</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="font-semibold text-lg">📦 รายการยา</h3>
                    <p className="text-3xl font-bold mt-2">10</p>
                    <p className="text-sm text-muted-foreground">รายการในระบบ</p>
                </div>
            </div>
        </div>
    )
}
