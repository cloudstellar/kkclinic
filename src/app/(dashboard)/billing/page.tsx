import Link from 'next/link'
import { getDailySales } from './actions'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

const paymentMethodLabels: Record<string, string> = {
    cash: '💵 เงินสด',
    transfer: '📲 โอน',
    card: '💳 บัตร',
}

export default async function BillingPage() {
    const { data: dailySales } = await getDailySales()

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">💳 คิดเงิน / ประวัติการชำระ</h1>
                <div className="text-sm text-muted-foreground">
                    วันนี้: {new Date().toLocaleDateString('th-TH', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    })}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg border p-4">
                    <div className="text-sm text-muted-foreground">รายการวันนี้</div>
                    <div className="text-2xl font-bold text-primary">{dailySales?.count || 0}</div>
                </div>
                <div className="bg-white rounded-lg border p-4">
                    <div className="text-sm text-muted-foreground">ยอดรวม</div>
                    <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(dailySales?.totalAmount || 0)}
                    </div>
                </div>
                <div className="bg-white rounded-lg border p-4">
                    <div className="text-sm text-muted-foreground">เงินสด</div>
                    <div className="text-xl font-semibold">{formatCurrency(dailySales?.byCash || 0)}</div>
                </div>
                <div className="bg-white rounded-lg border p-4">
                    <div className="text-sm text-muted-foreground">โอน/บัตร</div>
                    <div className="text-xl font-semibold">
                        {formatCurrency((dailySales?.byTransfer || 0) + (dailySales?.byCard || 0))}
                    </div>
                </div>
            </div>

            {/* Transaction List */}
            <div className="bg-white rounded-lg border">
                <div className="p-4 border-b">
                    <h2 className="font-semibold">📜 รายการชำระเงินวันนี้</h2>
                </div>

                {dailySales?.transactions && dailySales.transactions.length > 0 ? (
                    <div className="divide-y">
                        {dailySales.transactions.map((tx: any) => (
                            <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono font-bold">{tx.receipt_no}</span>
                                        <Badge variant="outline" className="text-xs">
                                            {paymentMethodLabels[tx.payment_method] || tx.payment_method}
                                        </Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-1">
                                        <span className="font-medium">{tx.patient?.name}</span>
                                        <span className="mx-2">•</span>
                                        <span>{tx.patient?.hn}</span>
                                        <span className="mx-2">•</span>
                                        <span>
                                            {new Date(tx.paid_at).toLocaleTimeString('th-TH', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="font-semibold text-green-600">
                                            {formatCurrency(tx.total_amount || 0)}
                                        </div>
                                        {tx.discount > 0 && (
                                            <div className="text-xs text-red-500">
                                                ส่วนลด {formatCurrency(tx.discount)}
                                            </div>
                                        )}
                                    </div>
                                    <Link
                                        href={`/billing/receipt/${tx.id}`}
                                        className="px-3 py-1.5 text-sm bg-primary text-white rounded-md hover:bg-primary/90"
                                    >
                                        🖨️ พิมพ์
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-muted-foreground">
                        <p className="text-lg mb-2">📭 ยังไม่มีรายการชำระเงินวันนี้</p>
                        <p className="text-sm">รายการจะแสดงเมื่อมีการชำระเงินสำเร็จ</p>
                    </div>
                )}
            </div>

            <p className="text-sm text-muted-foreground mt-4">
                💡 คลิกปุ่ม "พิมพ์" เพื่อดูและพิมพ์ใบเสร็จซ้ำ
            </p>
        </div>
    )
}
