'use client'

import { useState } from 'react'
import Image from 'next/image'
import { TransactionWithRelations } from '@/types/transactions'
import { VoidTransactionDialog } from './void-transaction-dialog'
import { AdjustmentModal } from './adjustment-modal'
import { getDisplayName } from '@/lib/patient-utils'

const paymentMethodLabels: Record<string, string> = {
    cash: 'เงินสด',
    transfer: 'โอน/PromptPay',
    card: 'บัตรเครดิต/เดบิต',
}

type ReceiptViewProps = {
    transaction: TransactionWithRelations & {
        items: Array<{
            id?: string
            medicine_id?: string
            quantity: number
            unit_price: number
            medicine?: { id: string; name: string; unit?: string }
        }>
        hasBaseItems?: boolean
        adjustmentCount?: number
    }
    userRole?: string
}

export function ReceiptView({ transaction, userRole }: ReceiptViewProps) {
    const [adjustmentOpen, setAdjustmentOpen] = useState(false)

    const isVoided = transaction.status === 'voided'
    const canVoid = !isVoided && ['admin', 'staff'].includes(userRole || '')

    // Phase 2: Adjustment button visibility
    // Show only for: paid, not voided, hasBaseItems (not legacy)
    const canAdjust = !isVoided &&
        transaction.status === 'paid' &&
        transaction.hasBaseItems === true &&
        transaction.items.length > 0 &&
        ['admin', 'staff'].includes(userRole || '')

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
                    .voided-watermark {
                        display: block !important;
                    }
                }
            `}</style>

            <div className="min-h-screen bg-gray-100 p-4">
                {/* Voided Banner */}
                {isVoided && (
                    <div className="no-print max-w-md mx-auto mb-4 bg-red-100 border border-red-300 rounded-lg p-4">
                        <p className="text-red-700 font-bold text-center">❌ บิลนี้ถูกยกเลิกแล้ว</p>
                        <div className="text-sm text-red-600 mt-2 space-y-1">
                            <p><strong>เหตุผล:</strong> {transaction.void_reason}</p>
                            <p><strong>ยกเลิกโดย:</strong> {transaction.voided_by_user?.full_name || '-'}</p>
                            <p><strong>เมื่อ:</strong> {transaction.voided_at ? new Date(transaction.voided_at).toLocaleString('th-TH') : '-'}</p>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="no-print max-w-md mx-auto mb-4 flex gap-2 flex-wrap">
                    {!isVoided && (
                        <>
                            <button
                                onClick={() => window.print()}
                                className="flex-1 bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-primary/90"
                            >
                                🖨️ พิมพ์ใบเสร็จ
                            </button>
                            <a
                                href={`/billing/receipt/${transaction.id}/labels`}
                                className="flex-1 bg-amber-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-amber-600 text-center"
                            >
                                🏷️ พิมพ์ฉลากยา
                            </a>
                        </>
                    )}
                    <button
                        onClick={() => window.history.back()}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                    >
                        ← ย้อนกลับ
                    </button>
                    {canVoid && (
                        <VoidTransactionDialog
                            transactionId={transaction.id}
                            receiptNo={transaction.receipt_no}
                        />
                    )}
                    {canAdjust && (
                        <button
                            onClick={() => setAdjustmentOpen(true)}
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
                        >
                            🔧 ปรับปรุงรายการ
                        </button>
                    )}
                </div>

                {/* Receipt */}
                <div className={`receipt-container max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg relative ${isVoided ? 'opacity-60' : ''}`} style={{ width: '80mm' }}>
                    {/* Voided Watermark (visible on print) */}
                    {isVoided && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-red-500 text-6xl font-bold opacity-30 rotate-[-30deg] border-4 border-red-500 px-4 py-2">
                                VOIDED
                            </div>
                        </div>
                    )}

                    {/* Header with Logo */}
                    <div className="text-center mb-4 border-b pb-4">
                        <div className="flex justify-center mb-2">
                            <Image
                                src="/kkclinic.svg"
                                alt="คลินิกตาใสใส"
                                width={60}
                                height={60}
                                className="object-contain"
                            />
                        </div>
                        <h1 className="text-xl font-bold">คลินิกตาใสใส</h1>
                        <p className="text-sm text-gray-600">เทศบาล 34 ต.บ้านฉาง อ.บ้านฉาง</p>
                        <p className="text-sm text-gray-600">จ.ระยอง 21130</p>
                    </div>

                    {/* Receipt Info */}
                    <div className="text-sm mb-4 space-y-1">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">เลขใบเสร็จ:</span>
                            <div className="flex items-center gap-2">
                                <span className="font-mono font-bold">{transaction.receipt_no}</span>
                                {(transaction.adjustmentCount ?? 0) > 0 && (
                                    <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">
                                        ฉบับปรับปรุง #{transaction.adjustmentCount}
                                    </span>
                                )}
                            </div>
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
                        {isVoided && (
                            <div className="flex justify-between text-red-600">
                                <span>สถานะ:</span>
                                <span className="font-bold">❌ ยกเลิกแล้ว</span>
                            </div>
                        )}
                    </div>

                    {/* Patient Info */}
                    <div className="text-sm mb-4 p-2 bg-gray-50 rounded">
                        <div className="flex justify-between">
                            <span className="text-gray-600">TN:</span>
                            <span className="font-mono">{transaction.patient?.hn}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">ชื่อ:</span>
                            <span>{transaction.patient ? getDisplayName({
                                name: transaction.patient.name || null,
                                name_en: transaction.patient.name_en || null,
                                nationality: transaction.patient.nationality || 'thai'
                            }) : '-'}</span>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-dashed my-2"></div>

                    {/* Sprint 3C: Doctor Fee (shown first) - always show, "-" if not set */}
                    <>
                        <div className="text-sm mb-2">
                            <div className="flex justify-between">
                                <div>
                                    <div className="font-medium">ค่าธรรมเนียมแพทย์</div>
                                    <div className="text-[10px] text-gray-500 -mt-0.5">(Doctor Fee)</div>
                                </div>
                                <span>{transaction.prescription?.df && transaction.prescription.df > 0 ? `฿${transaction.prescription.df.toLocaleString('th-TH', { minimumFractionDigits: 2 })}` : '-'}</span>
                            </div>
                        </div>
                        <div className="border-t border-dashed my-2"></div>
                    </>

                    {/* Items */}
                    <div className="text-sm mb-4">
                        <div className="font-bold mb-2">รายการยา</div>
                        {transaction.items?.map((item, index: number) => (
                            <div key={index} className="py-1 border-b border-gray-100">
                                <div className="flex justify-between">
                                    <div className="flex-1">
                                        <span>{item.medicine?.name}</span>
                                        <span className="text-gray-500 text-xs ml-1">x{item.quantity}</span>
                                    </div>
                                    <span>
                                        ฿{((item.unit_price || 0) * item.quantity).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
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
                        <div className={`flex justify-between text-lg font-bold pt-2 border-t ${isVoided ? 'line-through text-gray-400' : ''}`}>
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
                        {!isVoided ? (
                            <>
                                <p>ขอบคุณที่ใช้บริการ</p>
                                <p>Thank you for your visit</p>
                            </>
                        ) : (
                            <p className="text-red-500 font-bold">❌ เอกสารนี้ถูกยกเลิกแล้ว</p>
                        )}
                        <p className="mt-2 font-mono text-xs">{transaction.staff?.full_name}</p>
                    </div>
                </div>
            </div>

            {/* Adjustment Modal */}
            {canAdjust && (
                <AdjustmentModal
                    open={adjustmentOpen}
                    onOpenChange={setAdjustmentOpen}
                    transactionId={transaction.id}
                    receiptNo={transaction.receipt_no}
                    items={transaction.items}
                    currentTotal={transaction.total_amount}
                    df={transaction.prescription?.df}
                />
            )}
        </>
    )
}
