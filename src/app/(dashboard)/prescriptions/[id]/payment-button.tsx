'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PaymentModal } from '@/components/payment/payment-modal'

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
    } | null
    items?: PrescriptionItem[]
}

export function PaymentButton({ prescription }: { prescription: Prescription }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <Button
                onClick={() => setIsOpen(true)}
                className="bg-green-600 hover:bg-green-700"
            >
                💳 ชำระเงิน
            </Button>
            <PaymentModal
                open={isOpen}
                onOpenChange={setIsOpen}
                prescription={prescription}
            />
        </>
    )
}
