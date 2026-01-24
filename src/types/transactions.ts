import { z } from 'zod'

// Transaction status
export type TransactionStatus = 'paid' | 'voided'

// Transaction type matching database schema
export type Transaction = {
    id: string
    receipt_no: string
    prescription_id: string | null
    patient_id: string
    staff_id: string
    status: TransactionStatus
    subtotal: number
    discount: number
    vat_amount: number
    vat_included: boolean
    total_amount: number
    payment_method: 'cash' | 'transfer' | 'card'
    paid_at: string
    notes: string | null
    // Void fields (Sprint 2A)
    voided_at: string | null
    voided_by: string | null
    void_reason: string | null
    // Idempotency key
    request_id: string | null
    created_at: string
}

// Transaction with relations
export type TransactionWithRelations = Transaction & {
    patient?: {
        id: string
        hn: string
        name: string
        name_en?: string | null
        nationality?: string | null
        phone?: string
    }
    prescription?: {
        id: string
        prescription_no: string
        note?: string
        // Sprint 3C: Doctor Fee
        df?: number
        df_note?: string
        created_at?: string
    }
    staff?: {
        id: string
        full_name: string
    }
    voided_by_user?: {
        id: string
        full_name: string
    }
}

// Effective item for pre-payment adjustment (Sprint 4)
export type EffectiveItem = {
    medicine_id: string
    quantity: number
    unit_price: number
}

// Payment form data
export type PaymentFormData = {
    payment_method: 'cash' | 'transfer' | 'card'
    discount: number
    notes?: string
    request_id: string  // Required for idempotency
    effective_items?: EffectiveItem[]  // Sprint 4: Pre-payment item adjustment
}

// Zod validation schema
export const paymentFormSchema = z.object({
    payment_method: z.enum(['cash', 'transfer', 'card']),
    discount: z.coerce.number().min(0, 'ส่วนลดต้องไม่ติดลบ').default(0),
    notes: z.string().optional(),
    request_id: z.string().uuid(),
})

export type PaymentFormValues = z.infer<typeof paymentFormSchema>
