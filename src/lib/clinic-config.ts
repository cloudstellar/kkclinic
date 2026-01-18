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

    // Label settings
    patientIdLabel: 'TN',        // แสดงเป็น TN บนฉลาก
    patientIdPrefix: 'HN',       // prefix จริงใน database

    // ข้อความคงที่บนฉลากยา
    expiryNote: 'วันหมดอายุ : ระบุไว้บนฉลากข้างกล่องยา',
}

/**
 * แปลง HN เป็น TN format สำหรับแสดงผล
 * @example formatPatientId('HN000001') => 'TN 000001'
 */
export function formatPatientId(hn: string, label = CLINIC_CONFIG.patientIdLabel): string {
    if (!hn) return ''
    // Remove prefix and add new label
    const number = hn.replace(CLINIC_CONFIG.patientIdPrefix, '')
    return `${label} ${number}`
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
