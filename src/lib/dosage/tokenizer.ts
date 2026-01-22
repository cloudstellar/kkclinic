/**
 * Sprint 3B: Smart Dosage Tokenizer
 *
 * Tokenizes doctor's shorthand input into structured tokens.
 * Handles punctuation separation, numeric separation, and duration patterns.
 *
 * @example
 * tokenize("1 gtt OU bid") → ["1", "gtt", "OU", "bid"]
 * tokenize("2tab PO bid") → ["2", "tab", "PO", "bid"]
 * tokenize("x7d") → ["x", "7", "d"]
 * tokenize("bid,") → ["bid", ","]
 */

// Token types for the dosage system
export type TokenType =
    | 'quantity'      // Numbers: 1, 2, 3
    | 'form'          // gtt, tab, cap, PO
    | 'site'          // OU, OD, OS
    | 'frequency'     // qd, bid, tid, qid, q4h, HS
    | 'condition'     // ac, pc, prn, stat
    | 'duration'      // x, d (parsed from x7d patterns)
    | 'punctuation'   // , . ( ) ; :
    | 'unknown'       // Anything not recognized

export type Token = {
    value: string       // Original value (casing preserved)
    type: TokenType     // Classification
    normalized: string  // Lowercase for lookup
}

/**
 * Normalize input: trim, collapse whitespace, replace newlines
 */
export function normalize(input: string): string {
    return input
        .trim()
        .replace(/[\r\n]+/g, ' ')      // Replace newlines with space
        .replace(/\s+/g, ' ')          // Collapse multiple spaces
}

/**
 * Check if a character is punctuation
 */
function isPunctuation(char: string): boolean {
    return /^[,.\-;:()[\]{}!?]$/.test(char)
}

/**
 * Check if a string is purely numeric
 */
function isNumeric(str: string): boolean {
    return /^\d+$/.test(str)
}

/**
 * Split a word into tokens, handling:
 * - Punctuation attached to words: "bid," → ["bid", ","]
 * - Numbers joined with letters: "2tab" → ["2", "tab"]
 * - Duration patterns: "x7d" → ["x", "7", "d"]
 */
function splitWord(word: string): string[] {
    if (!word) return []

    const result: string[] = []
    let buffer = ''
    let bufferType: 'letter' | 'digit' | 'punct' | null = null

    for (const char of word) {
        let charType: 'letter' | 'digit' | 'punct'

        if (isPunctuation(char)) {
            charType = 'punct'
        } else if (/\d/.test(char)) {
            charType = 'digit'
        } else {
            charType = 'letter'
        }

        // If type changes, flush buffer
        if (bufferType !== null && charType !== bufferType) {
            if (buffer) result.push(buffer)
            buffer = ''
        }

        buffer += char
        bufferType = charType
    }

    // Flush remaining buffer
    if (buffer) result.push(buffer)

    return result
}

/**
 * Tokenize input string into an array of raw token strings
 * (Before type classification)
 */
export function tokenizeRaw(input: string): string[] {
    const normalized = normalize(input)
    if (!normalized) return []

    // Split by whitespace first
    const words = normalized.split(' ')

    // Then split each word for punctuation/numeric separation
    const tokens: string[] = []
    for (const word of words) {
        const subTokens = splitWord(word)
        tokens.push(...subTokens)
    }

    return tokens.filter(t => t.length > 0)
}

/**
 * Main tokenize function: returns structured Token objects
 * Type classification will be done by the engine using dictionary lookup
 */
export function tokenize(input: string): Token[] {
    const rawTokens = tokenizeRaw(input)

    return rawTokens.map(value => {
        // Determine initial type (will be refined by dictionary lookup)
        let type: TokenType = 'unknown'

        if (isNumeric(value)) {
            type = 'quantity'
        } else if (isPunctuation(value)) {
            type = 'punctuation'
        }

        return {
            value,
            type,
            normalized: value.toLowerCase(),
        }
    })
}

/**
 * Get ordered unique tokens (for unknownTokens result)
 * Maintains insertion order, removes duplicates
 */
export function getOrderedUnique(tokens: string[]): string[] {
    const seen = new Set<string>()
    const result: string[] = []

    for (const token of tokens) {
        if (!seen.has(token)) {
            seen.add(token)
            result.push(token)
        }
    }

    return result
}
