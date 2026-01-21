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

// Instruction language type
export type InstructionLanguage = 'thai' | 'english'

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
    dosage_instruction: string | null    // วิธีใช้ยา (TH สำหรับฉลาก)
    dosage_instruction_en: string | null // วิธีใช้ยา (EN สำหรับ foreign patients)
    dosage_raw: string | null            // Sprint 3A: ภาษาหมอ (เช่น 1 gtt OU qid)
    instruction_language: InstructionLanguage  // Sprint 3A: ภาษาที่ใช้พิมพ์ฉลาก
    df: number                            // Sprint 3A: Doctor's Fee
    df_note: string | null                // Sprint 3A: หมายเหตุ DF
    note: string | null
    created_at: string
    medicine?: {
        id: string
        code: string
        name: string
        name_en: string | null            // Sprint 3A: ชื่อยา EN
        unit: string
        stock_qty: number
    }
}

// Form data for prescription item
export type PrescriptionItemFormData = {
    medicine_id: string
    quantity: number
    dosage_instruction?: string       // วิธีใช้ยา (TH)
    dosage_instruction_en?: string    // วิธีใช้ยา (EN) - Sprint 3A+
    instruction_language?: 'thai' | 'english'  // ภาษาพิมพ์ฉลาก
    note?: string
}

// Schema for prescription creation
export const prescriptionItemSchema = z.object({
    medicine_id: z.string().min(1, 'กรุณาเลือกยา'),
    quantity: z.coerce.number().int().min(1, 'จำนวนต้องมากกว่า 0'),
    dosage_instruction: z.string().optional(),       // วิธีใช้ยา (TH)
    dosage_instruction_en: z.string().optional(),    // วิธีใช้ยา (EN)
    instruction_language: z.enum(['thai', 'english']).optional(),  // ภาษาฉลาก
    note: z.string().optional(),
})

export const prescriptionFormSchema = z.object({
    patient_id: z.string().min(1, 'กรุณาเลือกผู้ป่วย'),
    note: z.string().optional(),
    items: z.array(prescriptionItemSchema).min(1, 'กรุณาเพิ่มรายการยาอย่างน้อย 1 รายการ'),
})

export type PrescriptionFormValues = z.infer<typeof prescriptionFormSchema>
