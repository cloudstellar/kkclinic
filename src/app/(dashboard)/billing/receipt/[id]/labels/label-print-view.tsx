'use client'

import { useState } from 'react'
import { formatPatientId, formatDate } from '@/lib/clinic-config'
import { getDisplayName } from '@/lib/patient-utils'
import { getLabelLang, LABEL_TRANSLATIONS, DEFAULT_EXPIRY_NOTE } from '@/lib/label-translations'
import { MedicineSummarySheet } from '@/components/prescription/medicine-summary-sheet'

type LabelItem = {
    id: string
    quantity: number
    // Sprint 3B: Smart Dosage fields (Option A: Single Snapshot)
    dosage_original: string | null     // Raw shorthand from doctor
    dosage_instruction: string | null  // Snapshot in patient language
    dosage_language: 'th' | 'en' | null  // Language of snapshot
    note: string | null
    medicine?: {
        name: string
        name_en?: string | null
        unit: string
        description?: string | null
        description_en?: string | null
        expiry_note_th?: string | null
        expiry_note_en?: string | null
    } | null
}

type Transaction = {
    id: string
    receipt_no: string
    paid_at: string
    patient?: {
        hn: string
        name: string
        name_en?: string | null
        nationality?: string | null
    } | null
    // M7: Prescription data for summary sheet
    prescription?: {
        id: string
        prescription_no: string
        note: string | null
        created_at?: string
        // Sprint 3C: Doctor Fee
        df?: number
        df_note?: string
    } | null
    items?: LabelItem[]
}

type LabelPrintViewProps = {
    transaction: Transaction
}

