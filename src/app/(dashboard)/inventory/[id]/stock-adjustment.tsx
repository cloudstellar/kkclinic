'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateStock } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { QuantityInput } from '@/components/ui/quantity-input'
import { toast } from 'sonner'

export function StockAdjustment({
    medicineId,
    currentStock,
    unit,
}: {
    medicineId: string
    currentStock: number
    unit: string
}) {
    const router = useRouter()
    const [quantity, setQuantity] = useState(1)
    const [notes, setNotes] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Preview ผลลัพธ์หลังปรับ
    const previewAdd = currentStock + quantity
    const previewSubtract = currentStock - quantity
    const willBeNegative = previewSubtract < 0

    async function handleAdjust(type: 'add' | 'subtract') {
        if (quantity <= 0) {
            toast.error('กรุณาระบุจำนวนที่ถูกต้อง')
            return
        }

        const change = type === 'add' ? quantity : -quantity

        if (type === 'subtract' && quantity > currentStock) {
            toast.error('จำนวนสต็อกไม่เพียงพอ')
            return
        }

        setIsSubmitting(true)
        try {
            const result = await updateStock(medicineId, change, notes || undefined)

            if (result.error) {
                toast.error(result.error)
                return
            }

            toast.success(`${type === 'add' ? 'เพิ่ม' : 'ลด'}สต็อก ${quantity} ${unit} สำเร็จ`)
            setQuantity(1)
            setNotes('')
            router.refresh()
        } catch {
            toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-4">
            {/* Current Stock Display */}
            <div className="text-sm text-muted-foreground">
                สต็อกปัจจุบัน: <span className="font-bold text-foreground">{currentStock} {unit}</span>
            </div>

            <div className="flex gap-4 items-start">
                <div className="flex-shrink-0">
                    <label className="text-sm text-muted-foreground block mb-1">
                        จำนวน ({unit})
                    </label>
                    <QuantityInput
                        value={quantity}
                        onChange={setQuantity}
                        min={1}
                        max={9999}
                        autoFocus
                    />
                </div>
                <div className="flex-1">
                    <label className="text-sm text-muted-foreground block mb-1">
                        หมายเหตุ (optional)
                    </label>
                    <Input
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="เช่น รับสินค้าเพิ่ม, ยาหมดอายุ, ปรับยอด"
                        disabled={isSubmitting}
                    />
                </div>
            </div>

            {/* Preview Results */}
            <div className="flex gap-4 text-sm">
                <div className="text-green-600">
                    ถ้าเพิ่ม: {currentStock} → <span className="font-bold">{previewAdd}</span>
                </div>
                <div className={willBeNegative ? "text-red-600" : "text-orange-600"}>
                    ถ้าลด: {currentStock} → <span className="font-bold">{previewSubtract}</span>
                    {willBeNegative && <span className="ml-1">⚠️ ติดลบ</span>}
                </div>
            </div>

            <div className="flex gap-2">
                <Button
                    onClick={() => handleAdjust('add')}
                    disabled={isSubmitting || quantity <= 0}
                    className="bg-green-600 hover:bg-green-700"
                >
                    + เพิ่มสต็อก
                </Button>
                <Button
                    onClick={() => handleAdjust('subtract')}
                    disabled={isSubmitting || quantity <= 0 || willBeNegative}
                    variant="destructive"
                >
                    - ลดสต็อก
                </Button>
            </div>
        </div>
    )
}
