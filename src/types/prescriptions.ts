import { z } from 'zod'

// Prescription status
export type PrescriptionStatus = 'pending' | 'dispensed' | 'cancelled'

// Prescription type matching database schema
export type Prescription = {
    id: string
    prescription_no: string
    patient_id: string
    doctor_id: string
    status: PrescriptionStatus
    note: string | null
    total_price: number | null
    cancelled_reason: string | null
    completed_at: string | null
    created_at: string
    updated_at: string
}

// Prescription with related data
export type PrescriptionWithRelations = Prescription & {
    patient?: {
        id: string
        hn: string
        name: string
        drug_allergies: string | null
    }
    doctor?: {
        id: string
        full_name: string
    }
    items?: PrescriptionItem[]
}

// Dosage language type (Sprint 3B)
export type DosageLanguage = 'th' | 'en'

// Dictionary version type (Sprint 3B)
export type DictionaryVersion = 'legacy' | '1.0'

// Prescription item type
export type PrescriptionItem = {
    id: string
    prescription_id: string
    item_type: 'medicine' | 'procedure'
    medicine_id: string | null
    procedure_name: string | null
    quantity: number
    unit_price: number
    price_override: number | null
    // Sprint 3B: Smart Dosage fields (Option A: Single Snapshot)
    dosage_original: string | null       // Raw shorthand from doctor (Source of Truth)
    dosage_instruction: string | null    // Snapshot in patient language (TH or EN based on dosage_language)
    dosage_language: DosageLanguage | null // Language of snapshot: 'th' or 'en'
    dictionary_version: DictionaryVersion | null // NULL=no instruction, 'legacy', '1.0'
    df: number                            // Doctor's Fee
    df_note: string | null                // หมายเหตุ DF
    note: string | null
    created_at: string
    medicine?: {
        id: string
        code: string
        name: string
        name_en: string | null            // ชื่อยา EN
        unit: string
        stock_qty: number
    }
}

// Form data for prescription item (Sprint 3B - Option A: Single Snapshot)
export type PrescriptionItemFormData = {
    medicine_id: string
    quantity: number
    dosage_original?: string          // Raw shorthand from doctor
    dosage_instruction?: string       // Snapshot (auto-generated or doctor override)
    dosage_language?: 'th' | 'en'     // Language for label printing
    note?: string
}

// Schema for prescription creation (Sprint 3B - Option A: Single Snapshot)
export const prescriptionItemSchema = z.object({
    medicine_id: z.string().min(1, 'กรุณาเลือกยา'),
    quantity: z.coerce.number().int().min(1, 'จำนวนต้องมากกว่า 0'),
    dosage_original: z.string().optional(),           // Raw shorthand
    dosage_instruction: z.string().optional(),        // Snapshot (TH or EN)
    dosage_language: z.enum(['th', 'en']).optional(), // Label language
    note: z.string().optional(),
})

export const prescriptionFormSchema = z.object({
    patient_id: z.string().min(1, 'กรุณาเลือกผู้ป่วย'),
    note: z.string().optional(),
    items: z.array(prescriptionItemSchema).min(1, 'กรุณาเพิ่มรายการยาอย่างน้อย 1 รายการ'),
})

export type PrescriptionFormValues = z.infer<typeof prescriptionFormSchema>
