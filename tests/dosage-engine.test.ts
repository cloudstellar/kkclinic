/**
 * Sprint 3B: Smart Dosage Engine Tests
 *
 * Test cases from PLAN.md verification section:
 * - Happy path, numeric separation, case-insensitive, whitespace, duration, punctuation
 * - Duplicate unknown, only-frequency, only-site, garbage input
 */

import { describe, test, expect } from 'vitest'
import { tokenizeRaw, normalize, getOrderedUnique } from '../src/lib/dosage/tokenizer'
import { lookup, exists, DICT_VERSION } from '../src/lib/dosage/dictionary-v1'
import { translate } from '../src/lib/dosage/engine'

// ============ Tokenizer Tests ============

describe('Tokenizer', () => {
    describe('normalize', () => {
        test('trims whitespace', () => {
            expect(normalize('  hello  ')).toBe('hello')
        })

        test('collapses multiple spaces', () => {
            expect(normalize('hello   world')).toBe('hello world')
        })

        test('replaces newlines with spaces', () => {
            expect(normalize('hello\nworld')).toBe('hello world')
        })

        test('handles mixed whitespace', () => {
            expect(normalize('  hello \n\n  world  ')).toBe('hello world')
        })
    })

    describe('tokenizeRaw', () => {
        test('splits by whitespace', () => {
            expect(tokenizeRaw('1 gtt OU bid')).toEqual(['1', 'gtt', 'OU', 'bid'])
        })

        test('handles numeric separation: 2tab → ["2", "tab"]', () => {
            expect(tokenizeRaw('2tab')).toEqual(['2', 'tab'])
        })

        test('handles numeric separation: 1gtt → ["1", "gtt"]', () => {
            expect(tokenizeRaw('1gtt')).toEqual(['1', 'gtt'])
        })

        test('handles punctuation separation: bid, → ["bid", ","]', () => {
            expect(tokenizeRaw('bid,')).toEqual(['bid', ','])
        })

        test('handles duration joined: x7d → ["x", "7", "d"]', () => {
            expect(tokenizeRaw('x7d')).toEqual(['x', '7', 'd'])
        })

        test('handles duration spaced: x 7 d', () => {
            expect(tokenizeRaw('x 7 d')).toEqual(['x', '7', 'd'])
        })

        test('handles complex input: 2tab PO bid pc x7d', () => {
            expect(tokenizeRaw('2tab PO bid pc x7d')).toEqual([
                '2', 'tab', 'PO', 'bid', 'pc', 'x', '7', 'd'
            ])
        })

        test('preserves case', () => {
            const tokens = tokenizeRaw('OU Bid Pc')
            expect(tokens).toEqual(['OU', 'Bid', 'Pc'])
        })
    })

    describe('getOrderedUnique', () => {
        test('removes duplicates while preserving order', () => {
            expect(getOrderedUnique(['a', 'b', 'a', 'c', 'b'])).toEqual(['a', 'b', 'c'])
        })

        test('handles single duplicate: asdf asdf → ["asdf"]', () => {
            expect(getOrderedUnique(['asdf', 'asdf'])).toEqual(['asdf'])
        })
    })
})

// ============ Dictionary Tests ============

describe('Dictionary', () => {
    test('DICT_VERSION is 1.0', () => {
        expect(DICT_VERSION).toBe('1.0')
    })

    test('lookup OU returns site category', () => {
        const entry = lookup('OU')
        expect(entry).toBeDefined()
        expect(entry?.category).toBe('site')
        expect(entry?.translation.th).toBe('ตาทั้งสองข้าง')
        expect(entry?.translation.en).toBe('both eyes')
    })

    test('lookup is case-insensitive', () => {
        expect(lookup('ou')?.translation.th).toBe('ตาทั้งสองข้าง')
        expect(lookup('OU')?.translation.th).toBe('ตาทั้งสองข้าง')
        expect(lookup('Ou')?.translation.th).toBe('ตาทั้งสองข้าง')
    })

    test('lookup od (lowercase) returns site category (SAFETY CHECK)', () => {
        const entry = lookup('od')
        expect(entry?.category).toBe('site')
        expect(entry?.translation.th).toBe('ตาขวา')
    })

    test('lookup bid returns frequency', () => {
        const entry = lookup('bid')
        expect(entry?.category).toBe('frequency')
        expect(entry?.translation.th).toBe('วันละ 2 ครั้ง')
    })

    test('lookup gtt returns form', () => {
        const entry = lookup('gtt')
        expect(entry?.category).toBe('form')
        expect(entry?.translation.th).toBe('หยด')
    })

    test('exists returns true for known tokens', () => {
        expect(exists('ou')).toBe(true)
        expect(exists('bid')).toBe(true)
        expect(exists('pc')).toBe(true)
    })

    test('exists returns false for unknown tokens', () => {
        expect(exists('asdf')).toBe(false)
        expect(exists('hello')).toBe(false)
    })
})

