'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { voidTransaction } from '@/app/(dashboard)/billing/actions'
import { toast } from 'sonner'

type VoidTransactionDialogProps = {
    transactionId: string
    receiptNo: string
}

export function VoidTransactionDialog({ transactionId, receiptNo }: VoidTransactionDialogProps) {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [isVoiding, setIsVoiding] = useState(false)
    const [reason, setReason] = useState('')

    const handleVoid = async () => {
        if (!reason.trim()) {
            toast.error('กรุณาระบุเหตุผลในการยกเลิก')
            return
        }

        setIsVoiding(true)
        try {
            const result = await voidTransaction(transactionId, reason.trim())

            if (result.error) {
                toast.error(result.error)
                return
            }

            if (result.alreadyVoided) {
                toast.info('บิลนี้ถูกยกเลิกไปแล้ว')
            } else {
                toast.success('ยกเลิกบิลสำเร็จ')
            }

            setIsOpen(false)
            router.push('/billing')
            router.refresh()
        } catch (error) {
            toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่')
        } finally {
            setIsVoiding(false)
        }
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                    ⚠️ ยกเลิกบิล
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-600">
                        ⚠️ ยืนยันการยกเลิกบิล
                    </AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="space-y-3">
                            <p>
                                คุณกำลังจะยกเลิกบิล <strong className="text-foreground">{receiptNo}</strong>
                            </p>
                            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-amber-800 text-sm">
                                <p className="font-medium">📋 หมายเหตุ:</p>
                                <ul className="list-disc list-inside mt-1 space-y-1">
                                    <li>การยกเลิกบิลจะไม่คืนสต๊อกยา (เนื่องจากยาถูกจ่ายไปแล้ว)</li>
                                    <li>หากต้องการออกบิลใหม่ สามารถทำได้หลังยกเลิก</li>
                                    <li>ประวัติการยกเลิกจะถูกบันทึกไว้ในระบบ</li>
                                </ul>
                            </div>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="py-4">
                    <Label htmlFor="void-reason" className="text-red-600">
                        เหตุผลในการยกเลิก <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                        id="void-reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="เช่น คีย์ผิด, ลูกค้าเปลี่ยนใจ..."
                        className="mt-2"
                        rows={3}
                    />
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isVoiding}>
                        ยกเลิก
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault()
                            handleVoid()
                        }}
                        disabled={isVoiding || !reason.trim()}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {isVoiding ? 'กำลังดำเนินการ...' : '❌ ยืนยันยกเลิกบิล'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
