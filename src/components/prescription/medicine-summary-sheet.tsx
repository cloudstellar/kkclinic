'use client'

import { formatPatientId, formatDate } from '@/lib/clinic-config'
import { getDisplayName } from '@/lib/patient-utils'

type SummaryItem = {
    id: string
    quantity: number
    dosage_original: string | null
    medicine?: {
        name: string
        unit: string
    } | null
}

type MedicineSummarySheetProps = {
    prescriptionNo: string
    prescriptionNote: string | null
    createdAt: string
    patient: {
        hn: string
        name: string
        name_en?: string | null
        nationality?: string | null
    } | null | undefined
    items: SummaryItem[]
    // Sprint 3C: Doctor Fee
    df?: number
    dfNote?: string | null
}

const ITEMS_PER_PAGE = 6

// Chunk items into pages
function chunkItems<T>(items: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < items.length; i += size) {
        chunks.push(items.slice(i, i + size))
    }
    return chunks
}

export function MedicineSummarySheet({
    prescriptionNo,
    prescriptionNote,
    createdAt,
    patient,
    items,
    df,
    dfNote,
}: MedicineSummarySheetProps) {
    const pages = chunkItems(items, ITEMS_PER_PAGE)
    const totalPages = pages.length
    const totalItems = items.length

    // Parse date/time
    const date = formatDate(createdAt, 'th')
    const time = new Date(createdAt).toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    })

    const patientName = patient
        ? getDisplayName({
            name: patient.name || null,
            name_en: patient.name_en || null,
            nationality: patient.nationality || 'thai',
        })
        : '-'

    return (
        <>
            {pages.map((pageItems, pageIndex) => (
                <div key={pageIndex} className="summary-page">
                    {/* Header */}
                    <div className="summary-header">
                        <div className="text-center text-xs font-medium">
                            ตาใสใส คลินิก — ใบสรุปรายการยา (Internal)
                        </div>
                        <div className="text-[10px] text-gray-600 mt-0.5">
                            {prescriptionNo} | {date} {time} | {totalItems} รายการ
                        </div>
                        <div className="text-[10px] mt-0.5">
                            {formatPatientId(patient?.hn || '')} ชื่อ : {patientName}
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-400 my-1" />

                    {/* Items */}
                    <div className="summary-items">
                        {/* Sprint 3C: DF as first item on first page (no checkbox) */}
                        {pageIndex === 0 && df && df > 0 && (
                            <div className="summary-item">
                                <div className="flex items-start gap-1.5 text-[11px]">
                                    <span className="font-medium flex-1">
                                        ค่าธรรมเนียมแพทย์ (Doctor Fee)
                                    </span>
                                    <span className="text-gray-600 whitespace-nowrap">
                                        ฿{df.toLocaleString()}
                                    </span>
                                </div>
                                {dfNote && (
                                    <div className="text-[10px] text-gray-600">
                                        {dfNote}
                                    </div>
                                )}
                            </div>
                        )}
                        {pageItems.map((item) => (
                            <div key={item.id} className="summary-item">
                                <div className="flex items-start gap-1.5 text-[11px]">
                                    <span className="inline-block w-3 h-3 border border-gray-400 rounded-sm flex-shrink-0 mt-0.5" />
                                    <span className="font-medium flex-1">
                                        {item.medicine?.name}
                                    </span>
                                    <span className="text-gray-600 whitespace-nowrap">
                                        {item.quantity} {item.medicine?.unit}
                                    </span>
                                </div>
                                <div className="ml-4.5 text-[10px] text-gray-600 pl-4">
                                    {item.dosage_original || '-'}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="summary-footer">
                        <div className="flex justify-between items-end text-[9px] text-gray-500">
                            <div className="flex-1">
                                หมายเหตุ: {prescriptionNote || '_'.repeat(20)}
                            </div>
                            <div>
                                หน้า {pageIndex + 1}/{totalPages}
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Print styles for summary sheet */}
            <style jsx>{`
                .summary-page {
                    width: 94mm;
                    height: 69mm;
                    padding: 3mm;
                    background: white;
                    border: 1px solid #333;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                    page-break-after: always;
                    font-family: 'Noto Sans Thai', sans-serif;
                }

                .summary-page:last-child {
                    page-break-after: avoid;
                }

                .summary-header {
                    flex-shrink: 0;
                }

                .summary-items {
                    flex: 1;
                    overflow: hidden;
                }

                .summary-item {
                    margin-bottom: 2mm;
                }

                .summary-footer {
                    flex-shrink: 0;
                    border-top: 1px dashed #999;
                    padding-top: 1mm;
                    margin-top: auto;
                }

                @media screen {
                    .summary-page {
                        width: 100mm;
                        height: 75mm;
                        margin: 10px auto;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                }
            `}</style>
        </>
    )
}
