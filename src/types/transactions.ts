import { z } from 'zod'

// Transaction type matching database schema
export type Transaction = {
    id: string
    receipt_no: string
    prescription_id: string
    patient_id: string
    staff_id: string
    subtotal: number
    discount: number
    vat_amount: number
    vat_included: boolean
    total_amount: number
    payment_method: 'cash' | 'transfer' | 'card'
    paid_at: string
    notes: string | null
    created_at: string
}

// Transaction with relations
export type TransactionWithRelations = Transaction & {
    patient?: {
        id: string
        hn: string
        name: string
    }
    prescription?: {
        id: string
        prescription_no: string
    }
    staff?: {
        id: string
        full_name: string
    }
}

// Payment form data
export type PaymentFormData = {
    payment_method: 'cash' | 'transfer' | 'card'
    discount: number
    notes?: string
}

// Zod validation schema
export const paymentFormSchema = z.object({
    payment_method: z.enum(['cash', 'transfer', 'card']),
    discount: z.coerce.number().min(0, 'ส่วนลดต้องไม่ติดลบ').default(0),
    notes: z.string().optional(),
})

export type PaymentFormValues = z.infer<typeof paymentFormSchema>
