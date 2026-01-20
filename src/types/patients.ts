import { z } from 'zod'
import { normalizeBirthDate, isFutureBirthDate } from '@/lib/date-utils'

// Nationality type
export type Nationality = 'thai' | 'other'

// Patient type matching database schema
export type Patient = {
    id: string
    hn: string
    name: string
    name_en: string | null
    birth_date: string | null
    gender: 'male' | 'female' | 'other' | null
    phone: string
    address: string | null
    postal_code: string | null
    nationality: Nationality
    emergency_contact_name: string | null
    emergency_contact_relationship: string | null
    emergency_contact_phone: string | null
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
    hn: string
    name: string
    name_en?: string
    birth_date?: string
    gender?: 'male' | 'female' | 'other'
    phone: string
    address?: string
    postal_code?: string
    nationality: Nationality
    emergency_contact_name?: string
    emergency_contact_relationship?: string
    emergency_contact_phone?: string
    notes?: string
    id_card?: string
    drug_allergies?: string
    underlying_conditions?: string
}

// TN validation regex: TN + 6 digits
const TN_REGEX = /^TN[0-9]{6}$/

// Helper to normalize TN input
export function normalizeTN(input: string): string {
    const upper = input.toUpperCase().trim()
    if (upper.startsWith('TN')) {
        return upper
    }
    return `TN${upper}`
}

// Zod validation schema for patient form
export const patientFormSchema = z.object({
    hn: z.string()
        .min(1, 'กรุณากรอกรหัส TN')
        .transform(normalizeTN)
        .refine((val) => TN_REGEX.test(val), {
            message: 'รหัส TN ต้องเป็น TN ตามด้วยตัวเลข 6 หลัก (เช่น TN250429)'
        }),
    name: z.string().optional(),        // Optional in base, validated per nationality
    name_en: z.string().optional(),     // Optional in base, validated per nationality
    birth_date: z.string().optional().transform(val => val ? normalizeBirthDate(val) : val),
    gender: z.enum(['male', 'female', 'other']).optional(),
    phone: z.string().min(9, 'เบอร์โทรไม่ถูกต้อง').max(15, 'เบอร์โทรไม่ถูกต้อง'),
    address: z.string().optional(),     // Single field, not required
    postal_code: z.string().max(5, 'รหัสไปรษณีย์ต้องไม่เกิน 5 หลัก').optional().or(z.literal('')),
    nationality: z.enum(['thai', 'other']).default('thai'),
    emergency_contact_name: z.string().optional(),
    emergency_contact_relationship: z.string().optional(),
    emergency_contact_phone: z.string().optional(),
    notes: z.string().optional(),
    id_card: z.string().max(20).optional().or(z.literal('')),
    drug_allergies: z.string().optional(),
    underlying_conditions: z.string().optional(),
}).superRefine((data, ctx) => {
    // Nationality-based validation (Bug Fix: only validate the relevant field)
    if (data.nationality === 'thai') {
        // Thai nationality: require name (Thai)
        if (!data.name || data.name.trim().length < 2) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'กรุณากรอกชื่อ-นามสกุล',
                path: ['name']
            })
        }
    } else if (data.nationality === 'other') {
        // Foreign nationality: require name_en ONLY, name is optional
        if (!data.name_en || data.name_en.trim().length < 2) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Please enter name in English',
                path: ['name_en']
            })
        }
    }

    // ID card validation - only for Thai (must be exactly 13 digits)
    if (data.nationality === 'thai' && data.id_card && data.id_card.length > 0 && data.id_card.length !== 13) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'เลขบัตรประชาชนต้องมี 13 หลัก',
            path: ['id_card']
        })
    }

    // Birth date validation - no future dates
    if (data.birth_date && isFutureBirthDate(data.birth_date)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'วันเกิดอยู่ในอนาคต กรุณาตรวจสอบ พ.ศ./ค.ศ.',
            path: ['birth_date']
        })
    }
})

export type PatientFormValues = z.infer<typeof patientFormSchema>
