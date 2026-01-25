/**
 * Clinic Configuration
 * ข้อมูลคลินิกสำหรับใช้ในเอกสารต่างๆ เช่น ฉลากยา, ใบเสร็จ, ใบเวชระเบียน
 */

export const CLINIC_CONFIG = {
    // ข้อมูลหลัก
    name: 'คลินิกตาใสใส',
    fullName: 'ตาใสใสคลินิกเฉพาะทางด้านเวชกรรมสาขาจักษุวิทยา',
    address: '186/153 ถนน เทศบาล34 ตำบลพลา อำเภอบ้านฉาง จังหวัดระยอง',
    phone: '081-776-6936',

    // Timezone & Operating Hours (for future settings page)
    timezone: 'Asia/Bangkok',         // IANA timezone
    lateHour: 21,                      // Hour considered "late" (for smart UX)

    // Label settings
    patientIdLabel: 'TN',        // แสดงเป็น TN บนฉลาก
    patientIdPrefix: 'HN',       // prefix จริงใน database

    // ข้อความคงที่บนฉลากยา
    expiryNote: 'วันหมดอายุ : ระบุไว้บนฉลากข้างกล่องยา',
}

/**
 * แปลง HN/TN เป็น TN format สำหรับแสดงผล (ไม่รวม "TN" อีกครั้ง)
 * @example formatPatientId('TN269003') => 'TN269003'
 * @example formatPatientId('HN000001') => 'TN000001'
 */
export function formatPatientId(hn: string, includeLabel = true): string {
    if (!hn) return ''
    // Strip any existing prefix (HN or TN)
    const number = hn.replace(/^(HN|TN)/i, '')
    // Return with or without label
    return includeLabel ? `TN${number}` : number
}

/**
 * Format วันที่เป็นภาษาไทย
 * @example formatThaiDate('2026-01-18') => '18 ม.ค. 2569'
 */
export function formatThaiDate(dateStr: string): string {
    const date = new Date(dateStr)
    const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
    const day = date.getDate()
    const month = thaiMonths[date.getMonth()]
    const buddhistYear = date.getFullYear() + 543
    return `${day} ${month} ${buddhistYear}`
}

/**
 * Format date in English
 * @example formatEnglishDate('2026-01-18') => 'Jan 18, 2026'
 */
export function formatEnglishDate(dateStr: string): string {
    const date = new Date(dateStr)
    const enMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const day = date.getDate()
    const month = enMonths[date.getMonth()]
    const year = date.getFullYear()
    return `${month} ${day}, ${year}`
}

/**
 * Format date based on language
 * @example formatDate('2026-01-18', 'th') => '18 ม.ค. 2569'
 * @example formatDate('2026-01-18', 'en') => 'Jan 18, 2026'
 */
export function formatDate(dateStr: string, lang: 'th' | 'en' = 'th'): string {
    return lang === 'en' ? formatEnglishDate(dateStr) : formatThaiDate(dateStr)
}
