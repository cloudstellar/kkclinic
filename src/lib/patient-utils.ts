import { Nationality } from '@/types/patients'

type PatientNameInfo = {
    name: string | null
    name_en: string | null
    nationality: Nationality | string
}

/**
 * Get the display name for a patient based on nationality
 * - Thai: use name (Thai)
 * - Other: use name_en (English) - NO cross-language fallback per policy
 */
export function getDisplayName(patient: PatientNameInfo): string {
    // Normalize nationality (default to thai if unknown)
    const nat = patient.nationality === 'other' ? 'other' : 'thai'

    if (nat === 'other') {
        return patient.name_en || ''
    }
    return patient.name || ''
}

/**
 * Check if patient has a valid display name (at least 2 characters)
 */
export function hasValidName(patient: PatientNameInfo): boolean {
    return getDisplayName(patient).trim().length >= 2
}
