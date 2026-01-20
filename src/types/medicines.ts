import { z } from 'zod'

// Medicine type matching database schema
export type Medicine = {
    id: string
    code: string
    name: string
    name_en: string | null        // Sprint 3A
    unit: string
    price: number
    stock_qty: number
    min_stock: number
    description: string | null
    description_en: string | null  // Sprint 3A
    is_active: boolean
    is_demo: boolean
    created_at: string
    updated_at: string
}

// Form data for creating/updating medicine
export type MedicineFormData = {
    code: string
    name: string
    name_en?: string
    unit: string
    price: number
    stock_qty?: number
    min_stock?: number
    description?: string
    description_en?: string
}

// Zod validation schema for medicine form
export const medicineFormSchema = z.object({
    code: z.string().min(1, 'กรุณาระบุรหัสยา'),
    name: z.string().min(2, 'ชื่อยาต้องมีอย่างน้อย 2 ตัวอักษร'),
    name_en: z.string().optional(),
    unit: z.string().min(1, 'กรุณาระบุหน่วย'),
    price: z.preprocess((val) => Number(val), z.number().min(0, 'ราคาต้องไม่ติดลบ')),
    stock_qty: z.preprocess((val) => val ? Number(val) : undefined, z.number().int().min(0, 'จำนวนต้องไม่ติดลบ').optional()),
    min_stock: z.preprocess((val) => val ? Number(val) : undefined, z.number().int().min(0, 'จำนวนต้องไม่ติดลบ').optional()),
    description: z.string().optional(),
    description_en: z.string().optional(),
})

export type MedicineFormValues = z.infer<typeof medicineFormSchema>


