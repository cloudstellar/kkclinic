import { Suspense } from 'react'
import { DispensingContent } from './dispensing-content'

export const dynamic = 'force-dynamic'

export default function DispensingPage() {
    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">💊 จ่ายยา</h1>
            <Suspense fallback={<div>กำลังโหลด...</div>}>
                <DispensingContent />
            </Suspense>

            <p className="text-sm text-muted-foreground mt-4">
                💡 คลิกที่รายการเพื่อดูรายละเอียดและทำการจัดการ
            </p>
        </div>
    )
}
