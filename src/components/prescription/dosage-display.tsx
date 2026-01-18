'use client'

type DosageDisplayProps = {
    instruction: string
    onClick: () => void
}

/**
 * Display component for dosage instructions in the prescription table
 * - Shows 2-line clamp with ellipsis
 * - Shows badge if empty
 * - Clickable to open sheet
 */
export function DosageDisplay({ instruction, onClick }: DosageDisplayProps) {
    const isEmpty = !instruction?.trim()

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
                <p className="text-sm line-clamp-2 text-gray-700">
                    {instruction}
                </p>
            )}
        </button>
    )
}
