import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FrontdeskContent } from './frontdesk-content'

export const dynamic = 'force-dynamic'

export default async function FrontdeskPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">🏥 หน้าบ้าน</h1>
            <Suspense fallback={<div>กำลังโหลด...</div>}>
                <FrontdeskContent />
            </Suspense>
        </div>
    )
}
