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
import { getDisplayName } from '@/lib/patient-utils'
import { formatPatientId } from '@/lib/clinic-config'

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
    // Sprint 3C: Doctor Fee
    df?: number
    df_note?: string | null
    patient?: {
        id: string
        hn: string
        name: string
        name_en?: string | null
        nationality?: string | null
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

    // Sprint 4: Item adjustment state
    // Map of medicine_id => { included: boolean, quantity: number }
    const [itemAdjustments, setItemAdjustments] = useState<Map<string, { included: boolean; quantity: number }>>(new Map())

    // Initialize item adjustments when prescription changes
    const initializeAdjustments = () => {
        const adjustments = new Map<string, { included: boolean; quantity: number }>()
        prescription.items?.forEach(item => {
            if (item.medicine?.id) {
                adjustments.set(item.medicine.id, {
                    included: true,
                    quantity: item.quantity
                })
            }
        })
        setItemAdjustments(adjustments)
    }

    // Initialize on modal open
    if (open && itemAdjustments.size === 0 && prescription.items && prescription.items.length > 0) {
        initializeAdjustments()
    }

    // Calculations - Sprint 4: Use effective items
    const effectiveItems = useMemo(() => {
        if (!prescription.items) return []
        return prescription.items
            .filter(item => {
                const adj = itemAdjustments.get(item.medicine?.id || '')
                return adj?.included && adj.quantity > 0
            })
            .map(item => {
                const adj = itemAdjustments.get(item.medicine?.id || '')
                return {
                    ...item,
                    effectiveQty: adj?.quantity || item.quantity
                }
            })
    }, [prescription.items, itemAdjustments])

    // Subtotal based on effective items (medicines only)
    const medicineSubtotal = useMemo(() => {
        return effectiveItems.reduce((sum, item) => {
            return sum + (item.unit_price * item.effectiveQty)
        }, 0)
    }, [effectiveItems])

    // Total subtotal including doctor fee
    const subtotal = medicineSubtotal + (prescription.df || 0)

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

    // Sprint 4: Stock validation based on effective items (not original)
    const insufficientStock = useMemo(() => {
        return effectiveItems.filter(item =>
            item.medicine && item.effectiveQty > item.medicine.stock_qty
        )
    }, [effectiveItems])

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
            // Generate request_id for idempotency (prevents double-submit)
            const requestId = crypto.randomUUID()

            // Sprint 4: Build effective items array
            const effectiveItemsData = effectiveItems.map(item => ({
                medicine_id: item.medicine!.id,
                quantity: item.effectiveQty,
                unit_price: item.unit_price
            }))

            const result = await processPayment(prescription.id, {
                payment_method: paymentMethod,
                discount: discountAmount,
                notes: notes || undefined,
                request_id: requestId,
                effective_items: effectiveItemsData,  // Sprint 4
            })

            if (result.error) {
                // Check if already paid by another request
                if ('existingReceiptId' in result && result.existingReceiptId) {
                    toast.error(result.error)
                    router.push(`/billing/receipt/${result.existingReceiptId}`)
                    return
                }
                toast.error(result.error)
                return
            }

            toast.success('ชำระเงินสำเร็จ')
            onOpenChange(false)

            // Redirect to receipt
            if (result.data?.id) {
                router.push(`/billing/receipt/${result.data.id}`)
            }
        } catch {
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
                        {prescription.prescription_no} • {prescription.patient ? getDisplayName({
                            name: prescription.patient.name || null,
                            name_en: prescription.patient.name_en || null,
                            nationality: prescription.patient.nationality || 'thai'
                        }) : '-'} ({formatPatientId(prescription.patient?.hn || '')})
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Items Preview - Sprint 4: Adjustable */}
                    <div className="rounded-lg border p-3 bg-muted/50">
                        <p className="text-sm font-medium mb-2">รายการ: <span className="text-xs text-muted-foreground font-normal">(ติ๊กออกหรือปรับจำนวนได้)</span></p>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {/* Sprint 3C: Doctor Fee first - NOT adjustable */}
                            {!!prescription.df && prescription.df > 0 && (
                                <div className="flex justify-between text-sm py-1 border-b">
                                    <span className="text-muted-foreground">
                                        ค่าธรรมเนียมแพทย์
                                        {prescription.df_note && (
                                            <span className="text-xs ml-1">({prescription.df_note})</span>
                                        )}
                                    </span>
                                    <span>{formatCurrency(prescription.df)}</span>
                                </div>
                            )}
                            {prescription.items?.map((item) => {
                                const medicineId = item.medicine?.id || ''
                                const adj = itemAdjustments.get(medicineId)
                                const isIncluded = adj?.included ?? true
                                const currentQty = adj?.quantity ?? item.quantity
                                const lineTotal = isIncluded ? item.unit_price * currentQty : 0

                                return (
                                    <div key={item.id} className={`flex items-center gap-2 text-sm py-1 ${!isIncluded ? 'opacity-50' : ''}`}>
                                        {/* Checkbox */}
                                        <input
                                            type="checkbox"
                                            checked={isIncluded}
                                            onChange={(e) => {
                                                const newAdjustments = new Map(itemAdjustments)
                                                newAdjustments.set(medicineId, {
                                                    included: e.target.checked,
                                                    quantity: e.target.checked ? (adj?.quantity || item.quantity) : 0
                                                })
                                                setItemAdjustments(newAdjustments)
                                            }}
                                            className="w-4 h-4 rounded border-gray-300"
                                        />

                                        {/* Medicine name */}
                                        <span className="flex-1 text-muted-foreground truncate">
                                            {item.medicine?.name}
                                            {item.medicine && currentQty > item.medicine.stock_qty && (
                                                <span className="text-red-500 ml-1">
                                                    (เหลือ {item.medicine.stock_qty})
                                                </span>
                                            )}
                                        </span>

                                        {/* Qty input */}
                                        <input
                                            type="number"
                                            min="0"
                                            max={item.quantity}
                                            value={currentQty}
                                            disabled={!isIncluded}
                                            onChange={(e) => {
                                                const newQty = Math.min(item.quantity, Math.max(0, parseInt(e.target.value) || 0))
                                                const newAdjustments = new Map(itemAdjustments)
                                                newAdjustments.set(medicineId, {
                                                    included: newQty > 0,
                                                    quantity: newQty
                                                })
                                                setItemAdjustments(newAdjustments)
                                            }}
                                            className="w-14 px-2 py-0.5 text-center border rounded text-sm"
                                        />

                                        {/* Unit */}
                                        <span className="text-xs text-muted-foreground w-12">
                                            {item.medicine?.unit || 'หน่วย'}
                                        </span>

                                        {/* Line total */}
                                        <span className={`w-20 text-right ${!isIncluded ? 'line-through' : ''}`}>
                                            {formatCurrency(lineTotal)}
                                        </span>
                                    </div>
                                )
                            })}
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
