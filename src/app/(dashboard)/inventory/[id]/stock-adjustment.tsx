'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateStock } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
    const [quantity, setQuantity] = useState('')
    const [notes, setNotes] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    async function handleAdjust(type: 'add' | 'subtract') {
        const qty = parseInt(quantity, 10)
        if (isNaN(qty) || qty <= 0) {
            toast.error('กรุณาระบุจำนวนที่ถูกต้อง')
            return
        }

        const change = type === 'add' ? qty : -qty

        if (type === 'subtract' && qty > currentStock) {
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

            toast.success(`${type === 'add' ? 'เพิ่ม' : 'ลด'}สต็อก ${qty} ${unit} สำเร็จ`)
            setQuantity('')
            setNotes('')
            router.refresh()
        } catch (error) {
            toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex gap-4 items-end">
                <div className="flex-1 max-w-[200px]">
                    <label className="text-sm text-muted-foreground block mb-1">
                        จำนวน ({unit})
                    </label>
                    <Input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="0"
                        disabled={isSubmitting}
                    />
                </div>
                <div className="flex-1">
                    <label className="text-sm text-muted-foreground block mb-1">
                        หมายเหตุ (optional)
                    </label>
                    <Input
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="เช่น รับสินค้าเพิ่ม, ปรับยอด"
                        disabled={isSubmitting}
                    />
                </div>
            </div>
            <div className="flex gap-2">
                <Button
                    onClick={() => handleAdjust('add')}
                    disabled={isSubmitting || !quantity}
                    className="bg-green-600 hover:bg-green-700"
                >
                    + เพิ่มสต็อก
                </Button>
                <Button
                    onClick={() => handleAdjust('subtract')}
                    disabled={isSubmitting || !quantity}
                    variant="destructive"
                >
                    - ลดสต็อก
                </Button>
            </div>
        </div>
    )
}
