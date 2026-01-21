/**
 * Label Translations for Bilingual Printing
 * Sprint 3A+: Centralized translation constants
 */

export const LABEL_TRANSLATIONS = {
    th: {
        patientName: 'ชื่อ',
        medicineName: 'ชื่อยา',
        directions: 'วิธีใช้',
        indication: 'สรรพคุณ',
        expiry: 'วันหมดอายุ',
        quantity: 'จำนวน',
        date: 'วันที่',
        total: 'รวม',
        items: 'รายการ',
        clinicName: 'คลินิกตาใสใส',
    },
    en: {
        patientName: 'Name',
        medicineName: 'Medicine',
        directions: 'Directions',
        indication: 'Indication',
        expiry: 'Expiry',
        quantity: 'Qty',
        date: 'Date',
        total: 'Total',
        items: 'items',
        clinicName: 'Taisaisai Eye Clinic',
    },
} as const

export type LabelLanguage = 'th' | 'en'

/**
 * Get label language based on patient nationality
 * null/undefined → 'th' (default Thai)
 */
export function getLabelLang(nationality: string | null | undefined): LabelLanguage {
    return nationality === 'other' ? 'en' : 'th'
}

/**
 * Default expiry note constants
 * Used for fallback when medicine.expiry_note is null/undefined
 * SINGLE SOURCE OF TRUTH - prevents drift
 */
export const DEFAULT_EXPIRY_NOTE = {
    th: 'ดูวันหมดอายุที่ฉลากข้างกล่อง',
    en: 'See expiry date on the box',
} as const
