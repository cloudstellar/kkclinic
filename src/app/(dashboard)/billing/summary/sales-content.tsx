'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DateRangeFilter, CopyToClipboard, PrintOptionsDropdown } from './daily-sales-client'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

type Transaction = {
    id: string
    receipt_no: string
    paid_at: string
    total_amount: number
    subtotal: number
    discount: number
    payment_method: string
    patient?: {
        id: string
        hn: string
        name: string
    }
}

type SalesSummary = {
    dateFrom: string
    dateTo: string
    transactions: Transaction[]
    count: number
    uniquePatients: number
    totalSubtotal: number
    totalAmount: number
    totalDiscount: number
    byCash: number
    byTransfer: number
    byCard: number
}

type PrintMode = 'summary' | 'detail' | null

export function DailySalesContent({
    summary,
    dateRangeText,
    dateFrom,
    dateTo,
    copyText,
    error,
}: {
    summary: SalesSummary | null
    dateRangeText: string
    dateFrom: string
    dateTo: string
    copyText: string
    error: string | null
}) {
    const [printMode, setPrintMode] = useState<PrintMode>(null)

    const handlePrint = (mode: 'summary' | 'detail') => {
        setPrintMode(mode)
        setTimeout(() => {
            window.print()
            setPrintMode(null)
        }, 100)
    }

    const handleExportCSV = () => {
        if (!summary?.transactions.length) {
            toast.error('ไม่มีข้อมูลให้ส่งออก')
            return
        }

        // Create CSV content
        const headers = ['เลขใบเสร็จ', 'วันที่', 'เวลา', 'ผู้ป่วย', 'TN', 'ยอดก่อนลด', 'ส่วนลด', 'ยอดสุทธิ', 'วิธีชำระ']
        const rows = summary.transactions.map(tx => [
            tx.receipt_no,
            new Date(tx.paid_at).toLocaleDateString('th-TH'),
            new Date(tx.paid_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
            tx.patient?.name || '-',
            tx.patient?.hn || '-',
            tx.subtotal || 0,
            tx.discount || 0,
            tx.total_amount || 0,
            tx.payment_method === 'cash' ? 'เงินสด' : tx.payment_method === 'transfer' ? 'โอน' : 'บัตร',
        ])

        // Add summary row
        rows.push([])
        rows.push(['สรุปยอด', '', '', '', '', summary.totalSubtotal, summary.totalDiscount, summary.totalAmount, ''])

        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n')

        // Add BOM for Excel UTF-8 support
        const bom = '\uFEFF'
        const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `sales_${dateFrom}_to_${dateTo}.csv`
        link.click()
        URL.revokeObjectURL(url)
        toast.success('ดาวน์โหลด CSV สำเร็จ')
    }

    return (
        <div className="p-6">
            {/* Header - Hide on print */}
            <div className="flex items-center justify-between mb-6 print:hidden">
                <div>
                    <h1 className="text-2xl font-bold">📊 สรุปยอดขาย</h1>
                    <p className="text-muted-foreground">{dateRangeText}</p>
                </div>
                <div className="flex items-center gap-2">
                    <PrintOptionsDropdown
                        onPrint={handlePrint}
                        onExportCSV={handleExportCSV}
                        transactionCount={summary?.count || 0}
                    />
                    <Link
                        href="/billing"
                        className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                    >
                        ← กลับ
                    </Link>
                </div>
            </div>

            {/* Print Header - Show only on print */}
            <div className="hidden print:block mb-6 text-center">
                <h1 className="text-xl font-bold">
                    {printMode === 'summary' ? 'สรุปปิดยอด' : 'รายงานการขาย'} - คลินิกตาใสใส
                </h1>
                <p className="text-sm">{dateRangeText}</p>
                <p className="text-xs text-gray-500">พิมพ์เมื่อ: {new Date().toLocaleString('th-TH')}</p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 print:hidden">
                    ⚠️ {error}
                </div>
            )}

            {/* Date Range Filter - Hide on print */}
            <div className="print:hidden">
                <DateRangeFilter dateFrom={dateFrom} dateTo={dateTo} />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6 print:grid-cols-3">
                <div className="rounded-lg border p-4 bg-white">
                    <div className="text-sm text-muted-foreground">รายการ</div>
                    <div className="text-2xl font-bold">{summary?.count || 0}</div>
                </div>
                <div className="rounded-lg border p-4 bg-white">
                    <div className="text-sm text-muted-foreground">ผู้ป่วย</div>
                    <div className="text-2xl font-bold">{summary?.uniquePatients || 0}</div>
                </div>
                <div className="rounded-lg border p-4 bg-white">
                    <div className="text-sm text-muted-foreground">ยอดก่อนลด</div>
                    <div className="text-xl font-semibold text-gray-700">
                        {formatCurrency(summary?.totalSubtotal || 0)}
                    </div>
                </div>
                <div className="rounded-lg border p-4 bg-green-50 border-green-200">
                    <div className="text-sm text-muted-foreground">ยอดสุทธิ</div>
                    <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(summary?.totalAmount || 0)}
                    </div>
                </div>
                <div className="rounded-lg border p-4 bg-red-50 border-red-200">
                    <div className="text-sm text-muted-foreground">ส่วนลด</div>
                    <div className="text-xl font-semibold text-red-500">
                        {formatCurrency(summary?.totalDiscount || 0)}
                    </div>
                </div>
                <div className="rounded-lg border p-4 bg-gray-50">
                    <div className="text-sm text-muted-foreground">เงินสด</div>
                    <div className="text-lg font-semibold">
                        {formatCurrency(summary?.byCash || 0)}
                    </div>
                </div>
            </div>

            {/* Payment Method Breakdown */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg border p-3 text-center">
                    <div className="text-xs text-muted-foreground">💵 เงินสด</div>
                    <div className="font-semibold">{formatCurrency(summary?.byCash || 0)}</div>
                </div>
                <div className="bg-blue-50 rounded-lg border border-blue-100 p-3 text-center">
                    <div className="text-xs text-muted-foreground">📲 โอน</div>
                    <div className="font-semibold text-blue-600">{formatCurrency(summary?.byTransfer || 0)}</div>
                </div>
                <div className="bg-purple-50 rounded-lg border border-purple-100 p-3 text-center">
                    <div className="text-xs text-muted-foreground">💳 บัตร</div>
                    <div className="font-semibold text-purple-600">{formatCurrency(summary?.byCard || 0)}</div>
                </div>
            </div>

            {/* Transaction List - Hide on summary print */}
            <div className={`bg-white rounded-lg border ${printMode === 'summary' ? 'print:hidden' : ''}`}>
                <div className="p-4 border-b flex items-center justify-between print:hidden">
                    <h2 className="font-semibold">📜 รายการ ({summary?.count || 0})</h2>
                    <CopyToClipboard text={copyText} />
                </div>
                <div className="hidden print:block p-4 border-b">
                    <h2 className="font-semibold">รายการ ({summary?.count || 0})</h2>
                </div>

                {summary?.transactions && summary.transactions.length > 0 ? (
                    <div className="divide-y">
                        {summary.transactions.map((tx) => (
                            <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-gray-50 print:hover:bg-transparent print:py-2">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-sm">{tx.receipt_no}</span>
                                        <PaymentBadge method={tx.payment_method} />
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-1">
                                        {tx.patient?.name} ({tx.patient?.hn})
                                        <span className="mx-2">•</span>
                                        {new Date(tx.paid_at).toLocaleString('th-TH', {
                                            day: 'numeric',
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="font-semibold text-green-600">
                                            {formatCurrency(tx.total_amount || 0)}
                                        </div>
                                        {tx.discount > 0 && (
                                            <div className="text-xs text-red-500">
                                                ลด {formatCurrency(tx.discount)}
                                            </div>
                                        )}
                                    </div>
                                    <Link
                                        href={`/billing/receipt/${tx.id}`}
                                        className="p-2 hover:bg-gray-100 rounded-md print:hidden"
                                        title="พิมพ์ใบเสร็จ"
                                    >
                                        🖨️
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-muted-foreground">
                        <p className="text-lg mb-2">📭 ไม่มีรายการในช่วงนี้</p>
                        <p className="text-sm">ลองเลือกช่วงวันอื่นหรือสร้างรายการชำระเงินใหม่</p>
                    </div>
                )}
            </div>
        </div>
    )
}

// Payment method badge component
function PaymentBadge({ method }: { method: string }) {
    const styles: Record<string, string> = {
        cash: 'bg-gray-100 text-gray-700',
        transfer: 'bg-blue-100 text-blue-700',
        card: 'bg-purple-100 text-purple-700',
    }
    const labels: Record<string, string> = {
        cash: '💵',
        transfer: '📲',
        card: '💳',
    }
    return (
        <span className={`px-2 py-0.5 rounded text-xs ${styles[method] || 'bg-gray-100'}`}>
            {labels[method] || method}
        </span>
    )
}
