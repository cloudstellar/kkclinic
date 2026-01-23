'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

// Types
type RecentInstruction = {
    text: string
    updatedAt: string
    useCount: number
}

const MAX_ITEMS = 15
// M5.5: v2 stores shorthand (dosage_original) instead of translated text
const STORAGE_KEY_PREFIX = 'kkclinic:rx:recentShorthand:v2'

/**
 * Normalize text for storage and comparison
 * - Trim whitespace
 * - Collapse multiple spaces within lines
 * - Preserve newlines
 * - Remove duplicate blank lines
 */
function normalizeText(text: string): string {
    if (!text) return ''

    return text
        .split('\n')
        .map(line => line.trim().replace(/\s+/g, ' '))
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')  // Collapse 3+ newlines to 2
        .trim()
}

/**
 * Hook for managing recent dosage instructions in localStorage
 */
export function useRecentInstructions() {
    const [recent, setRecent] = useState<RecentInstruction[]>([])
    const [userId, setUserId] = useState<string | null>(null)
    const [isLoaded, setIsLoaded] = useState(false)

    // Get storage key based on userId
    const storageKey = useMemo(() => {
        return userId
            ? `${STORAGE_KEY_PREFIX}:${userId}`
            : `${STORAGE_KEY_PREFIX}:anon`
    }, [userId])

    // Load userId from Supabase auth
    useEffect(() => {
        const supabase = createClient()

        supabase.auth.getUser().then(({ data }) => {
            setUserId(data.user?.id ?? null)
        })
    }, [])

    // Load recent from localStorage - reload when storageKey changes
    // M5.5 fix: Track which key was loaded to handle userId async loading
    const loadedKeyRef = useRef<string | null>(null)

    // Use useMemo for initial load to avoid setState in effect
    const initialRecent = useMemo(() => {
        if (typeof window === 'undefined') return []
        try {
            const stored = localStorage.getItem(storageKey)
            if (stored) {
                const parsed = JSON.parse(stored)
                if (Array.isArray(parsed)) return parsed
            }
        } catch {
            console.warn('Failed to parse recent instructions')
        }
        return []
    }, [storageKey])

    // Sync state when storageKey changes (after initial useMemo)
    // NOTE: This pattern is intentional for localStorage sync - disable lint rule
    useEffect(() => {
        if (loadedKeyRef.current === storageKey) return
        loadedKeyRef.current = storageKey
        // Only update if different from initialRecent
        if (initialRecent.length > 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setRecent(initialRecent)
        }
         
        setIsLoaded(true)
    }, [storageKey, initialRecent])

    // Save to localStorage
    const saveToStorage = useCallback((items: RecentInstruction[]) => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(items))
        } catch (e) {
            // Quota exceeded - trim and retry
            if (e instanceof DOMException && e.name === 'QuotaExceededError') {
                const trimmed = items.slice(0, 10)
                try {
                    localStorage.setItem(storageKey, JSON.stringify(trimmed))
                    setRecent(trimmed)
                } catch {
                    console.error('Failed to save recent instructions even after trimming')
                }
            }
        }
    }, [storageKey])

    // Add a new instruction to recent
    const addRecent = useCallback((text: string) => {
        const normalized = normalizeText(text)

        // Don't save empty text
        if (!normalized) return

        setRecent(prev => {
            // Check for duplicate (by normalized text)
            const existingIndex = prev.findIndex(
                item => normalizeText(item.text) === normalized
            )

            let updated: RecentInstruction[]

            if (existingIndex !== -1) {
                // Update existing item - bump to top
                const existing = prev[existingIndex]
                const newItem: RecentInstruction = {
                    text: normalized,
                    updatedAt: new Date().toISOString(),
                    useCount: existing.useCount + 1,
                }
                updated = [
                    newItem,
                    ...prev.slice(0, existingIndex),
                    ...prev.slice(existingIndex + 1),
                ]
            } else {
                // Add new item at top
                const newItem: RecentInstruction = {
                    text: normalized,
                    updatedAt: new Date().toISOString(),
                    useCount: 1,
                }
                updated = [newItem, ...prev]
            }

            // Limit items
            const limited = updated.slice(0, MAX_ITEMS)

            // Save to storage
            saveToStorage(limited)

            return limited
        })
    }, [saveToStorage])

    // Get recent sorted by updatedAt (already sorted as we add to top)
    const getRecent = useCallback(() => {
        return recent
    }, [recent])

    // Clear all recent
    const clearRecent = useCallback(() => {
        setRecent([])
        try {
            localStorage.removeItem(storageKey)
        } catch {
            // Ignore
        }
    }, [storageKey])

    return {
        recent,
        isLoaded,
        addRecent,
        getRecent,
        clearRecent,
    }
}
