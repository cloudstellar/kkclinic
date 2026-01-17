'use client'

import { TransactionWithRelations } from '@/types/transactions'

const paymentMethodLabels: Record<string, string> = {
    cash: 'เงินสด',
    transfer: 'โอน/PromptPay',
    card: 'บัตรเครดิต/เดบิต',
}

export function ReceiptView({ transaction }: { transaction: TransactionWithRelations & { items: any[] } }) {
    return (
        <>
            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .receipt-container, .receipt-container * {
                        visibility: visible;
                    }
                    .receipt-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 80mm !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>

            <div className="min-h-screen bg-gray-100 p-4">
                {/* Action Buttons */}
                <div className="no-print max-w-md mx-auto mb-4 flex gap-2">
                    <button
                        onClick={() => window.print()}
                        className="flex-1 bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-primary/90"
                    >
                        🖨️ พิมพ์ใบเสร็จ
                    </button>
                    <button
                        onClick={() => window.close()}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                    >
                        ปิด
                    </button>
                </div>

                {/* Receipt */}
                <div className="receipt-container max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg" style={{ width: '80mm' }}>
                    {/* Header */}
                    <div className="text-center mb-4 border-b pb-4">
                        <h1 className="text-xl font-bold">คลินิกเวชกรรม KK</h1>
                        <p className="text-sm text-gray-600">123/45 ถนนสุขุมวิท กรุงเทพฯ</p>
                        <p className="text-sm text-gray-600">โทร: 02-123-4567</p>
                    </div>

                    {/* Receipt Info */}
                    <div className="text-sm mb-4 space-y-1">
                        <div className="flex justify-between">
                            <span className="text-gray-600">เลขใบเสร็จ:</span>
                            <span className="font-mono font-bold">{transaction.receipt_no}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">วันที่:</span>
                            <span>
                                {new Date(transaction.paid_at).toLocaleDateString('th-TH', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </span>
                        </div>
                    </div>

                    {/* Patient Info */}
                    <div className="text-sm mb-4 p-2 bg-gray-50 rounded">
                        <div className="flex justify-between">
                            <span className="text-gray-600">HN:</span>
                            <span className="font-mono">{transaction.patient?.hn}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">ชื่อ:</span>
                            <span>{transaction.patient?.name}</span>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-dashed my-2"></div>

                    {/* Items */}
                    <div className="text-sm mb-4">
                        <div className="font-bold mb-2">รายการยา</div>
                        {transaction.items?.map((item: any, index: number) => (
                            <div key={index} className="flex justify-between py-1 border-b border-gray-100">
                                <div className="flex-1">
                                    <span>{item.medicine?.name}</span>
                                    <span className="text-gray-500 text-xs ml-1">x{item.quantity}</span>
                                </div>
                                <span>
                                    ฿{((item.unit_price || 0) * item.quantity).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-dashed my-2"></div>

                    {/* Totals */}
                    <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                            <span>ยอดรวม</span>
                            <span>฿{(transaction.subtotal || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                        </div>
                        {transaction.discount > 0 && (
                            <div className="flex justify-between text-red-600">
                                <span>ส่วนลด</span>
                                <span>-฿{transaction.discount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-lg font-bold pt-2 border-t">
                            <span>รวมทั้งสิ้น</span>
                            <span>฿{(transaction.total_amount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="mt-4 text-sm text-center text-gray-600">
                        <p>ชำระโดย: {paymentMethodLabels[transaction.payment_method] || transaction.payment_method}</p>
                        {transaction.notes && (
                            <p className="text-xs">Ref: {transaction.notes}</p>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="mt-6 text-center text-xs text-gray-500 border-t pt-4">
                        <p>ขอบคุณที่ใช้บริการ</p>
                        <p>Thank you for your visit</p>
                        <p className="mt-2 font-mono text-xs">{transaction.staff?.full_name}</p>
                    </div>
                </div>
            </div>
        </>
    )
}
