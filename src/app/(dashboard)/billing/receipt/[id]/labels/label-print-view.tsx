'use client'

import { useState } from 'react'
import { CLINIC_CONFIG, formatPatientId, formatThaiDate } from '@/lib/clinic-config'

type LabelItem = {
    id: string
    quantity: number
    dosage_instruction: string | null
    note: string | null  // แพทย์พิมพ์วิธีใช้
    medicine?: {
        name: string
        unit: string
        description?: string | null
    } | null
}

type Transaction = {
    id: string
    receipt_no: string
    paid_at: string
    patient?: {
        hn: string
        name: string
    } | null
    items?: LabelItem[]
}

type LabelPrintViewProps = {
    transaction: Transaction
}

export function LabelPrintView({ transaction }: LabelPrintViewProps) {
    // Filter only medicine items (not procedures)
    const medicineItems = (transaction.items || []).filter(item => item.medicine)

    // State for checkbox selection
    const [selectedIds, setSelectedIds] = useState<Set<string>>(
        new Set(medicineItems.map(item => item.id))
    )

    // Items with missing dosage instruction
    const itemsWithoutDosage = medicineItems.filter(
        item => !item.dosage_instruction && selectedIds.has(item.id)
    )

    const toggleItem = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next
        })
    }

    const selectAll = () => {
        setSelectedIds(new Set(medicineItems.map(item => item.id)))
    }

    const clearAll = () => {
        setSelectedIds(new Set())
    }

    const handlePrint = () => {
        window.print()
    }

    const selectedItems = medicineItems.filter(item => selectedIds.has(item.id))

    return (
        <>
            {/* Print Styles - 10×7.5 cm Thermal Label (Sprint 3A) */}
            <style jsx global>{`
                @media print {
                    @page {
                        size: 100mm 75mm;
                        margin: 3mm;
                    }

                    body {
                        margin: 0;
                        padding: 0;
                    }

                    .no-print {
                        display: none !important;
                    }

                    .label-container {
                        page-break-after: always;
                    }

                    .label-container:last-child {
                        page-break-after: avoid;
                    }
                }

                @media screen {
                    .label-container {
                        width: 100mm;
                        height: 75mm;
                        border: 1px dashed #ccc;
                        margin: 10px auto;
                        padding: 3mm;
                        background: white;
                        box-sizing: border-box;
                    }
                }
            `}</style>

            {/* Control Panel */}
            <div className="no-print bg-gray-100 min-h-screen p-6">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h1 className="text-xl font-bold mb-4">🏷️ พิมพ์ฉลากยา</h1>

                        <div className="text-sm text-muted-foreground mb-4">
                            <p>ใบเสร็จ: <strong>{transaction.receipt_no}</strong></p>
                            <p>ผู้ป่วย: <strong>{transaction.patient?.name}</strong> ({formatPatientId(transaction.patient?.hn || '')})</p>
                        </div>

                        {/* Dosage Warning */}
                        {itemsWithoutDosage.length > 0 && (
                            <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 mb-4">
                                <p className="text-amber-800 font-medium">⚠️ ยังไม่ได้กรอกวิธีใช้ยา:</p>
                                <ul className="text-sm text-amber-700 mt-1 list-disc list-inside">
                                    {itemsWithoutDosage.map(item => (
                                        <li key={item.id}>{item.medicine?.name}</li>
                                    ))}
                                </ul>
                                <p className="text-xs text-amber-600 mt-2">
                                    (สามารถพิมพ์ได้ แต่ช่องวิธีใช้จะว่าง)
                                </p>
                            </div>
                        )}

                        {/* Selection */}
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">เลือกรายการที่ต้องการพิมพ์:</span>
                                <div className="space-x-2">
                                    <button
                                        onClick={selectAll}
                                        className="text-sm text-primary hover:underline"
                                    >
                                        เลือกทั้งหมด
                                    </button>
                                    <span className="text-muted-foreground">|</span>
                                    <button
                                        onClick={clearAll}
                                        className="text-sm text-primary hover:underline"
                                    >
                                        ล้างทั้งหมด
                                    </button>
                                </div>
                            </div>

                            <div className="border rounded-lg divide-y max-h-60 overflow-y-auto">
                                {medicineItems.map(item => (
                                    <label
                                        key={item.id}
                                        className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(item.id)}
                                            onChange={() => toggleItem(item.id)}
                                            className="w-4 h-4"
                                        />
                                        <div className="flex-1">
                                            <div className="font-medium">{item.medicine?.name}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {item.quantity} {item.medicine?.unit}
                                                {!item.dosage_instruction && (
                                                    <span className="text-amber-600 ml-2">⚠️ ไม่มีวิธีใช้</span>
                                                )}
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Page hint */}
                        <p className="text-sm text-muted-foreground mb-4">
                            🏷️ รายการยา {selectedIds.size} รายการ → พิมพ์ {selectedIds.size} แผ่น (10×7.5 ซม.)
                        </p>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={handlePrint}
                                disabled={selectedIds.size === 0}
                                className="flex-1 bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                🖨️ พิมพ์ฉลากยา ({selectedIds.size} รายการ)
                            </button>
                            <button
                                onClick={() => window.history.back()}
                                className="px-4 py-3 border rounded-lg hover:bg-gray-50"
                            >
                                ← ย้อนกลับ
                            </button>
                        </div>
                    </div>

                    {/* Preview */}
                    <h2 className="text-lg font-semibold mb-4 text-center">ตัวอย่างฉลาก</h2>
                </div>

                {/* Labels Preview */}
                <div className="flex flex-col items-center gap-6 pb-10">
                    {selectedItems.map(item => (
                        <LabelTemplate
                            key={item.id}
                            item={item}
                            patient={transaction.patient}
                            paidAt={transaction.paid_at}
                        />
                    ))}
                </div>
            </div>

            {/* Print Area - Hidden on screen, visible on print */}
            <div className="hidden print:block">
                {selectedItems.map(item => (
                    <LabelTemplate
                        key={item.id}
                        item={item}
                        patient={transaction.patient}
                        paidAt={transaction.paid_at}
                    />
                ))}
            </div>
        </>
    )
}

