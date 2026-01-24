'use client'

import { useState } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createAdjustment, AdjustmentItem } from '@/app/(dashboard)/billing/actions'
import { toast } from 'sonner'

// Format currency helper
function formatCurrency(amount: number): string {
    return `฿${amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`
}

type TransactionItem = {
    id?: string
    medicine_id?: string
    quantity: number
    unit_price: number
    medicine?: {
        id: string
        name: string
        unit?: string
    }
}

type AdjustmentModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    transactionId: string
    receiptNo: string
    items: TransactionItem[]
    currentTotal: number
}

// Local state for each item adjustment
type ItemAdjustment = {
    included: boolean
    newQty: number
    originalQty: number
}

export function AdjustmentModal({
    open,
    onOpenChange,
    transactionId,
    receiptNo,
    items,
    currentTotal,
}: AdjustmentModalProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [note, setNote] = useState('')

    // Initialize adjustments map from items
    const [adjustments, setAdjustments] = useState<Map<string, ItemAdjustment>>(() => {
        const map = new Map<string, ItemAdjustment>()
        items.forEach(item => {
            const medicineId = item.medicine?.id || item.medicine_id || ''
            if (medicineId) {
                map.set(medicineId, {
                    included: true,
                    newQty: item.quantity,
                    originalQty: item.quantity,
                })
            }
        })
        return map
    })

    // Calculate preview totals
    const previewItems = items.map(item => {
        const medicineId = item.medicine?.id || item.medicine_id || ''
        const adj = adjustments.get(medicineId)
        const newQty = adj?.included ? (adj?.newQty ?? item.quantity) : 0
        return {
            ...item,
            medicineId,
            originalQty: item.quantity,
            newQty,
            originalAmount: item.quantity * item.unit_price,
            newAmount: newQty * item.unit_price,
        }
    })

    const previewTotal = previewItems.reduce((sum, item) => sum + item.newAmount, 0)
    const delta = previewTotal - currentTotal
    const hasChanges = delta !== 0

    // Handle qty change
    const handleQtyChange = (medicineId: string, newQty: number, originalQty: number) => {
        const clamped = Math.min(originalQty, Math.max(0, newQty))
        setAdjustments(prev => {
            const newMap = new Map(prev)
            newMap.set(medicineId, {
                included: clamped > 0,
                newQty: clamped,
                originalQty,
            })
            return newMap
        })
    }

    // Handle checkbox toggle
    const handleToggle = (medicineId: string, included: boolean, originalQty: number) => {
        setAdjustments(prev => {
            const newMap = new Map(prev)
            newMap.set(medicineId, {
                included,
                newQty: included ? originalQty : 0,
                originalQty,
            })
            return newMap
        })
    }

    // Handle save
    const handleSave = async () => {
        if (!hasChanges) {
            toast.error('ไม่มีการเปลี่ยนแปลง')
            return
        }

        setIsSubmitting(true)
        try {
            // Build payload
            const adjustmentItems: AdjustmentItem[] = previewItems
                .filter(item => item.newQty !== item.originalQty)
                .map(item => ({
                    medicine_id: item.medicineId,
                    new_qty: item.newQty,
                }))

            const result = await createAdjustment({
                transactionId,
                items: adjustmentItems,
                note: note || undefined,
            })

            if (result.error) {
                toast.error(result.error)
                return
            }

            toast.success('ปรับปรุงรายการสำเร็จ')
            onOpenChange(false)
            router.refresh()
        } catch {
            toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>🔧 ปรับปรุงรายการ</DialogTitle>
                    <DialogDescription>
                        {receiptNo} — ลดจำนวนหรือติ๊กออกได้เท่านั้น (ไม่สามารถเพิ่มได้)
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Items List */}
                    <div className="rounded-lg border p-3 bg-muted/50">
                        <p className="text-sm font-medium mb-2">รายการยา</p>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {previewItems.map(item => {
                                const adj = adjustments.get(item.medicineId)
                                const isIncluded = adj?.included ?? true

                                return (
                                    <div
                                        key={item.medicineId}
                                        className={`flex items-center gap-2 text-sm py-1 ${!isIncluded ? 'opacity-50' : ''}`}
                                    >
                                        {/* Checkbox */}
                                        <input
                                            type="checkbox"
                                            checked={isIncluded}
                                            onChange={(e) => handleToggle(item.medicineId, e.target.checked, item.originalQty)}
                                            className="w-4 h-4 rounded border-gray-300"
                                        />

                                        {/* Medicine name */}
                                        <span className="flex-1 text-muted-foreground truncate">
                                            {item.medicine?.name || 'Unknown'}
                                        </span>

                                        {/* Qty input */}
                                        <Input
                                            type="number"
                                            min={0}
                                            max={item.originalQty}
                                            value={item.newQty}
                                            disabled={!isIncluded}
                                            onChange={(e) => handleQtyChange(
                                                item.medicineId,
                                                parseInt(e.target.value) || 0,
                                                item.originalQty
                                            )}
                                            className="w-16 h-7 text-center text-sm"
                                        />

                                        {/* Unit */}
                                        <span className="text-xs text-muted-foreground w-12">
                                            {item.medicine?.unit || 'ชิ้น'}
                                        </span>

                                        {/* Line total */}
                                        <span className={`w-20 text-right ${item.newAmount !== item.originalAmount ? 'text-red-600' : ''}`}>
                                            {formatCurrency(item.newAmount)}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Totals Preview */}
                    <div className="rounded-lg border p-3 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">ยอดเดิม</span>
                            <span>{formatCurrency(currentTotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">ยอดใหม่ (preview)</span>
                            <span className={hasChanges ? 'text-primary font-medium' : ''}>
                                {formatCurrency(previewTotal)}
                            </span>
                        </div>
                        {hasChanges && (
                            <div className="flex justify-between text-sm border-t pt-2">
                                <span className="text-muted-foreground">ส่วนต่าง</span>
                                <span className="text-red-600 font-medium">
                                    {formatCurrency(delta)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Note */}
                    <div className="space-y-1">
                        <Label htmlFor="adj-note">หมายเหตุ (ถ้ามี)</Label>
                        <Textarea
                            id="adj-note"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="เหตุผลในการปรับปรุง เช่น ผู้ป่วยขอคืนยา, ใส่รายการผิด"
                            rows={2}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                    >
                        ยกเลิก
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSubmitting || !hasChanges}
                        className="bg-orange-600 hover:bg-orange-700"
                    >
                        {isSubmitting ? 'กำลังบันทึก...' : '✓ บันทึกการปรับปรุง'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