// ============ Engine Tests ============

describe('Engine', () => {
    describe('Happy Path', () => {
        test('1 gtt OU bid → Thai sentence', () => {
            const result = translate('1 gtt OU bid', 'th')
            expect(result.lines.length).toBeGreaterThan(0)
            expect(result.lines[0]).toContain('ตาทั้งสองข้าง')
            expect(result.lines[0]).toContain('1')
            expect(result.lines[0]).toContain('หยด')
            expect(result.unknownTokens).toEqual([])
            expect(result.dictionaryVersion).toBe('1.0')
        })

        test('1 gtt OU bid → English sentence', () => {
            const result = translate('1 gtt OU bid', 'en')
            expect(result.lines[0]).toContain('both eyes')
            expect(result.lines[0]).toContain('drop')
        })

        test('includes frequency on second line', () => {
            const result = translate('1 gtt OU bid', 'th')
            expect(result.lines.length).toBeGreaterThanOrEqual(2)
            expect(result.lines[1]).toContain('วันละ 2 ครั้ง')
        })
    })

    describe('Numeric Separation', () => {
        test('2tab PO bid → splits correctly', () => {
            const result = translate('2tab PO bid', 'th')
            expect(result.lines[0]).toContain('2')
            expect(result.lines[0]).toContain('เม็ด')
        })
    })

    describe('Case-Insensitive', () => {
        test('ou = OU gives same result', () => {
            const lower = translate('1 gtt ou bid', 'th')
            const upper = translate('1 gtt OU bid', 'th')
            expect(lower.lines[0]).toBe(upper.lines[0])
        })
    })

    describe('Whitespace Tolerance', () => {
        test('multiple spaces are normalized', () => {
            const normal = translate('1 gtt OU bid', 'th')
            const spaced = translate('1  gtt   OU    bid', 'th')
            expect(normal.lines[0]).toBe(spaced.lines[0])
        })
    })

    describe('Duration', () => {
        test('x7d → เป็นเวลา 7 วัน', () => {
            const result = translate('1 gtt OU bid x7d', 'th')
            expect(result.lines.some(l => l.includes('7 วัน'))).toBe(true)
        })

        test('x 7 d → same as x7d', () => {
            const joined = translate('bid x7d', 'th')
            const spaced = translate('bid x 7 d', 'th')
            // Both should contain duration
            expect(joined.lines.some(l => l.includes('วัน'))).toBe(true)
            expect(spaced.lines.some(l => l.includes('วัน'))).toBe(true)
        })
    })

    describe('Only Frequency', () => {
        test('bid alone → วันละ 2 ครั้ง', () => {
            const result = translate('bid', 'th')
            expect(result.lines[0]).toContain('วันละ 2 ครั้ง')
        })
    })

    describe('Only Site', () => {
        test('OU alone → ตาทั้งสองข้าง', () => {
            const result = translate('OU', 'th')
            expect(result.lines[0]).toContain('ตาทั้งสองข้าง')
        })
    })

    describe('Unknown Tokens', () => {
        test('preserves unknown tokens in output', () => {
            const result = translate('1 gtt OU bid and sleep', 'th')
            expect(result.unknownTokens).toContain('and')
            expect(result.unknownTokens).toContain('sleep')
        })

        test('unknown tokens are appended to last line', () => {
            const result = translate('bid xyz', 'th')
            expect(result.lines[result.lines.length - 1]).toContain('xyz')
        })

        test('duplicate unknown tokens are unique: asdf asdf', () => {
            const result = translate('asdf asdf', 'th')
            expect(result.unknownTokens).toEqual(['asdf'])
        })

        test('casing preserved: and Sleep', () => {
            const result = translate('and Sleep', 'th')
            expect(result.unknownTokens).toContain('and')
            expect(result.unknownTokens).toContain('Sleep')
        })
    })

    describe('Garbage Input', () => {
        test('garbage input returns normalized input as fallback', () => {
            const result = translate('asdf qwer', 'th')
            expect(result.lines.length).toBe(1)
            expect(result.lines[0]).toBe('asdf qwer')
            expect(result.unknownTokens).toEqual(['asdf', 'qwer'])
        })

        test('empty input returns empty', () => {
            const result = translate('', 'th')
            expect(result.lines).toEqual([])
            expect(result.unknownTokens).toEqual([])
        })

        test('whitespace only returns empty', () => {
            const result = translate('   ', 'th')
            expect(result.lines).toEqual([])
        })
    })

    describe('Condition (pc, ac)', () => {
        test('bid pc → includes หลังอาหาร', () => {
            const result = translate('bid pc', 'th')
            expect(result.lines.some(l => l.includes('หลังอาหาร'))).toBe(true)
        })

        test('bid ac → includes ก่อนอาหาร', () => {
            const result = translate('bid ac', 'th')
            expect(result.lines.some(l => l.includes('ก่อนอาหาร'))).toBe(true)
        })
    })
})