// Individual Label Template (matches the sample provided)
function LabelTemplate({
    item,
    patient,
    paidAt,
}: {
    item: LabelItem
    patient?: { hn: string; name: string } | null
    paidAt: string
}) {
    return (
        <div className="label-container">
            {/* Header - ชื่อคลินิกเป็นสีดำ */}
            <div className="text-center mb-4">
                <h1 className="text-xl font-bold text-gray-900">{CLINIC_CONFIG.name}</h1>
                <p className="text-sm">({CLINIC_CONFIG.fullName})</p>
                <p className="text-xs text-gray-600">{CLINIC_CONFIG.address}</p>
                <p className="text-xs text-gray-600">โทรศัพท์ {CLINIC_CONFIG.phone}</p>
            </div>

            {/* Divider */}
            <hr className="border-gray-300 mb-3" />

            {/* Patient Info */}
            <div className="flex justify-between text-sm mb-3">
                <span>{formatPatientId(patient?.hn || '')}</span>
                <span>วันที่ {formatThaiDate(paidAt)}</span>
            </div>
            <p className="text-sm mb-4">
                ชื่อ : {patient?.name || '-'}
            </p>

            {/* Medicine Info */}
            <div className="space-y-3">
                <p className="text-sm">
                    <span className="font-medium">ชื่อยา : </span>
                    <span className="font-bold">{item.medicine?.name}</span>
                </p>

                <p className="text-sm">
                    <span className="font-medium">วิธีใช้ : </span>
                    <span className="ml-4">{item.dosage_instruction || item.note || '-'}</span>
                </p>

                <p className="text-sm">
                    <span className="font-medium">สรรพคุณ : </span>
                    {item.medicine?.description || '-'}
                </p>

                <p className="text-sm text-gray-600">
                    {CLINIC_CONFIG.expiryNote}
                </p>
            </div>
        </div>
    )
}
