'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MedicineForm } from '@/components/forms/medicine-form'
import { createMedicine } from '../actions'
import { MedicineFormValues } from '@/types/medicines'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function NewMedicinePage() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    async function handleSubmit(data: MedicineFormValues) {
        setIsSubmitting(true)
        try {
            const result = await createMedicine(data)

            if (result.error) {
                toast.error(result.error)
                return
            }

            toast.success(`เพิ่มรายการยา ${data.code} สำเร็จ`)
            router.push('/inventory')
        } catch (error) {
            toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/inventory">
                    <Button variant="ghost" size="sm">
                        ← ย้อนกลับ
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">เพิ่มรายการยาใหม่</h1>
            </div>

            <MedicineForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>
    )
}
