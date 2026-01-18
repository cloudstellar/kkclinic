import { getSalesSummary } from '../actions'
import { formatCurrency } from '@/lib/utils'
import { DailySalesContent } from './sales-content'

export default async function DailySalesSummaryPage({
    searchParams,
}: {
    searchParams: Promise<{ from?: string; to?: string }>
}) {
    const params = await searchParams
    const today = new Date().toISOString().slice(0, 10)
    const dateFrom = params.from || today
    const dateTo = params.to || dateFrom

    const { data: summary, error } = await getSalesSummary(dateFrom, dateTo)

    // Format date range for display
    const fromDisplay = new Date(dateFrom).toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })
    const toDisplay = new Date(dateTo).toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })
    const dateRangeText = dateFrom === dateTo ? fromDisplay : `${fromDisplay} - ${toDisplay}`

    // Copy text for clipboard
    const copyText = `สรุปยอดขาย ${dateRangeText}
รายการ: ${summary?.count || 0}
ผู้ป่วย: ${summary?.uniquePatients || 0}
ยอดก่อนลด: ${formatCurrency(summary?.totalSubtotal || 0)}
ยอดสุทธิ: ${formatCurrency(summary?.totalAmount || 0)}
ส่วนลด: ${formatCurrency(summary?.totalDiscount || 0)}
เงินสด: ${formatCurrency(summary?.byCash || 0)}
โอน: ${formatCurrency(summary?.byTransfer || 0)}
บัตร: ${formatCurrency(summary?.byCard || 0)}`

    return (
        <DailySalesContent
            summary={summary}
            dateRangeText={dateRangeText}
            dateFrom={dateFrom}
            dateTo={dateTo}
            copyText={copyText}
            error={error}
        />
    )
}
