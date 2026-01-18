'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

// Date presets for quick selection
const presets = [
    { label: 'วันนี้', getValue: () => ({ from: today(), to: today() }) },
    { label: 'เมื่อวาน', getValue: () => ({ from: yesterday(), to: yesterday() }) },
    { label: '7 วันล่าสุด', getValue: () => ({ from: daysAgo(6), to: today() }) },
    { label: 'เดือนนี้', getValue: () => ({ from: startOfMonth(), to: today() }) },
    { label: 'เดือนที่แล้ว', getValue: () => ({ from: startOfLastMonth(), to: endOfLastMonth() }) },
]

function today() {
    return new Date().toISOString().slice(0, 10)
}

function yesterday() {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    return d.toISOString().slice(0, 10)
}

function daysAgo(n: number) {
    const d = new Date()
    d.setDate(d.getDate() - n)
    return d.toISOString().slice(0, 10)
}

function startOfMonth() {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10)
}

function startOfLastMonth() {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth() - 1, 1).toISOString().slice(0, 10)
}

function endOfLastMonth() {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 0).toISOString().slice(0, 10)
}

export function DateRangeFilter({ dateFrom, dateTo }: { dateFrom: string; dateTo: string }) {
    const router = useRouter()
    const searchParams = useSearchParams()

    function navigate(from: string, to: string) {
        const params = new URLSearchParams(searchParams.toString())
        params.set('from', from)
        params.set('to', to)
        router.push(`/billing/summary?${params.toString()}`)
    }

    function handlePreset(preset: typeof presets[0]) {
        const { from, to } = preset.getValue()
        navigate(from, to)
    }

    function handleFromChange(e: React.ChangeEvent<HTMLInputElement>) {
        navigate(e.target.value, dateTo)
    }

    function handleToChange(e: React.ChangeEvent<HTMLInputElement>) {
        navigate(dateFrom, e.target.value)
    }

    // Check if current selection matches a preset
    const activePreset = presets.find(p => {
        const { from, to } = p.getValue()
        return from === dateFrom && to === dateTo
    })

    return (
        <div className="space-y-4 mb-6">
            {/* Preset Buttons */}
            <div className="flex flex-wrap gap-2">
                {presets.map((preset) => (
                    <button
                        key={preset.label}
                        onClick={() => handlePreset(preset)}
                        className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${activePreset?.label === preset.label
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white hover:bg-gray-50'
                            }`}
                    >
                        {preset.label}
                    </button>
                ))}
            </div>

            {/* Custom Date Range */}
            <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">กำหนดเอง:</span>
                <input
                    type="date"
                    value={dateFrom}
                    onChange={handleFromChange}
                    className="px-3 py-1.5 border rounded-lg"
                />
                <span>ถึง</span>
                <input
                    type="date"
                    value={dateTo}
                    onChange={handleToChange}
                    className="px-3 py-1.5 border rounded-lg"
                />
            </div>
        </div>
    )
}

export function CopyToClipboard({ text }: { text: string }) {
    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(text)
            toast.success('คัดลอกแล้ว')
        } catch {
            toast.error('ไม่สามารถคัดลอกได้')
        }
    }

    return (
        <button
            onClick={handleCopy}
            className="px-3 py-1 text-sm border rounded-md hover:bg-gray-50"
            title="คัดลอกยอดสรุป"
        >
            📋 คัดลอก
        </button>
    )
}

type PrintMode = 'summary' | 'detail'

export function PrintOptionsDropdown({
    onPrint,
    onExportCSV,
    transactionCount
}: {
    onPrint: (mode: PrintMode) => void
    onExportCSV: () => void
    transactionCount: number
}) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="relative print:hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2"
            >
                🖨️ พิมพ์/ส่งออก
                <span className="text-xs">▼</span>
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-20">
                        <div className="p-2">
                            <div className="text-xs text-muted-foreground px-2 py-1">พิมพ์</div>

                            <button
                                onClick={() => { onPrint('summary'); setIsOpen(false) }}
                                className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 flex items-center gap-2"
                            >
                                <span>📊</span>
                                <div>
                                    <div className="font-medium">สรุปปิดยอด</div>
                                    <div className="text-xs text-muted-foreground">1 หน้า - ยอดรวมเท่านั้น</div>
                                </div>
                            </button>

                            <button
                                onClick={() => { onPrint('detail'); setIsOpen(false) }}
                                className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 flex items-center gap-2"
                            >
                                <span>🧾</span>
                                <div>
                                    <div className="font-medium">รายละเอียดรายการ</div>
                                    <div className="text-xs text-muted-foreground">
                                        ยอดรวม + รายการทั้งหมด ({transactionCount})
                                    </div>
                                </div>
                            </button>
                        </div>

                        <div className="border-t p-2">
                            <div className="text-xs text-muted-foreground px-2 py-1">ส่งออก</div>

                            <button
                                onClick={() => { onExportCSV(); setIsOpen(false) }}
                                className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 flex items-center gap-2"
                            >
                                <span>📤</span>
                                <div>
                                    <div className="font-medium">Export CSV</div>
                                    <div className="text-xs text-muted-foreground">
                                        ดาวน์โหลดไฟล์ Excel
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

// Helper to set print mode on document
export function usePrintMode() {
    const [printMode, setPrintMode] = useState<PrintMode | null>(null)

    const handlePrint = (mode: PrintMode) => {
        setPrintMode(mode)
        // Wait for state to update before printing
        setTimeout(() => {
            window.print()
            setPrintMode(null)
        }, 100)
    }

    return { printMode, handlePrint }
}