export function LabelPrintView({ transaction }: LabelPrintViewProps) {
    // Filter only medicine items (not procedures)
    const medicineItems = (transaction.items || []).filter(item => item.medicine)

    const [selectedIds, setSelectedIds] = useState<Set<string>>(
        new Set(medicineItems.map(item => item.id))
    )

    // M7: Print summary sheet option (default: true)
    const [printSummary, setPrintSummary] = useState(true)

    // Items without dosage instruction (warning)
    const itemsWithoutDosage = medicineItems.filter(item =>
        !item.dosage_instruction && !item.note
    )

    const toggleItem = (id: string) => {
        const newSelected = new Set(selectedIds)
        if (newSelected.has(id)) {
            newSelected.delete(id)
        } else {
            newSelected.add(id)
        }
        setSelectedIds(newSelected)
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
            {/* Print Styles - 10×7.5 cm Thermal Label */}
            <style jsx global>{`
                @media print {
                    @page {
                        size: 100mm 75mm;
                        margin: 0;
                    }

                    /* Hide everything by default (strips navbar, sidebar, etc) */
                    body * {
                        visibility: hidden;
                    }

                    /* Show only print container and its children */
                    .print-container,
                    .print-container * {
                        visibility: visible;
                    }

                    /* Position print container at top-left of page */
                    .print-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100mm;
                        min-height: 75mm;
                        padding-top: 3mm;
                        
                        /* Layout formatting */
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: flex-start;
                    }

                    .no-print {
                        display: none !important;
                    }

                    .label-container {
                        width: 94mm;
                        max-height: 69mm;
                        padding: 4mm;
                        border: 1px solid #333;
                        background: white;
                        box-sizing: border-box;
                        page-break-after: always;
                    }

                    .label-container:last-child {
                        page-break-after: avoid;
                    }

                    /* Smaller text for print */
                    .label-container .text-xl { font-size: 12px !important; }
                    .label-container .text-sm { font-size: 9px !important; }
                    .label-container .text-xs { font-size: 7px !important; }
                    .label-container h1 { font-size: 13px !important; margin: 0 !important; }
                    .label-container p { margin: 0 !important; }
                    .label-container .space-y-1 > * + * { margin-top: 2px !important; }
                    .label-container .mb-2 { margin-bottom: 3px !important; }
                }

                @media screen {
                    .label-container {
                        width: 100mm;
                        height: 75mm;
                        border: 1px solid #333;
                        margin: 10px auto;
                        padding: 5mm;
                        background: white;
                        box-sizing: border-box;
                        /* Add shadow for better preview */
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                }
            `}</style>

            {/* Control Panel */}
            <div className="bg-gray-100 min-h-screen p-6">
                <div className="no-print max-w-2xl mx-auto">
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h1 className="text-xl font-bold mb-4">🏷️ พิมพ์ฉลากยา</h1>

                        <div className="text-sm text-muted-foreground mb-4">
                            <p>ใบเสร็จ: <strong>{transaction.receipt_no}</strong></p>
                            <p>ผู้ป่วย: <strong>{transaction.patient ? getDisplayName({
                                name: transaction.patient.name || null,
                                name_en: transaction.patient.name_en || null,
                                nationality: transaction.patient.nationality || 'thai'
                            }) : '-'}</strong> ({formatPatientId(transaction.patient?.hn || '')})</p>
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

                            <div className="space-y-2 border rounded-md p-2 max-h-60 overflow-y-auto">
                                {medicineItems.map(item => (
                                    <label key={item.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(item.id)}
                                            onChange={() => toggleItem(item.id)}
                                            className="mt-1"
                                        />
                                        <div className="text-sm">
                                            <div className="font-medium">{item.medicine?.name}</div>
                                            <div className="text-muted-foreground">
                                                จำนวน: {item.quantity} {item.medicine?.unit}
                                            </div>
                                            {item.dosage_instruction ? (
                                                <div className="text-green-600 text-xs mt-1">
                                                    วิธีใช้: {item.dosage_instruction}
                                                    {item.dosage_language === 'en' && (
                                                        <span className="ml-1 px-1 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px]">EN</span>
                                                    )}
                                                </div>
                                            ) : item.note ? (
                                                <div className="text-blue-600 text-xs mt-1">
                                                    หมายเหตุ: {item.note}
                                                </div>
                                            ) : (
                                                <div className="text-amber-600 text-xs mt-1">
                                                    - ไม่มีวิธีใช้ -
                                                </div>
                                            )}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* M7: Summary Sheet Option */}
                        <label className="flex items-center gap-2 mb-4 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={printSummary}
                                onChange={(e) => setPrintSummary(e.target.checked)}
                                className="w-4 h-4 rounded"
                            />
                            <span className="text-sm">📋 พิมพ์ใบสรุปรายการยา (Internal)</span>
                        </label>

                        <div className="flex gap-4">
                            <button
                                onClick={() => window.history.back()}
                                className="px-4 py-2 border rounded hover:bg-gray-50"
                            >
                                ← ย้อนกลับ
                            </button>
                            <button
                                onClick={handlePrint}
                                disabled={selectedIds.size === 0}
                                className="flex-1 bg-black text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                🖨️ พิมพ์{printSummary ? 'ใบสรุป + ' : ''}ฉลากยา ({selectedItems.length} รายการ)
                            </button>
                        </div>

                        <div className="mt-4 text-xs text-muted-foreground text-center">
                            <p>💡 Tip: ตั้งค่ากระดาษเป็น 100mm x 75mm ในหน้าต่างพิมพ์</p>
                        </div>
                    </div>
                </div>

                {/* Print Area */}
                <div className="print-container">
                    {/* M7: Summary Sheet (prints first) */}
                    {printSummary && transaction.prescription && (
                        <MedicineSummarySheet
                            prescriptionNo={transaction.prescription.prescription_no}
                            prescriptionNote={transaction.prescription.note}
                            createdAt={transaction.prescription.created_at || transaction.paid_at}
                            patient={transaction.patient}
                            items={selectedItems}
                            df={transaction.prescription.df}
                            dfNote={transaction.prescription.df_note}
                        />
                    )}

                    {/* Individual Labels */}
                    {selectedItems.map((item) => (
                        <LabelTemplate
                            key={item.id}
                            item={item}
                            patient={transaction.patient}
                            paidAt={transaction.paid_at}
                        />
                    ))}
                </div>
            </div>
        </>
    )
}

// Individual Label Template
function LabelTemplate({
    item,
    patient,
    paidAt,
}: {
    item: LabelItem
    patient?: { hn: string; name: string; name_en?: string | null; nationality?: string | null } | null
    paidAt: string
}) {
    // Sprint 3B: dosage_language is the single source of truth for label language
    // Fallback to patient nationality if dosage_language is not set
    const lang = item.dosage_language || getLabelLang(patient?.nationality)
    const t = LABEL_TRANSLATIONS[lang]

    return (
        <div className="label-container relative">
            {/* Header */}
            <div className="border-b border-gray-300 pb-2 mb-2">
                <div className="flex justify-between items-start">
                    <div className="text-center w-full">
                        <h1 className="text-xl font-bold text-slate-900">{t.clinicName}</h1>
                        <p className="text-[10px] text-gray-600 mt-0.5 font-medium">
                            {lang === 'th'
                                ? '(ตาใสใสคลินิกเฉพาะทางด้านเวชกรรมสาขาจักษุวิทยา)'
                                : '(Ophthalmology Clinic)'}
                        </p>
                        <p className="text-[9px] text-gray-500 leading-tight mt-0.5">
                            {lang === 'th'
                                ? '186/153 ถนน เทศบาล34 ตำบลพลา อำเภอบ้านฉาง จังหวัดระยอง'
                                : '186/153 Thetsaban 34 Rd, Phla, Ban Chang, Rayong 21130'}
                        </p>
                        <p className="text-[9px] text-gray-500">
                            {lang === 'th' ? 'โทรศัพท์' : 'Tel'} 081-776-6936
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="space-y-1.5 text-sm">
                <div className="flex justify-between items-baseline">
                    <span className="font-bold text-slate-800 text-xs">
                        {formatPatientId(patient?.hn || '')}
                    </span>
                    <span className="text-xs text-gray-500">
                        {t.date} {formatDate(paidAt, lang)}
                    </span>
                </div>

                <div>
                    <span className="font-bold mr-1">{t.patientName} :</span>
                    <span>{patient ? getDisplayName({
                        name: patient.name || null,
                        name_en: patient.name_en || null,
                        nationality: patient.nationality || 'thai'
                    }) : '-'}</span>
                </div>

                <div>
                    <span className="font-bold mr-1">{t.medicineName} :</span>
                    <span className="font-semibold">{item.medicine?.name}</span>
                </div>

                <div className="flex items-start">
                    <span className="font-bold mr-1 whitespace-nowrap">{t.directions} :</span>
                    <div className="dosage-text leading-tight">
                        {item.dosage_instruction || item.note || '-'}
                    </div>
                </div>

                {item.medicine?.description && (
                    <div className="flex items-start text-xs text-gray-600 mt-1">
                        <span className="font-bold mr-1 whitespace-nowrap">{t.indication} :</span>
                        <div className="description-text leading-tight">
                            {lang === 'en' && item.medicine.description_en
                                ? item.medicine.description_en
                                : item.medicine.description}
                        </div>
                    </div>
                )}

                {/* Expiry Note */}
                <div className="flex items-start text-xs text-gray-500 mt-1">
                    <span className="font-bold mr-1 whitespace-nowrap">{t.expiry} :</span>
                    <span>
                        {lang === 'en'
                            ? (item.medicine?.expiry_note_en || DEFAULT_EXPIRY_NOTE.en)
                            : (item.medicine?.expiry_note_th || DEFAULT_EXPIRY_NOTE.th)}
                    </span>
                </div>
            </div>

            {/* Footer - Qty */}
            <div className="absolute bottom-2 right-4 text-xs text-gray-400">
                #{item.quantity}
            </div>
        </div>
    )
}
