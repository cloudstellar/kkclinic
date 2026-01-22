/**
 * Sprint 3B: Smart Dosage Translation Engine
 *
 * Translates doctor's shorthand input into patient-friendly instructions.
 * Uses tokenizer + dictionary to produce deterministic output.
 *
 * @example
 * translate("1 gtt OU bid pc", "th")
 * → { lines: ["หยอดตาทั้งสองข้าง ครั้งละ 1 หยด", "วันละ 2 ครั้ง หลังอาหาร"], ... }
 */

import { tokenize, normalize, getOrderedUnique, type Token, type TokenType } from './tokenizer'
import { lookup, DICT_VERSION, type DosageCategory } from './dictionary-v1'

// Result type for translation
export type TranslationResult = {
    lines: string[]              // Plain text lines (no markup)
    unknownTokens: string[]      // Ordered unique list of unknown tokens
    dictionaryVersion: string    // e.g., '1.0'
}

// Internal parsed structure
type ParsedDosage = {
    quantity?: string
    form?: { token: string; translation: string }
    site?: { token: string; translation: string }
    frequency?: { token: string; translation: string }
    condition?: { token: string; translation: string }
    duration?: { days: number; translation: string }
    unknownTokens: string[]
}

/**
 * Classify tokens using dictionary lookup
 */
function classifyToken(token: Token, lang: 'th' | 'en'): { type: TokenType; translation?: string } {
    // Already classified as quantity or punctuation
    if (token.type === 'quantity' || token.type === 'punctuation') {
        return { type: token.type }
    }

    // Look up in dictionary
    const entry = lookup(token.normalized)
    if (entry) {
        const typeMap: Record<DosageCategory, TokenType> = {
            'form': 'form',
            'site': 'site',
            'frequency': 'frequency',
            'condition': 'condition',
            'duration': 'duration',
        }
        return {
            type: typeMap[entry.category],
            translation: entry.translation[lang],
        }
    }

    return { type: 'unknown' }
}

/**
 * Parse tokens into structured dosage parts
 */
function parseTokens(tokens: Token[], lang: 'th' | 'en'): ParsedDosage {
    const result: ParsedDosage = {
        unknownTokens: [],
    }

    let i = 0
    while (i < tokens.length) {
        const token = tokens[i]
        const classified = classifyToken(token, lang)

        switch (classified.type) {
            case 'quantity':
                // Check if next token is a form
                result.quantity = token.value
                break

            case 'form':
                result.form = {
                    token: token.value,
                    translation: classified.translation!,
                }
                break

            case 'site':
                result.site = {
                    token: token.value,
                    translation: classified.translation!,
                }
                break

            case 'frequency':
                result.frequency = {
                    token: token.value,
                    translation: classified.translation!,
                }
                break

            case 'condition':
                result.condition = {
                    token: token.value,
                    translation: classified.translation!,
                }
                break

            case 'duration':
                // Handle duration pattern: x <number> d
                // Look for pattern: current token is 'x', next is number, next is 'd'
                if (token.normalized === 'x' && i + 2 < tokens.length) {
                    const numToken = tokens[i + 1]
                    const dToken = tokens[i + 2]
                    if (numToken.type === 'quantity' && dToken.normalized === 'd') {
                        const days = parseInt(numToken.value, 10)
                        result.duration = {
                            days,
                            translation: lang === 'th'
                                ? `เป็นเวลา ${days} วัน`
                                : `for ${days} day${days > 1 ? 's' : ''}`,
                        }
                        i += 2 // Skip the number and 'd'
                    }
                }
                break

            case 'punctuation':
                // Ignore punctuation in translation
                break

            case 'unknown':
                // Preserve unknown tokens
                result.unknownTokens.push(token.value)
                break
        }

        i++
    }

    return result
}

/**
 * Build output lines from parsed dosage
 * Line ordering (per PLAN):
 * 1. Site + Quantity/Form
 * 2. Frequency (+ Condition)
 * 3. Duration
 * Unknown tokens appended to last line
 */
function buildLines(parsed: ParsedDosage, lang: 'th' | 'en'): string[] {
    const lines: string[] = []

    // Line 1: Site + Quantity/Form
    const line1Parts: string[] = []

    if (parsed.site) {
        line1Parts.push(parsed.site.translation)
    }

    if (parsed.quantity && parsed.form) {
        if (lang === 'th') {
            line1Parts.push(`ครั้งละ ${parsed.quantity} ${parsed.form.translation}`)
        } else {
            line1Parts.push(`${parsed.quantity} ${parsed.form.translation}`)
        }
    } else if (parsed.form) {
        line1Parts.push(parsed.form.translation)
    }

    if (line1Parts.length > 0) {
        lines.push(line1Parts.join(' '))
    }

    // Line 2: Frequency + Condition
    const line2Parts: string[] = []

    if (parsed.frequency) {
        line2Parts.push(parsed.frequency.translation)
    }

    if (parsed.condition) {
        line2Parts.push(parsed.condition.translation)
    }

    if (line2Parts.length > 0) {
        lines.push(line2Parts.join(' '))
    }

    // Line 3: Duration
    if (parsed.duration) {
        lines.push(parsed.duration.translation)
    }

    return lines
}

/**
 * Main translation function
 *
 * @param input - Doctor's shorthand input (e.g., "1 gtt OU bid")
 * @param lang - Target language ('th' or 'en')
 * @returns TranslationResult with lines, unknownTokens, and dictionaryVersion
 */
export function translate(input: string, lang: 'th' | 'en'): TranslationResult {
    // Handle empty/blank input
    const normalized = normalize(input)
    if (!normalized) {
        return {
            lines: [],
            unknownTokens: [],
            dictionaryVersion: DICT_VERSION,
        }
    }

    // Tokenize
    const tokens = tokenize(input)

    // Parse into structured parts
    const parsed = parseTokens(tokens, lang)

    // Build output lines
    let lines = buildLines(parsed, lang)
    const isFallback = lines.length === 0

    // Handle fallback: if no recognized tokens, return normalized input
    if (isFallback) {
        lines = [normalized]
    }

    // Append unknown tokens to last line (per PLAN: deterministic rule)
    // ONLY if not fallback mode (because fallback already includes the full text)
    if (!isFallback && parsed.unknownTokens.length > 0 && lines.length > 0) {
        const lastIndex = lines.length - 1
        const unknownJoined = parsed.unknownTokens.join(' ')
        lines[lastIndex] = `${lines[lastIndex]} ${unknownJoined}`.trim()
    }

    return {
        lines,
        unknownTokens: getOrderedUnique(parsed.unknownTokens),
        dictionaryVersion: DICT_VERSION,
    }
}

/**
 * Convenience function to get single-line output
 */
export function translateToString(input: string, lang: 'th' | 'en'): string {
    const result = translate(input, lang)
    return result.lines.join('\n')
}
