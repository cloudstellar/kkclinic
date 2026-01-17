'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MedicineForm } from '@/components/forms/medicine-form'
import { getMedicine, updateMedicine } from '../../actions'
import { MedicineFormValues, Medicine } from '@/types/medicines'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function EditMedicinePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const router = useRouter()
    const [medicine, setMedicine] = useState<Medicine | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [medicineId, setMedicineId] = useState<string>('')

    useEffect(() => {
        async function loadMedicine() {
            const { id } = await params
            setMedicineId(id)
            const { data, error } = await getMedicine(id)

            if (error || !data) {
                toast.error('ไม่พบข้อมูลยา')
                router.push('/inventory')
                return
            }

            setMedicine(data)
            setIsLoading(false)
        }

        loadMedicine()
    }, [params, router])

    async function handleSubmit(data: MedicineFormValues) {
        setIsSubmitting(true)
        try {
            const result = await updateMedicine(medicineId, data)

            if (result.error) {
                toast.error(result.error)
                return
            }

            toast.success('บันทึกการแก้ไขสำเร็จ')
            router.push(`/inventory/${medicineId}`)
        } catch (error) {
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
                <Link href={`/inventory/${medicineId}`}>
                    <Button variant="ghost" size="sm">
                        ← ย้อนกลับ
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">แก้ไขข้อมูลยา</h1>
                    <p className="text-muted-foreground font-mono">{medicine?.code}</p>
                </div>
            </div>

            {medicine && (
                <MedicineForm
                    medicine={medicine}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                />
            )}
        </div>
    )
}
