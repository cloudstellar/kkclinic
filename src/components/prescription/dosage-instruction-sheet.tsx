'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useRecentInstructions } from '@/hooks/use-recent-instructions'
import { toast } from 'sonner'

// Preset dosage instructions สำหรับคลินิกตา
const DOSAGE_PRESETS = [
    'หลังอาหาร เช้า-กลางวัน-เย็น',
    'หลังอาหาร เช้า-เย็น',
    'ก่อนนอน 1 เม็ด',
    'ทุก 6 ชั่วโมง',
    'ทุก 8 ชั่วโมง',
    'หยอดตา 1 หยด วันละ 2 ครั้ง (เช้า-เย็น)',
    'หยอดตา 1 หยด วันละ 4 ครั้ง',
    'หยอดตา ทั้งสองข้าง 1 หยด วันละ 4 ครั้ง',
    'ป้ายตา บาง ๆ ก่อนนอน',
    'ทาบาง ๆ เช้า-เย็น',
]

type DosageInstructionSheetProps = {
    open: boolean
    instruction: string
    medicineName?: string
    onSave: (text: string) => void
    onClose: () => void
    previousInstructionText?: string
}

/**
 * Get length badge info based on character count
 */
function getLengthBadge(length: number): { label: string; color: string } {
    if (length <= 50) {
        return { label: 'สั้น ✓', color: 'text-green-600 bg-green-50' }
    } else if (length <= 80) {
        return { label: 'กลาง', color: 'text-yellow-600 bg-yellow-50' }
    } else {
        return { label: 'ยาว - อาจตัดบรรทัด', color: 'text-orange-600 bg-orange-50' }
    }
}

export function DosageInstructionSheet({
    open,
    instruction,
    medicineName,
    onSave,
    onClose,
    previousInstructionText = '',
}: DosageInstructionSheetProps) {
    const [draft, setDraft] = useState(instruction)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const { recent, addRecent } = useRecentInstructions()

    // Reset draft when sheet opens with new instruction
    useEffect(() => {
        if (open) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: sync draft from props when sheet opens
            setDraft(instruction)
            // Focus textarea after sheet animation
            setTimeout(() => {
                textareaRef.current?.focus()
            }, 100)
        }
    }, [open, instruction])

    // Define handlers first (before useCallback that uses them)
    const handleSave = useCallback(() => {
        const trimmed = draft.trim()
        addRecent(trimmed)
        onSave(trimmed)
        onClose()
    }, [draft, addRecent, onSave, onClose])

    const handleCancel = useCallback(() => {
        setDraft(instruction)  // Reset draft
        onClose()
    }, [instruction, onClose])

    // Handle keyboard shortcuts
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            e.preventDefault()
            handleCancel()
        } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault()
            handleSave()
        }
    }, [handleCancel, handleSave])

    const handleChipClick = (text: string) => {
        setDraft(text)  // Replace mode
    }

    const handleCopyPrevious = () => {
        if (previousInstructionText?.trim()) {
            setDraft(previousInstructionText.trim())
            toast.success('คัดลอกแล้ว')
        }
    }

    const canCopyPrevious = !!previousInstructionText?.trim()
    const charCount = draft.length
    const lineCount = draft === '' ? 0 : draft.split('\n').length
    const badge = getLengthBadge(charCount)

    return (
        <Sheet open={open} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
            <SheetContent side="bottom" className="h-[85vh] max-h-[600px]" onKeyDown={handleKeyDown}>
                <SheetHeader>
                    <SheetTitle>
                        วิธีใช้ยา {medicineName && <span className="text-muted-foreground font-normal">— {medicineName}</span>}
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-4 space-y-4">
                    {/* Copy from previous */}
                    {canCopyPrevious && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleCopyPrevious}
                            className="h-10"
                        >
                            📋 คัดลอกจากรายการก่อนหน้า
                        </Button>
                    )}

                    {/* Recent chips */}
                    {recent.length > 0 && (
                        <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2">🕐 ใช้ล่าสุด</p>
                            <div className="flex flex-wrap gap-2">
                                {recent.slice(0, 5).map((item, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => handleChipClick(item.text)}
                                        className="px-3 py-2 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full transition-colors min-h-[44px]"
                                    >
                                        {item.text.length > 40 ? item.text.slice(0, 40) + '...' : item.text}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Preset chips */}
                    <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">💊 Preset</p>
                        <div className="flex flex-wrap gap-2">
                            {DOSAGE_PRESETS.map((preset) => (
                                <button
                                    key={preset}
                                    type="button"
                                    onClick={() => handleChipClick(preset)}
                                    className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors min-h-[44px]"
                                >
                                    {preset}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Textarea */}
                    <div className="space-y-2">
                        <Textarea
                            ref={textareaRef}
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            placeholder="พิมพ์วิธีใช้ยา หรือเลือกจาก preset"
                            className="min-h-[120px] resize-none text-base"
                            rows={4}
                        />

                        {/* Counter + Badge */}
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                                {charCount} ตัวอักษร • {lineCount} บรรทัด
                            </span>
                            {charCount > 0 && (
                                <span className={`px-2 py-0.5 rounded ${badge.color}`}>
                                    {badge.label}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <SheetFooter className="border-t pt-4">
                    <div className="flex gap-3 w-full">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            className="flex-1 h-12 text-base"
                        >
                            ยกเลิก
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSave}
                            className="flex-1 h-12 text-base"
                        >
                            บันทึก
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground text-center w-full mt-2">
                        ⌘+Enter บันทึก • Esc ยกเลิก
                    </p>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
