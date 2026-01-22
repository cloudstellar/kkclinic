/**
 * Sprint 3B: Smart Dosage System
 *
 * Re-exports all dosage-related modules for easy importing
 */

// Tokenizer
export { tokenize, tokenizeRaw, normalize, getOrderedUnique } from './tokenizer'
export type { Token, TokenType } from './tokenizer'

// Dictionary
export {
    DICT_VERSION,
    DICTIONARY,
    FORMS,
    SITES,
    FREQUENCIES,
    CONDITIONS,
    DURATION_MARKERS,
    lookup,
    exists,
    translate as lookupTranslation,
    getCategory,
} from './dictionary-v1'
export type { DosageCategory } from './dictionary-v1'

// Engine
export { translate, translateToString } from './engine'
export type { TranslationResult } from './engine'
