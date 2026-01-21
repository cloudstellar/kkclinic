'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PatientForm } from '@/components/forms/patient-form'
import { getPatient, updatePatient } from '../../actions'
import { PatientFormValues, Patient } from '@/types/patients'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function EditPatientPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const router = useRouter()
    const [patient, setPatient] = useState<Patient | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [patientId, setPatientId] = useState<string>('')

    useEffect(() => {
        async function loadPatient() {
            const { id } = await params
            setPatientId(id)
            const { data, error } = await getPatient(id)

            if (error || !data) {
                toast.error('ไม่พบข้อมูลผู้ป่วย')
                router.push('/patients')
                return
            }

            setPatient(data)
            setIsLoading(false)
        }

        loadPatient()
    }, [params, router])

    async function handleSubmit(data: PatientFormValues) {
        setIsSubmitting(true)
        try {
            const result = await updatePatient(patientId, data)

            if (result.error) {
                toast.error(result.error)
                return
            }

            toast.success('บันทึกการแก้ไขสำเร็จ')
            router.push(`/patients/${patientId}`)
        } catch {
            toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <p className="text-muted-foreground">กำลังโหลด...</p>
            </div>
        )
    }

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link href={`/patients/${patientId}`}>
                    <Button variant="ghost" size="sm">
                        ← ย้อนกลับ
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">แก้ไขข้อมูลผู้ป่วย</h1>
                    <p className="text-muted-foreground font-mono">{patient?.hn}</p>
                </div>
            </div>

            {patient && (
                <PatientForm
                    patient={patient}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                />
            )}
        </div>
    )
}
