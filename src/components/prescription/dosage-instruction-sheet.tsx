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

// Preset dosage instructions สำหรับคลินิกตา
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

// English presets for foreign patients
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

type LabelLanguage = 'auto' | 'th' | 'en'

type DosageInstructionSheetProps = {
    open: boolean
    instructionTh: string
    instructionEn: string
    labelLanguage: LabelLanguage  // ภาษาพิมพ์ฉลากปัจจุบัน
    medicineName?: string
    isForeignPatient: boolean  // true = show EN input prominently
    onSave: (textTh: string, textEn: string, labelLang: LabelLanguage) => void
    onClose: () => void
    previousInstructionTh?: string
    previousInstructionEn?: string
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
    instructionTh,
    instructionEn,
    labelLanguage: initialLabelLang,
    medicineName,
    isForeignPatient,
    onSave,
    onClose,
    previousInstructionTh = '',
    previousInstructionEn = '',
}: DosageInstructionSheetProps) {
    const [draftTh, setDraftTh] = useState(instructionTh)
    const [draftEn, setDraftEn] = useState(instructionEn)
    const [labelLang, setLabelLang] = useState<LabelLanguage>(initialLabelLang)
    const textareaThRef = useRef<HTMLTextAreaElement>(null)
    const textareaEnRef = useRef<HTMLTextAreaElement>(null)
    const { recent, addRecent } = useRecentInstructions()

    // Reset draft when sheet opens with new instruction
    useEffect(() => {
        if (open) {
            /* eslint-disable react-hooks/set-state-in-effect -- Intentional: sync draft from props when sheet opens */
            setDraftTh(instructionTh)
            setDraftEn(instructionEn)
            setLabelLang(initialLabelLang)
            /* eslint-enable react-hooks/set-state-in-effect */
            // Focus the appropriate textarea after sheet animation
            setTimeout(() => {
                if (isForeignPatient) {
                    textareaEnRef.current?.focus()
                } else {
                    textareaThRef.current?.focus()
                }
            }, 100)
        }
    }, [open, instructionTh, instructionEn, initialLabelLang, isForeignPatient])

    // Define handlers first (before useCallback that uses them)
    const handleSave = useCallback(() => {
        const trimmedTh = draftTh.trim()
        const trimmedEn = draftEn.trim()
        // Add both to recent (if not empty)
        if (trimmedTh) addRecent(trimmedTh)
        if (trimmedEn) addRecent(trimmedEn)
        onSave(trimmedTh, trimmedEn, labelLang)
        onClose()
    }, [draftTh, draftEn, labelLang, addRecent, onSave, onClose])

    const handleCancel = useCallback(() => {
        setDraftTh(instructionTh)  // Reset draft
        setDraftEn(instructionEn)
        onClose()
    }, [instructionTh, instructionEn, onClose])

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

    const handleChipClickTh = (text: string) => {
        setDraftTh(text)  // Replace mode
    }

    const handleChipClickEn = (text: string) => {
        setDraftEn(text)  // Replace mode
    }

    const handleCopyPrevious = () => {
        if (previousInstructionTh?.trim()) {
            setDraftTh(previousInstructionTh.trim())
        }
        if (previousInstructionEn?.trim()) {
            setDraftEn(previousInstructionEn.trim())
        }
        toast.success('คัดลอกแล้ว')
    }

    const canCopyPrevious = !!(previousInstructionTh?.trim() || previousInstructionEn?.trim())
    const charCountTh = draftTh.length
    const charCountEn = draftEn.length
    const badgeTh = getLengthBadge(charCountTh)
    const badgeEn = getLengthBadge(charCountEn)

    return (
        <Sheet open={open} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
            <SheetContent side="bottom" className="h-[90vh] max-h-[700px]" onKeyDown={handleKeyDown}>
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
                    {/* Language Selector */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium">🏷️ ภาษาพิมพ์ฉลาก:</span>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setLabelLang('auto')}
                                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${labelLang === 'auto'
                                        ? 'bg-primary text-white'
                                        : 'bg-white border hover:bg-gray-100'
                                    }`}
                            >
                                🔄 อัตโนมัติ
                            </button>
                            <button
                                type="button"
                                onClick={() => setLabelLang('th')}
                                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${labelLang === 'th'
                                        ? 'bg-primary text-white'
                                        : 'bg-white border hover:bg-gray-100'
                                    }`}
                            >
                                🇹🇭 ไทย
                            </button>
                            <button
                                type="button"
                                onClick={() => setLabelLang('en')}
                                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${labelLang === 'en'
                                        ? 'bg-primary text-white'
                                        : 'bg-white border hover:bg-gray-100'
                                    }`}
                            >
                                🇺🇸 English
                            </button>
                        </div>
                    </div>

                    {labelLang === 'auto' && (
                        <p className="text-xs text-muted-foreground -mt-2">
                            💡 อัตโนมัติ: ใช้ภาษา{isForeignPatient ? 'อังกฤษ' : 'ไทย'}ตามสัญชาติผู้ป่วย
                        </p>
                    )}

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
                                        onClick={() => {
                                            // Auto-detect language and set appropriate field
                                            const isEnglish = /^[a-zA-Z0-9\s.,\-()]+$/.test(item.text)
                                            if (isEnglish) {
                                                handleChipClickEn(item.text)
                                            } else {
                                                handleChipClickTh(item.text)
                                            }
                                        }}
                                        className="px-3 py-2 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full transition-colors min-h-[44px]"
                                    >
                                        {item.text.length > 40 ? item.text.slice(0, 40) + '...' : item.text}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* === Thai Section (show first only for Thai patients) === */}
                    {!isForeignPatient && (
                        <div className="space-y-3 border rounded-lg p-4 bg-white">
                            <div className="flex items-center gap-2">
                                <Label className="font-semibold">🇹🇭 วิธีใช้ยา (ภาษาไทย)</Label>
                            </div>

                            {/* Thai Preset chips */}
                            <div className="flex flex-wrap gap-2">
                                {DOSAGE_PRESETS_TH.map((preset) => (
                                    <button
                                        key={preset}
                                        type="button"
                                        onClick={() => handleChipClickTh(preset)}
                                        className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors min-h-[44px]"
                                    >
                                        {preset}
                                    </button>
                                ))}
                            </div>

                            {/* Thai Textarea */}
                            <Textarea
                                ref={textareaThRef}
                                value={draftTh}
                                onChange={(e) => setDraftTh(e.target.value)}
                                placeholder="พิมพ์วิธีใช้ยา หรือเลือกจาก preset…"
                                className="min-h-[100px] resize-none text-base"
                                rows={3}
                            />

                            {/* Counter + Badge */}
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">
                                    {charCountTh} ตัวอักษร
                                </span>
                                {charCountTh > 0 && (
                                    <span className={`px-2 py-0.5 rounded ${badgeTh.color}`}>
                                        {badgeTh.label}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* === English Section (show prominently for foreign patients) === */}
                    {isForeignPatient && (
                        <div className="space-y-3 border-2 border-blue-200 rounded-lg p-4 bg-blue-50/30">
                            <div className="flex items-center gap-2">
                                <Label className="font-semibold text-blue-700">🇺🇸 Directions (English) — Primary for foreign patient</Label>
                            </div>

                            {/* English Preset chips */}
                            <div className="flex flex-wrap gap-2">
                                {DOSAGE_PRESETS_EN.map((preset) => (
                                    <button
                                        key={preset}
                                        type="button"
                                        onClick={() => handleChipClickEn(preset)}
                                        className="px-3 py-2 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full transition-colors min-h-[44px]"
                                    >
                                        {preset}
                                    </button>
                                ))}
                            </div>

                            {/* English Textarea */}
                            <Textarea
                                ref={textareaEnRef}
                                value={draftEn}
                                onChange={(e) => setDraftEn(e.target.value)}
                                placeholder="Type dosage directions (e.g., 1 drop to each eye, twice daily)…"
                                className="min-h-[100px] resize-none text-base"
                                rows={3}
                            />

                            {/* Counter + Badge */}
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">
                                    {charCountEn} characters
                                </span>
                                {charCountEn > 0 && (
                                    <span className={`px-2 py-0.5 rounded ${badgeEn.color}`}>
                                        {charCountEn <= 50 ? 'Short ✓' : charCountEn <= 80 ? 'Medium' : 'Long - may wrap'}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* === Secondary language section (collapsible) === */}
                    {isForeignPatient && (
                        <details className="border rounded-lg p-4 bg-gray-50/50">
                            <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                                🇹🇭 วิธีใช้ยา (ไทย) — Optional
                            </summary>
                            <div className="mt-3 space-y-2">
                                <div className="flex flex-wrap gap-2">
                                    {DOSAGE_PRESETS_TH.slice(0, 5).map((preset) => (
                                        <button
                                            key={preset}
                                            type="button"
                                            onClick={() => handleChipClickTh(preset)}
                                            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors"
                                        >
                                            {preset}
                                        </button>
                                    ))}
                                </div>
                                <Textarea
                                    value={draftTh}
                                    onChange={(e) => setDraftTh(e.target.value)}
                                    placeholder="พิมพ์วิธีใช้ยา (ถ้าต้องการ)…"
                                    className="min-h-[80px] resize-none text-sm"
                                    rows={2}
                                />
                            </div>
                        </details>
                    )}

                    {!isForeignPatient && (
                        <details className="border rounded-lg p-4 bg-blue-50/30">
                            <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                                🇺🇸 Directions (English) — Optional
                            </summary>
                            <div className="mt-3 space-y-2">
                                <div className="flex flex-wrap gap-2">
                                    {DOSAGE_PRESETS_EN.slice(0, 5).map((preset) => (
                                        <button
                                            key={preset}
                                            type="button"
                                            onClick={() => handleChipClickEn(preset)}
                                            className="px-2 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full transition-colors"
                                        >
                                            {preset}
                                        </button>
                                    ))}
                                </div>
                                <Textarea
                                    value={draftEn}
                                    onChange={(e) => setDraftEn(e.target.value)}
                                    placeholder="Type directions in English (optional)…"
                                    className="min-h-[80px] resize-none text-sm"
                                    rows={2}
                                />
                            </div>
                        </details>
                    )}
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
