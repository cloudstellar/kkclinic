'use client'

import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'

// Preset dosage instructions สำหรับคลินิกตา
const DOSAGE_PRESETS = {
    oral: [
        'หลังอาหาร เช้า-กลางวัน-เย็น',
        'หลังอาหาร เช้า-เย็น',
        'ก่อนนอน 1 เม็ด',
        'ทุก 6 ชั่วโมง',
        'ทุก 8 ชั่วโมง',
        'ทุก 12 ชั่วโมง',
    ],
    eyeDrop: [
        'หยอดตา 1 หยด วันละ 2 ครั้ง (เช้า-เย็น)',
        'หยอดตา 1 หยด วันละ 4 ครั้ง',
        'หยอดตา 1 หยด วันละ 6 ครั้ง',
        'หยอดตา ทุก 1 ชม. (ช่วงตื่น)',
        'หยอดตา ข้างขวา 1 หยด วันละ 4 ครั้ง',
        'หยอดตา ข้างซ้าย 1 หยด วันละ 4 ครั้ง',
        'หยอดตา ทั้งสองข้าง 1 หยด วันละ 4 ครั้ง',
    ],
    topical: [
        'ป้ายตา บาง ๆ ก่อนนอน',
        'ทาบาง ๆ เช้า-เย็น',
    ],
}

const MAX_LENGTH = 80

type DosageInputProps = {
    value: string
    onChange: (value: string) => void
    placeholder?: string
}

export function DosageInput({ value, onChange, placeholder }: DosageInputProps) {
    const [open, setOpen] = useState(false)
    const charCount = value.length
    const isOverLimit = charCount > MAX_LENGTH

    const handlePresetClick = (preset: string) => {
        onChange(preset)
        setOpen(false)
    }

    const handleClear = () => {
        onChange('')
    }

    return (
        <div className="space-y-1">
            <div className="flex gap-1">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-9 px-2 text-xs"
                        >
                            💊 เลือกวิธีใช้
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-3" align="start">
                        <div className="space-y-3">
                            {/* ยากิน */}
                            <div>
                                <p className="text-xs font-medium text-muted-foreground mb-2">💊 ยากิน</p>
                                <div className="flex flex-wrap gap-1">
                                    {DOSAGE_PRESETS.oral.map((preset) => (
                                        <button
                                            key={preset}
                                            type="button"
                                            onClick={() => handlePresetClick(preset)}
                                            className="px-2 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full transition-colors"
                                        >
                                            {preset}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* ยาหยอดตา */}
                            <div>
                                <p className="text-xs font-medium text-muted-foreground mb-2">👁️ ยาหยอดตา</p>
                                <div className="flex flex-wrap gap-1">
                                    {DOSAGE_PRESETS.eyeDrop.map((preset) => (
                                        <button
                                            key={preset}
                                            type="button"
                                            onClick={() => handlePresetClick(preset)}
                                            className="px-2 py-1 text-xs bg-green-50 hover:bg-green-100 text-green-700 rounded-full transition-colors"
                                        >
                                            {preset}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* ยาทา/ป้าย */}
                            <div>
                                <p className="text-xs font-medium text-muted-foreground mb-2">🧴 ยาทา/ป้ายตา</p>
                                <div className="flex flex-wrap gap-1">
                                    {DOSAGE_PRESETS.topical.map((preset) => (
                                        <button
                                            key={preset}
                                            type="button"
                                            onClick={() => handlePresetClick(preset)}
                                            className="px-2 py-1 text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-full transition-colors"
                                        >
                                            {preset}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>

                <Textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder || 'พิมพ์วิธีใช้ยา หรือเลือกจาก preset'}
                    className="min-h-[60px] py-2 resize-none flex-1"
                    rows={2}
                />

                {value && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleClear}
                        className="h-9 px-2 text-muted-foreground hover:text-red-500"
                    >
                        ✕
                    </Button>
                )}
            </div>

            {/* Character counter */}
            <div className={`text-xs ${isOverLimit ? 'text-red-500' : 'text-muted-foreground'}`}>
                {charCount > 0 && (
                    <>
                        {charCount}/{MAX_LENGTH} ตัวอักษร
                        {isOverLimit && ' ⚠️ อาจยาวเกินฉลาก'}
                    </>
                )}
            </div>
        </div>
    )
}
