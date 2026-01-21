'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PatientForm } from '@/components/forms/patient-form'
import { createPatient } from '../actions'
import { PatientFormValues } from '@/types/patients'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function NewPatientPage() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    async function handleSubmit(data: PatientFormValues) {
        setIsSubmitting(true)
        try {
            const result = await createPatient(data)

            if (result.error) {
                toast.error(result.error)
                return
            }

            toast.success(`ลงทะเบียนผู้ป่วย ${result.data?.hn} สำเร็จ`)
            router.push('/patients')
        } catch {
            toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/patients">
                    <Button variant="ghost" size="sm">
                        ← ย้อนกลับ
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">เพิ่มผู้ป่วยใหม่</h1>
            </div>

            <PatientForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>
    )
}
