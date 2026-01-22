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
import { Label } from '@/components/ui/label'
import { useRecentInstructions } from '@/hooks/use-recent-instructions'
import { toast } from 'sonner'

// Sprint 3B: Preset dosage instructions (will become shorthand in future)
const DOSAGE_PRESETS_TH = [
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

const DOSAGE_PRESETS_EN = [
    'After meals, 3 times daily (morning-noon-evening)',
    'After meals, twice daily (morning-evening)',
    '1 tablet at bedtime',
    'Every 6 hours',
    'Every 8 hours',
    '1 drop to each eye, twice daily (morning-evening)',
    '1 drop to each eye, 4 times daily',
    '1 drop to both eyes, 4 times daily',
    'Apply thin layer to eye at bedtime',
    'Apply thin layer twice daily (morning-evening)',
]

// Sprint 3B: Props use dosage_original, dosage_instruction, dosage_language
type DosageInstructionSheetProps = {
    open: boolean
    dosageOriginal: string        // Raw shorthand from doctor
    dosageInstruction: string     // Snapshot (may be auto-generated or override)
    dosageLanguage: 'th' | 'en'   // Language for label
    medicineName?: string
    isForeignPatient: boolean
    onSave: (original: string, instruction: string, lang: 'th' | 'en') => void
    onClose: () => void
    previousDosageOriginal?: string
    previousDosageInstruction?: string
}

function getLengthBadge(length: number): { label: string; color: string } {
    if (length <= 50) {
        return { label: 'สั้น ✓', color: 'text-green-600 bg-green-50' }
    } else if (length <= 80) {
        return { label: 'กลาง', color: 'text-yellow-600 bg-yellow-50' }
    } else {
        return { label: 'ยาว - อาจตัดบรรทัด', color: 'text-orange-600 bg-orange-50' }
    }
}

/**
 * Sprint 3B: DosageInstructionSheet (Option A: Single Snapshot)
 * - dosageOriginal: What doctor types (source of truth)
 * - dosageInstruction: What prints on label (may be auto-translated or doctor override)
 * - dosageLanguage: 'th' or 'en' (determines label language)
 */
export function DosageInstructionSheet({
    open,
    dosageOriginal,
    dosageInstruction,
    dosageLanguage,
    medicineName,
    isForeignPatient,
    onSave,
    onClose,
    previousDosageOriginal = '',
    previousDosageInstruction = '',
}: DosageInstructionSheetProps) {
    // Sprint 3B: Single instruction draft (will become preview in future engine)
    const [draftInstruction, setDraftInstruction] = useState(dosageInstruction)
    const [lang, setLang] = useState<'th' | 'en'>(dosageLanguage)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const { recent, addRecent } = useRecentInstructions()

    // Reset draft when sheet opens
    useEffect(() => {
        if (open) {
            setDraftInstruction(dosageInstruction)
            setLang(dosageLanguage)
            setTimeout(() => textareaRef.current?.focus(), 100)
        }
    }, [open, dosageInstruction, dosageLanguage])

    const handleSave = useCallback(() => {
        const trimmed = draftInstruction.trim()
        if (trimmed) addRecent(trimmed)
        // Sprint 3B: For now, original = instruction (until engine is ready)
        onSave(trimmed, trimmed, lang)
        onClose()
    }, [draftInstruction, lang, addRecent, onSave, onClose])

    const handleCancel = useCallback(() => {
        setDraftInstruction(dosageInstruction)
        onClose()
    }, [dosageInstruction, onClose])

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            e.preventDefault()
            handleCancel()
        } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault()
            handleSave()
        }
    }, [handleCancel, handleSave])

    const handlePresetClick = (text: string) => {
        setDraftInstruction(text)
    }

    const handleCopyPrevious = () => {
        if (previousDosageInstruction?.trim()) {
            setDraftInstruction(previousDosageInstruction.trim())
            toast.success('คัดลอกแล้ว')
        }
    }

    const canCopyPrevious = !!previousDosageInstruction?.trim()
    const charCount = draftInstruction.length
    const badge = getLengthBadge(charCount)
    const presets = lang === 'en' ? DOSAGE_PRESETS_EN : DOSAGE_PRESETS_TH

    return (
        <Sheet open={open} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
            <SheetContent side="bottom" className="h-[85vh] max-h-[600px]" onKeyDown={handleKeyDown}>
                <SheetHeader>
                    <SheetTitle>
                        วิธีใช้ยา {medicineName && <span className="text-muted-foreground font-normal">— {medicineName}</span>}
                        {isForeignPatient && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                🌐 Foreign Patient
                            </span>
                        )}
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-4 space-y-4">
                    {/* Language Selector - Sprint 3B: No 'auto' option */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium">🏷️ ภาษาฉลาก:</span>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setLang('th')}
                                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${lang === 'th'
                                    ? 'bg-primary text-white'
                                    : 'bg-white border hover:bg-gray-100'
                                    }`}
                            >
                                🇹🇭 ไทย
                            </button>
                            <button
                                type="button"
                                onClick={() => setLang('en')}
                                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${lang === 'en'
                                    ? 'bg-primary text-white'
                                    : 'bg-white border hover:bg-gray-100'
                                    }`}
                            >
                                🇺🇸 English
                            </button>
                        </div>
                    </div>

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
                                        onClick={() => handlePresetClick(item.text)}
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
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                            {lang === 'en' ? '📝 Quick presets' : '📝 เลือกด่วน'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {presets.map((preset) => (
                                <button
                                    key={preset}
                                    type="button"
                                    onClick={() => handlePresetClick(preset)}
                                    className={`px-3 py-2 text-xs rounded-full transition-colors min-h-[44px] ${lang === 'en'
                                            ? 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                        }`}
                                >
                                    {preset}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Textarea */}
                    <div className="space-y-2">
                        <Label className="font-semibold">
                            {lang === 'en' ? '🇺🇸 Directions (English)' : '🇹🇭 วิธีใช้ยา (ภาษาไทย)'}
                        </Label>
                        <Textarea
                            ref={textareaRef}
                            value={draftInstruction}
                            onChange={(e) => setDraftInstruction(e.target.value)}
                            placeholder={lang === 'en'
                                ? 'Type dosage directions (e.g., 1 drop to each eye, twice daily)…'
                                : 'พิมพ์วิธีใช้ยา หรือเลือกจาก preset…'
                            }
                            className="min-h-[120px] resize-none text-base"
                            rows={4}
                        />

                        {/* Counter + Badge */}
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                                {charCount} {lang === 'en' ? 'characters' : 'ตัวอักษร'}
                            </span>
                            {charCount > 0 && (
                                <span className={`px-2 py-0.5 rounded ${badge.color}`}>
                                    {lang === 'en'
                                        ? (charCount <= 50 ? 'Short ✓' : charCount <= 80 ? 'Medium' : 'Long - may wrap')
                                        : badge.label
                                    }
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
