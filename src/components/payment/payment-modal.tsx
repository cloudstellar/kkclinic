'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatCurrency } from '@/lib/utils'
import { processPayment } from '@/app/(dashboard)/billing/actions'
import { toast } from 'sonner'

type PrescriptionItem = {
    id: string
    quantity: number
    unit_price: number
    note: string | null
    medicine?: {
        id: string
        code: string
        name: string
        unit: string
        stock_qty: number
    } | null
}

type Prescription = {
    id: string
    prescription_no: string
    total_price: number
    patient?: {
        id: string
        hn: string
        name: string
    } | null
    items?: PrescriptionItem[]
}

type PaymentModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    prescription: Prescription
}

export function PaymentModal({ open, onOpenChange, prescription }: PaymentModalProps) {
    const router = useRouter()
    const [isProcessing, setIsProcessing] = useState(false)

    // Form state
    const [discountType, setDiscountType] = useState<'thb' | 'percent'>('thb')
    const [discountValue, setDiscountValue] = useState('')
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'card'>('cash')
    const [notes, setNotes] = useState('')

    // Calculations
    const subtotal = prescription.total_price || 0

    const discountAmount = useMemo(() => {
        const value = parseFloat(discountValue) || 0
        if (discountType === 'percent') {
            return Math.round((subtotal * value / 100) * 100) / 100
        }
        return Math.round(value * 100) / 100
    }, [discountValue, discountType, subtotal])

    const netTotal = useMemo(() => {
        return Math.max(0, Math.round((subtotal - discountAmount) * 100) / 100)
    }, [subtotal, discountAmount])

    // Validation
    const discountError = discountAmount > subtotal ? 'ส่วนลดไม่สามารถมากกว่ายอดรวม' : null

    // Stock validation
    const insufficientStock = useMemo(() => {
        if (!prescription.items) return []
        return prescription.items.filter(item =>
            item.medicine && item.quantity > item.medicine.stock_qty
        )
    }, [prescription.items])

    const handleSubmit = async () => {
        if (discountError) {
            toast.error(discountError)
            return
        }

        if (insufficientStock.length > 0) {
            const names = insufficientStock.map(i => i.medicine?.name).join(', ')
            toast.error(`สต็อกไม่เพียงพอ: ${names}`)
            return
        }

        setIsProcessing(true)
        try {
            const result = await processPayment(prescription.id, {
                payment_method: paymentMethod,
                discount: discountAmount,
                notes: notes || undefined,
            })

            if (result.error) {
                toast.error(result.error)
                return
            }

            toast.success('ชำระเงินสำเร็จ')
            onOpenChange(false)

            // Redirect to receipt
            if (result.data?.id) {
                router.push(`/billing/receipt/${result.data.id}`)
            }
        } catch (error) {
            toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        💳 ชำระเงิน
                    </DialogTitle>
                    <DialogDescription>
                        {prescription.prescription_no} • {prescription.patient?.name} ({prescription.patient?.hn})
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Items Preview */}
                    <div className="rounded-lg border p-3 bg-muted/50">
                        <p className="text-sm font-medium mb-2">รายการ:</p>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                            {prescription.items?.map((item) => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        {item.medicine?.name} x{item.quantity}
                                        {item.medicine && item.quantity > item.medicine.stock_qty && (
                                            <span className="text-red-500 ml-1">
                                                (เหลือ {item.medicine.stock_qty})
                                            </span>
                                        )}
                                    </span>
                                    <span>{formatCurrency(item.unit_price * item.quantity)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Subtotal */}
                    <div className="flex justify-between text-lg">
                        <span>ยอดรวม</span>
                        <span className="font-semibold">{formatCurrency(subtotal)}</span>
                    </div>

                    {/* Discount */}
                    <div className="space-y-2">
                        <Label>ส่วนลด</Label>
                        <div className="flex gap-2">
                            <div className="flex rounded-md border overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => setDiscountType('thb')}
                                    className={`px-3 py-2 text-sm transition-colors ${discountType === 'thb'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted hover:bg-muted/80'
                                        }`}
                                >
                                    บาท
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDiscountType('percent')}
                                    className={`px-3 py-2 text-sm transition-colors ${discountType === 'percent'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted hover:bg-muted/80'
                                        }`}
                                >
                                    %
                                </button>
                            </div>
                            <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={discountValue}
                                onChange={(e) => setDiscountValue(e.target.value)}
                                placeholder="0"
                                className="flex-1"
                            />
                        </div>
                        {discountError && (
                            <p className="text-sm text-red-500">{discountError}</p>
                        )}
                        {discountAmount > 0 && !discountError && (
                            <p className="text-sm text-muted-foreground">
                                ส่วนลด: {formatCurrency(discountAmount)}
                            </p>
                        )}
                    </div>

                    {/* Net Total */}
                    <div className="flex justify-between text-xl border-t pt-3">
                        <span className="font-medium">ยอดสุทธิ</span>
                        <span className="font-bold text-primary">{formatCurrency(netTotal)}</span>
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-2">
                        <Label>วิธีชำระเงิน</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { value: 'cash', label: '💵 เงินสด' },
                                { value: 'transfer', label: '📲 โอนเงิน' },
                                { value: 'card', label: '💳 บัตร' },
                            ].map((method) => (
                                <button
                                    key={method.value}
                                    type="button"
                                    onClick={() => setPaymentMethod(method.value as typeof paymentMethod)}
                                    className={`p-3 rounded-lg border text-sm transition-colors ${paymentMethod === method.value
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'hover:border-muted-foreground/50'
                                        }`}
                                >
                                    {method.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label>หมายเหตุ (ถ้ามี)</Label>
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="เช่น เลขที่อ้างอิงการโอน"
                            rows={2}
                        />
                    </div>

                    {/* Stock Warning */}
                    {insufficientStock.length > 0 && (
                        <div className="rounded-lg border border-red-300 bg-red-50 p-3">
                            <p className="text-sm text-red-700 font-medium">
                                ⚠️ สต็อกไม่เพียงพอ:
                            </p>
                            <ul className="text-sm text-red-600 mt-1 list-disc list-inside">
                                {insufficientStock.map(item => (
                                    <li key={item.id}>
                                        {item.medicine?.name}: ต้องการ {item.quantity}, เหลือ {item.medicine?.stock_qty}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isProcessing}
                    >
                        ยกเลิก
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isProcessing || !!discountError || insufficientStock.length > 0}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        {isProcessing ? 'กำลังดำเนินการ...' : '✓ ยืนยันชำระเงิน'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
