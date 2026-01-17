'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { processPayment } from '../../billing/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

const paymentMethods = [
    { value: 'cash', label: '💵 เงินสด' },
    { value: 'transfer', label: '📱 โอน' },
    { value: 'card', label: '💳 บัตร' },
]

export function PaymentModal({
    prescriptionId,
    prescriptionNo,
    subtotal,
}: {
    prescriptionId: string
    prescriptionNo: string
    subtotal: number
}) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'card'>('cash')
    const [discount, setDiscount] = useState(0)
    const [notes, setNotes] = useState('')
    const [wantReceipt, setWantReceipt] = useState(true)

    const totalAmount = Math.max(0, subtotal - discount)

    async function handlePayment() {
        setIsProcessing(true)
        try {
            const result = await processPayment(prescriptionId, {
                payment_method: paymentMethod,
                discount,
                notes: notes || undefined,
            })

            if (result.error) {
                toast.error(result.error)
                return
            }

            toast.success(`ชำระเงิน ${prescriptionNo} สำเร็จ`)

            // Open receipt if wanted
            if (wantReceipt && result.data?.id) {
                window.open(`/billing/receipt/${result.data.id}`, '_blank')
            }

            handleClose()
        } catch (error) {
            toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
        } finally {
            setIsProcessing(false)
        }
    }

    function handleClose() {
        setOpen(false)
        setDiscount(0)
        setNotes('')
        setWantReceipt(true)
        router.refresh()
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                    💰 ชำระเงิน
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>ชำระเงิน</DialogTitle>
                    <DialogDescription>
                        ใบสั่งยา: {prescriptionNo}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Payment Method */}
                    <div className="space-y-2">
                        <Label>วิธีชำระเงิน</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {paymentMethods.map((method) => (
                                <button
                                    key={method.value}
                                    type="button"
                                    onClick={() => setPaymentMethod(method.value as 'cash' | 'transfer' | 'card')}
                                    className={`p-3 rounded-lg border text-sm font-medium transition-colors ${paymentMethod === method.value
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    {method.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Discount */}
                    <div className="space-y-2">
                        <Label htmlFor="discount">ส่วนลด (บาท)</Label>
                        <Input
                            id="discount"
                            type="number"
                            min="0"
                            max={subtotal}
                            value={discount}
                            onChange={(e) => setDiscount(Math.min(subtotal, Number(e.target.value)))}
                            disabled={isProcessing}
                        />
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">หมายเหตุ / เลขอ้างอิง</Label>
                        <Input
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="เช่น REF: 1234567890"
                            disabled={isProcessing}
                        />
                    </div>

                    {/* Want Receipt Checkbox */}
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="wantReceipt"
                            checked={wantReceipt}
                            onCheckedChange={(checked) => setWantReceipt(checked === true)}
                        />
                        <Label htmlFor="wantReceipt" className="font-normal cursor-pointer">
                            🧾 ต้องการใบเสร็จ
                        </Label>
                    </div>

                    {/* Summary */}
                    <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">ยอดรวม</span>
                            <span>฿{subtotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between text-sm text-red-600">
                                <span>ส่วนลด</span>
                                <span>-฿{discount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-lg font-bold">
                            <span>รับชำระ</span>
                            <span className="text-primary">
                                ฿{totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isProcessing}>
                        ยกเลิก
                    </Button>
                    <Button onClick={handlePayment} disabled={isProcessing} className="bg-green-600 hover:bg-green-700">
                        {isProcessing ? 'กำลังดำเนินการ...' : 'ยืนยันชำระเงิน'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
