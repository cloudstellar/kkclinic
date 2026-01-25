/**
 * Date utilities for handling Buddhist Era (BE) dates and age calculation
 * All functions are timezone-safe (no Date object for parsing)
 */

// Parse date string WITHOUT Date object (timezone-safe)
function parseDateParts(dateString: string): { year: number; month: number; day: number } | null {
    if (!dateString || !dateString.includes('-')) return null
    const parts = dateString.split('-')
    if (parts.length !== 3) return null
    const [year, month, day] = parts.map(Number)
    if (isNaN(year) || isNaN(month) || isNaN(day)) return null
    return { year, month, day }
}

// Get today's date parts (local timezone)
function getTodayParts(): { year: number; month: number; day: number } {
    const now = new Date()
    return {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate()
    }
}

/**
 * Convert Buddhist Era (BE) year to Common Era (CE) if detected
 * Detection: year >= 2400 and <= current BE + 5 (buffer for typos)
 */
export function normalizeBirthDate(dateString: string): string {
    const parts = parseDateParts(dateString)
    if (!parts) return dateString

    const { year, month, day } = parts
    const today = getTodayParts()
    const currentBE = today.year + 543

    // Detect BE: year >= 2400 and <= current BE + 5 (buffer)
    if (year >= 2400 && year <= currentBE + 5) {
        const ceYear = year - 543
        return `${ceYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    }

    return dateString
}

/**
 * Check if birth date is in the future (string comparison - timezone-safe)
 */
export function isFutureBirthDate(dateString: string): boolean {
    const parts = parseDateParts(dateString)
    if (!parts) return false

    const today = getTodayParts()
    const todayStr = `${today.year}-${String(today.month).padStart(2, '0')}-${String(today.day).padStart(2, '0')}`
    const dateStr = `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`

    return dateStr > todayStr
}

/**
 * Calculate age from birth date (timezone-safe)
 * Returns null if date is invalid or in the future
 */
export function calculateAge(birthDate: string | null): number | null {
    if (!birthDate) return null

    const birth = parseDateParts(birthDate)
    if (!birth) return null

    const today = getTodayParts()

    // Check future date
    if (isFutureBirthDate(birthDate)) return null

    let age = today.year - birth.year
    if (today.month < birth.month || (today.month === birth.month && today.day < birth.day)) {
        age--
    }
    return age
}

/**
 * Get today's date range for a specific timezone
 * Returns { start, nextStart } for use with [start, nextStart) pattern
 * Prevents midnight edge cases by using exclusive end
 */
export function getTodayRange(tz = 'Asia/Bangkok') {
    const now = new Date()

    // Get today's date string in the target timezone
    const fmt = new Intl.DateTimeFormat('en-CA', {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    })
    const todayStr = fmt.format(now) // "2026-01-25"

    // Get next day's date string
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const nextStr = fmt.format(tomorrow)

    // Create ISO strings for Bangkok timezone (UTC+7)
    const startLocal = new Date(`${todayStr}T00:00:00+07:00`)
    const nextStartLocal = new Date(`${nextStr}T00:00:00+07:00`)

    return {
        start: startLocal.toISOString(),
        nextStart: nextStartLocal.toISOString()
    }
}
