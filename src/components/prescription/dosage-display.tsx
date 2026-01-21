'use client'

type DosageDisplayProps = {
    instructionTh: string
    instructionEn: string
    onClick: () => void
}

/**
 * Display component for dosage instructions in the prescription table
 * - Shows 2-line clamp with ellipsis
 * - Shows badge if empty
 * - Clickable to open sheet
 * - Shows TH or EN instruction (whichever is available)
 */
export function DosageDisplay({ instructionTh, instructionEn, onClick }: DosageDisplayProps) {
    const hasTh = !!instructionTh?.trim()
    const hasEn = !!instructionEn?.trim()
    const isEmpty = !hasTh && !hasEn

    // Display logic: show TH if available, else show EN
    const displayInstruction = hasTh ? instructionTh : instructionEn

    // Show language badge if both exist or only EN exists
    const showLangTag = hasEn && !hasTh

    return (
        <button
            type="button"
            onClick={onClick}
            className="w-full text-left p-2 rounded-md hover:bg-gray-50 transition-colors cursor-pointer min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
            {isEmpty ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-50 text-orange-600 text-xs">
                    ⚠️ ยังไม่ระบุวิธีใช้
                </span>
            ) : (
                <div className="flex items-start gap-2">
                    <p className="text-sm line-clamp-2 text-gray-700 flex-1">
                        {displayInstruction}
                    </p>
                    {showLangTag && (
                        <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] bg-blue-100 text-blue-700">
                            EN
                        </span>
                    )}
                    {hasTh && hasEn && (
                        <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] bg-green-100 text-green-700">
                            TH+EN
                        </span>
                    )}
                </div>
            )}
        </button>
    )
}
