import { z } from 'zod'

// Patient type matching database schema
export type Patient = {
    id: string
    hn: string
    name: string
    birth_date: string | null
    gender: 'male' | 'female' | 'other' | null
    phone: string
    address: string | null
    notes: string | null
    id_card: string | null
    drug_allergies: string | null
    underlying_conditions: string | null
    is_demo: boolean
    created_at: string
    updated_at: string
    created_by: string | null
}

// Form data for creating/updating patient
export type PatientFormData = {
    name: string
    birth_date?: string
    gender?: 'male' | 'female' | 'other'
    phone: string
    address?: string
    notes?: string
    id_card?: string
    drug_allergies?: string
    underlying_conditions?: string
}

// Zod validation schema for patient form
export const patientFormSchema = z.object({
    name: z.string().min(2, 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร'),
    birth_date: z.string().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    phone: z.string().min(9, 'เบอร์โทรไม่ถูกต้อง').max(15, 'เบอร์โทรไม่ถูกต้อง'),
    address: z.string().optional(),
    notes: z.string().optional(),
    id_card: z.string().length(13, 'เลขบัตรประชาชนต้องมี 13 หลัก').optional().or(z.literal('')),
    drug_allergies: z.string().optional(),
    underlying_conditions: z.string().optional(),
})

export type PatientFormValues = z.infer<typeof patientFormSchema>
