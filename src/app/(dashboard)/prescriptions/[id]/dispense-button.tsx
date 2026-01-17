'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updatePrescriptionStatus } from '../actions'
import { Button } from '@/components/ui/button'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

export function DispenseButton({
    prescriptionId,
    prescriptionNo,
}: {
    prescriptionId: string
    prescriptionNo: string
}) {
    const router = useRouter()
    const [isDispensing, setIsDispensing] = useState(false)

    async function handleDispense() {
        setIsDispensing(true)
        try {
            const result = await updatePrescriptionStatus(prescriptionId, 'dispensed')

            if (result.error) {
                toast.error(result.error)
                return
            }

            toast.success(`จ่ายยาใบสั่งยา ${prescriptionNo} สำเร็จ`)
            router.refresh()
        } catch (error) {
            toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
        } finally {
            setIsDispensing(false)
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                    ✓ จ่ายยา
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>ยืนยันการจ่ายยา?</AlertDialogTitle>
                    <AlertDialogDescription>
                        คุณต้องการจ่ายยาตามใบสั่งยา <strong>{prescriptionNo}</strong> ใช่หรือไม่?
                        <br /><br />
                        ⚠️ หลังจากจ่ายยาแล้ว:
                        <ul className="list-disc ml-4 mt-2">
                            <li>สถานะจะเปลี่ยนเป็น "จ่ายแล้ว"</li>
                            <li>สต็อกยาจะถูกหักตามจำนวนอัตโนมัติ</li>
                        </ul>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDispensing}>ยกเลิก</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDispense}
                        disabled={isDispensing}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        {isDispensing ? 'กำลังดำเนินการ...' : 'ยืนยันจ่ายยา'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
