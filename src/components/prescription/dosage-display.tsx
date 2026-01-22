'use client'

// Sprint 3B: DosageDisplay component (Option A: Single Snapshot)
type DosageDisplayProps = {
    instruction: string       // dosage_instruction (snapshot)
    language: 'th' | 'en'     // dosage_language
    onClick: () => void
}

/**
 * Display component for dosage instructions in the prescription table
 * - Shows 2-line clamp with ellipsis
 * - Shows badge if empty
 * - Clickable to open sheet
 * - Shows language badge for English instructions
 */
export function DosageDisplay({ instruction, language, onClick }: DosageDisplayProps) {
    const hasInstruction = !!instruction?.trim()

    return (
        <button
            type="button"
            onClick={onClick}
            className="w-full text-left p-2 rounded-md hover:bg-gray-50 transition-colors cursor-pointer min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
            {!hasInstruction ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-50 text-orange-600 text-xs">
                    ⚠️ ยังไม่ระบุวิธีใช้
                </span>
            ) : (
                <div className="flex items-start gap-2">
                    <p className="text-sm line-clamp-2 text-gray-700 flex-1">
                        {instruction}
                    </p>
                    {language === 'en' && (
                        <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] bg-blue-100 text-blue-700">
                            EN
                        </span>
                    )}
                </div>
            )}
        </button>
    )
}
