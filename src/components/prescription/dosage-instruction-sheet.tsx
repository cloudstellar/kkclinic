'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
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
import { translate } from '@/lib/dosage/engine'

// Sprint 3B M5: Shorthand presets
const SHORTHAND_PRESETS = [
    { label: 'bid', desc: 'วันละ 2 ครั้ง' },
    { label: 'tid', desc: 'วันละ 3 ครั้ง' },
    { label: 'qd', desc: 'วันละ 1 ครั้ง' },
    { label: 'qid', desc: 'วันละ 4 ครั้ง' },
    { label: 'HS', desc: 'ก่อนนอน' },
    { label: 'pc', desc: 'หลังอาหาร' },
    { label: 'ac', desc: 'ก่อนอาหาร' },
    { label: 'OU', desc: 'ตาทั้งสองข้าง' },
    { label: 'OD', desc: 'ตาขวา' },
    { label: 'OS', desc: 'ตาซ้าย' },
    { label: 'gtt', desc: 'หยด' },
    { label: 'tab', desc: 'เม็ด' },
    { label: 'cap', desc: 'แคปซูล' },
    { label: 'PO', desc: 'รับประทาน' },
]

type DosageInstructionSheetProps = {
    open: boolean
    dosageOriginal: string
    dosageInstruction: string
    dosageLanguage: 'th' | 'en'
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

function renderPreviewWithHighlight(text: string, unknownTokens: string[]): React.ReactNode {
    if (!text || unknownTokens.length === 0) return text
    const unknownSet = new Set(unknownTokens)
    const parts = text.split(/(\s+|[,.]+)/)

    return parts.map((part, i) =>
        unknownSet.has(part)
            ? <span key={i} className="underline decoration-wavy decoration-orange-400 text-orange-700">{part}</span>
            : part
    )
}

const OVERLAY_CLASSES = "p-3 text-sm leading-5 whitespace-pre-wrap break-words font-sans"

function OverlayPreview({
    value,
    onChange,
    highlight,
    placeholder,
    lang,
}: {
    value: string
    onChange: (v: string) => void
    highlight: React.ReactNode
    placeholder?: string
    lang: 'th' | 'en'
}) {
    // Only backRef needed for logic, frontRef removed as unnecessary
    const backRef = useRef<HTMLDivElement>(null)

    const onFrontScroll = useCallback((e: React.UIEvent<HTMLTextAreaElement>) => {
        if (!backRef.current) return
        backRef.current.scrollTop = e.currentTarget.scrollTop
    }, [])

    const defaultPlaceholder = lang === 'en'
        ? 'Label text will appear here...'
        : 'ข้อความที่จะพิมพ์บนฉลาก...'

    return (
        <div className="relative min-h-[100px] border rounded-md overflow-hidden bg-white">
            <div
                ref={backRef}
                className={`absolute inset-0 ${OVERLAY_CLASSES} pr-3 pointer-events-none overflow-auto`}
                aria-hidden="true"
            >
                {value ? highlight : null}
            </div>
            {!value && (
                <div className={`absolute inset-0 ${OVERLAY_CLASSES} pr-3 text-muted-foreground pointer-events-none`}>
                    {placeholder ?? defaultPlaceholder}
                </div>
            )}
            <Textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onScroll={onFrontScroll}
                className={`
                    relative w-full min-h-[100px] resize-none
                    ${OVERLAY_CLASSES}
                    bg-transparent text-transparent caret-black
                    focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1
                `}
                rows={3}
            />
        </div>
    )
}

/**
 * Sprint 3B M5: DosageInstructionSheet (2-Pane with Silent Feedback)
 * Robust Implementation:
 * - Uses lazy state initialization for correct mount behavior
 * - Relies on component unmount/remount for state integrity (Standard Radix)
 * - Includes 'seatbelt' close-handler to clear local flags if not unmounted
 * - Compliant with React Compiler and Lint rules (no cascading renders)
 */
export function DosageInstructionSheet(props: DosageInstructionSheetProps) {
    const {
        open,
        dosageOriginal: initialOriginal,
        dosageInstruction: initialInstruction,
        dosageLanguage: _dosageLanguage, // eslint-disable-line @typescript-eslint/no-unused-vars
        medicineName,
        isForeignPatient,
        onSave,
        onClose,
        previousDosageOriginal = '',
        previousDosageInstruction = '',
    } = props

    // 1. Lazy initialization from props
    // Renamed state to avoid collision with props and clarify intent
    const [draftOriginal, setDraftOriginal] = useState(() => initialOriginal)
    const [draftInstructionText, setDraftInstructionText] = useState(() => initialInstruction)
    const [isOverridden, setIsOverridden] = useState(false)
    const [unknownTokens, setUnknownTokens] = useState<string[]>([])
    // M5.5: Smart default based on patient nationality (can still be changed manually)
    const [lang, setLang] = useState<'th' | 'en'>(() => isForeignPatient ? 'en' : 'th')

    // Core refs logic
    const lastAutoTranslation = useRef(initialInstruction)
    const shorthandRef = useRef<HTMLTextAreaElement>(null)

    const { recent, addRecent } = useRecentInstructions()

    // 2. Safety Net: Consolidated close handler
    const closeSheet = useCallback(() => {
        setIsOverridden(false)
        setUnknownTokens([])
        onClose()
    }, [onClose])

    // Note: We rely on the natural unmount/remount lifecycle of the SheetContent
    // (default Radix behavior) to reset the rest of the state from props on open.
    // The closeSheet handler above acts as a safety net for local flags.

    const setInstructionFromEngine = useCallback((value: string) => {
        lastAutoTranslation.current = value
        setDraftInstructionText(value)
    }, [])

    const handleOriginalChange = useCallback((value: string) => {
        setDraftOriginal(value)
        setIsOverridden(false)
    }, [])

    const handleLangChange = useCallback((value: 'th' | 'en') => {
        setLang(value)
        setIsOverridden(false)
    }, [])

    const handleInstructionChange = useCallback((value: string) => {
        setDraftInstructionText(value)
        if (value !== lastAutoTranslation.current) {
            setIsOverridden(true)
            setUnknownTokens([]) // clear stale unknown tokens once doctor overrides
        }
    }, [])

    // Focus on open with cleanup
    useEffect(() => {
        if (!open) return
        const t = window.setTimeout(() => shorthandRef.current?.focus(), 50)
        return () => window.clearTimeout(t)
    }, [open])

    // Debounced translation
    useEffect(() => {
        if (!open) return

        const timer = setTimeout(() => {
            const trimmed = draftOriginal.trim()

            if (!trimmed) {
                setInstructionFromEngine('')
                setUnknownTokens([])
                return
            }

            if (!isOverridden) {
                try {
                    const result = translate(trimmed, lang)
                    const newInstruction = result.lines.join('\n') || trimmed
                    setInstructionFromEngine(newInstruction)
                    setUnknownTokens(result.unknownTokens)
                } catch {
                    setInstructionFromEngine(trimmed)
                    setUnknownTokens([])
                }
            }
        }, 300)
        return () => clearTimeout(timer)
    }, [open, draftOriginal, lang, isOverridden, setInstructionFromEngine])

    const handleSave = useCallback(() => {
        const original = draftOriginal.trim()
        const instruction = draftInstructionText.trim()

        if (original && !instruction) {
            toast.error('กรุณาระบุวิธีใช้ยา (หากมีคำสั่งแพทย์)')
            return
        }

        // M5.5: Store shorthand instead of translated text (works across languages)
        if (original) addRecent(original)
        onSave(original, instruction, lang)
        closeSheet()
    }, [draftOriginal, draftInstructionText, lang, addRecent, onSave, closeSheet])

    const handlePresetClick = useCallback((shorthand: string) => {
        handleOriginalChange(
            draftOriginal.trim() ? `${draftOriginal.trim()} ${shorthand}` : shorthand
        )
    }, [draftOriginal, handleOriginalChange])

    const handleCopyPrevious = useCallback(() => {
        if (previousDosageOriginal?.trim()) {
            handleOriginalChange(previousDosageOriginal.trim())
            if (previousDosageInstruction?.trim()) {
                const v = previousDosageInstruction.trim()
                setDraftInstructionText(v)
                lastAutoTranslation.current = v
                setIsOverridden(false) // copy previous = use snapshot, not "override"
                setUnknownTokens([])   // reset unknown tokens for clean state
            }
            toast.success('คัดลอกจากรายการก่อนหน้าแล้ว')
        }
    }, [previousDosageOriginal, previousDosageInstruction, handleOriginalChange])

    // M5.5: Recent now stores shorthand, so insert into editor (triggers translation)
    const handleRecentClick = useCallback((text: string) => {
        handleOriginalChange(text)
    }, [handleOriginalChange])

    const charCount = draftInstructionText.length
    const badge = getLengthBadge(charCount)
    const displayUnknownTokens = isOverridden ? [] : unknownTokens

    return (
        <Sheet open={open} onOpenChange={(isOpen) => !isOpen && closeSheet()}>
            <SheetContent side="bottom" className="h-[90vh] max-h-[700px]" onKeyDown={(e) => {
                if (e.key === 'Escape') {
                    e.preventDefault()
                    closeSheet()
                } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                    e.preventDefault()
                    handleSave()
                }
            }}>
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
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium">🏷️ ภาษาฉลาก:</span>
                        <div className="flex gap-2">
                            <button type="button" onClick={() => handleLangChange('th')} className={`px-3 py-1.5 rounded-md text-sm transition-colors ${lang === 'th' ? 'bg-primary text-white' : 'bg-white border hover:bg-gray-100'}`}>🇹🇭 ไทย</button>
                            <button type="button" onClick={() => handleLangChange('en')} className={`px-3 py-1.5 rounded-md text-sm transition-colors ${lang === 'en' ? 'bg-primary text-white' : 'bg-white border hover:bg-gray-100'}`}>🇺🇸 English</button>
                        </div>
                    </div>

                    {!!previousDosageOriginal?.trim() && (
                        <Button type="button" variant="outline" size="sm" onClick={handleCopyPrevious} className="h-10">📋 คัดลอกจากรายการก่อนหน้า</Button>
                    )}

                    {/* M5.5: Recent shorthand - always visible at top */}
                    {recent.length > 0 && (
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">🕐 ใช้ล่าสุด</Label>
                            <div className="flex flex-wrap gap-2">
                                {recent.slice(0, 5).map((item, idx) => (
                                    <button key={idx} type="button" onClick={() => handleRecentClick(item.text)} className="px-3 py-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full transition-colors font-mono">{item.text.length > 30 ? item.text.slice(0, 30) + '...' : item.text}</button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label className="font-semibold">📝 คำสั่งแพทย์ (Shorthand)</Label>
                        <Textarea
                            ref={shorthandRef}
                            value={draftOriginal}
                            onChange={(e) => handleOriginalChange(e.target.value)}
                            placeholder="พิมพ์ shorthand เช่น 1 gtt OU bid pc x7d"
                            className="min-h-[80px] resize-none text-base font-mono"
                            rows={2}
                        />
                        <div className="flex flex-wrap gap-1.5">
                            {SHORTHAND_PRESETS.map((preset) => (
                                <button key={preset.label} type="button" onClick={() => handlePresetClick(preset.label)} className="px-2.5 py-1.5 text-xs rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors font-mono" title={preset.desc}>{preset.label}</button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="font-semibold">🔮 ตัวอย่างฉลาก ({lang === 'en' ? 'English' : 'ภาษาไทย'})</Label>
                        <OverlayPreview
                            value={draftInstructionText}
                            onChange={handleInstructionChange}
                            highlight={renderPreviewWithHighlight(draftInstructionText, displayUnknownTokens)}
                            lang={lang}
                        />
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">{isOverridden ? '✏️ แพทย์แก้ไขข้อความเอง' : '✨ ระบบแปลอัตโนมัติ — แก้ไขได้'}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">{charCount} ตัวอักษร</span>
                                {charCount > 0 && <span className={`px-2 py-0.5 rounded ${badge.color}`}>{badge.label}</span>}
                            </div>
                        </div>
                    </div>
                </div>

                <SheetFooter className="border-t pt-4">
                    <div className="flex gap-3 w-full">
                        <Button type="button" variant="outline" onClick={closeSheet} className="flex-1 h-12 text-base">ยกเลิก</Button>
                        <Button type="button" onClick={handleSave} className="flex-1 h-12 text-base">บันทึก</Button>
                    </div>
                    <p className="text-xs text-muted-foreground text-center w-full mt-2">⌘+Enter บันทึก • Esc ยกเลิก</p>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
