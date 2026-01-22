/**
 * Sprint 3B: Smart Dosage Dictionary V1.0 (FROZEN)
 *
 * This dictionary is IMMUTABLE once released.
 * Any changes require a version bump (v1.1, v2.0, etc.)
 *
 * Categories:
 * - Form: dosage form (gtt, tab, cap, etc.)
 * - Site: application site (OU, OD, OS)
 * - Frequency: how often (qd, bid, tid, etc.)
 * - Condition: when to take (ac, pc, prn, stat)
 * - Duration: how long (x, d for "x 7 d" patterns)
 */

export const DICT_VERSION = '1.0' as const

// Thai translations
type Translation = {
    th: string
    en: string
}

// Form (dosage form)
export const FORMS: Record<string, Translation> = {
    'gtt': { th: 'หยด', en: 'drop(s)' },
    'tab': { th: 'เม็ด', en: 'tablet(s)' },
    'cap': { th: 'แคปซูล', en: 'capsule(s)' },
    'susp': { th: 'ยาน้ำแขวนตะกอน', en: 'suspension' },
    'syr': { th: 'ยาน้ำเชื่อม', en: 'syrup' },
    'ung': { th: 'ขี้ผึ้ง', en: 'ointment' },
    'gel': { th: 'เจล', en: 'gel' },
    'cream': { th: 'ครีม', en: 'cream' },
}

// Site (application site) - Ophthalmology specific + Routes (PO)
export const SITES: Record<string, Translation> = {
    'ou': { th: 'ตาทั้งสองข้าง', en: 'both eyes' },
    'od': { th: 'ตาขวา', en: 'right eye' },
    'os': { th: 'ตาซ้าย', en: 'left eye' },
    'au': { th: 'หูทั้งสองข้าง', en: 'both ears' },
    'ad': { th: 'หูขวา', en: 'right ear' },
    'as': { th: 'หูซ้าย', en: 'left ear' },
    'po': { th: 'รับประทาน', en: 'take by mouth' },
}

// Frequency
export const FREQUENCIES: Record<string, Translation> = {
    'qd': { th: 'วันละ 1 ครั้ง', en: 'once daily' },
    'od': { th: 'วันละ 1 ครั้ง', en: 'once daily' },  // Alternative for qd
    'bid': { th: 'วันละ 2 ครั้ง', en: 'twice daily' },
    'tid': { th: 'วันละ 3 ครั้ง', en: '3 times daily' },
    'qid': { th: 'วันละ 4 ครั้ง', en: '4 times daily' },
    'q4h': { th: 'ทุก 4 ชั่วโมง', en: 'every 4 hours' },
    'q6h': { th: 'ทุก 6 ชั่วโมง', en: 'every 6 hours' },
    'q8h': { th: 'ทุก 8 ชั่วโมง', en: 'every 8 hours' },
    'q12h': { th: 'ทุก 12 ชั่วโมง', en: 'every 12 hours' },
    'hs': { th: 'ก่อนนอน', en: 'at bedtime' },
    'prn': { th: 'เมื่อมีอาการ', en: 'as needed' },
    'stat': { th: 'ทันที', en: 'immediately' },
}

// Condition (when to take)
export const CONDITIONS: Record<string, Translation> = {
    'ac': { th: 'ก่อนอาหาร', en: 'before meals' },
    'pc': { th: 'หลังอาหาร', en: 'after meals' },
    'cc': { th: 'พร้อมอาหาร', en: 'with meals' },
    'prn': { th: 'เมื่อมีอาการ', en: 'as needed' },
    'stat': { th: 'ทันที', en: 'immediately' },
}

// Duration keywords
export const DURATION_MARKERS: Record<string, Translation> = {
    'x': { th: 'เป็นเวลา', en: 'for' },
    'd': { th: 'วัน', en: 'day(s)' },
    'day': { th: 'วัน', en: 'day(s)' },
    'days': { th: 'วัน', en: 'days' },
    'wk': { th: 'สัปดาห์', en: 'week(s)' },
    'week': { th: 'สัปดาห์', en: 'week(s)' },
    'weeks': { th: 'สัปดาห์', en: 'weeks' },
}

// Combined lookup for quick category detection
export type DosageCategory = 'form' | 'site' | 'frequency' | 'condition' | 'duration'

type DictionaryEntry = {
    category: DosageCategory
    translation: Translation
}

// Build combined dictionary for lookup
const buildDictionary = (): Map<string, DictionaryEntry> => {
    const dict = new Map<string, DictionaryEntry>()

    for (const [key, translation] of Object.entries(FORMS)) {
        dict.set(key, { category: 'form', translation })
    }
    for (const [key, translation] of Object.entries(SITES)) {
        dict.set(key, { category: 'site', translation })
    }
    for (const [key, translation] of Object.entries(FREQUENCIES)) {
        dict.set(key, { category: 'frequency', translation })
    }
    for (const [key, translation] of Object.entries(CONDITIONS)) {
        dict.set(key, { category: 'condition', translation })
    }
    for (const [key, translation] of Object.entries(DURATION_MARKERS)) {
        dict.set(key, { category: 'duration', translation })
    }

    return dict
}

export const DICTIONARY = buildDictionary()

/**
 * Lookup a token in the dictionary (case-insensitive)
 * @returns DictionaryEntry if found, undefined otherwise
 */
export function lookup(token: string): DictionaryEntry | undefined {
    return DICTIONARY.get(token.toLowerCase())
}

/**
 * Check if a token exists in the dictionary
 */
export function exists(token: string): boolean {
    return DICTIONARY.has(token.toLowerCase())
}

/**
 * Get translation for a token
 * @returns Translation object or undefined if not found
 */
export function translate(token: string, lang: 'th' | 'en'): string | undefined {
    const entry = lookup(token)
    return entry?.translation[lang]
}

/**
 * Get category for a token
 */
export function getCategory(token: string): DosageCategory | undefined {
    return lookup(token)?.category
}
