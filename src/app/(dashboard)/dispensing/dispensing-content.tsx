'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { History } from 'lucide-react'
import { getPendingForDoctor, getFinalizedToday, getRecentTransactions } from './actions'
import { formatCurrency } from '@/lib/utils'
import { getDisplayName } from '@/lib/patient-utils'
import { isLateHour } from '@/lib/date-utils'

type Patient = {
    id: string
    hn: string
    name: string | null
    name_en: string | null
    nationality: string | null
}

type PendingRx = {
    id: string
    prescription_no: string
    status: string
    total_price: number
    created_at: string
    patient: Patient | null
}

type FinalizedTx = {
    id: string
    receipt_no: string
    status: string
    total_amount: number
    paid_at: string
    prescription: {
        id: string
        prescription_no: string
        patient: Patient | null
    } | null
}

export function DispensingContent() {
    const [pendingRx, setPendingRx] = useState<PendingRx[]>([])
    const [finalizedTx, setFinalizedTx] = useState<FinalizedTx[]>([])
    const [recentTx, setRecentTx] = useState<FinalizedTx[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('pending')
    const [viewingHistory, setViewingHistory] = useState(false)
    const [loadingHistory, setLoadingHistory] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        const [rxResult, txResult] = await Promise.all([
            getPendingForDoctor(),
            getFinalizedToday()
        ])
        // Handle Supabase single relation as array
        const rxData = (rxResult.data || []).map((rx: Record<string, unknown>) => ({
            ...rx,
            patient: Array.isArray(rx.patient) ? rx.patient[0] : rx.patient
        })) as PendingRx[]
        const txData = (txResult.data || []).map((tx: Record<string, unknown>) => {
            const prescription = Array.isArray(tx.prescription) ? tx.prescription[0] : tx.prescription
            let patient = null
            if (prescription && typeof prescription === 'object') {
                const p = prescription as Record<string, unknown>
                patient = Array.isArray(p.patient) ? p.patient[0] : p.patient
            }
            return {
                ...tx,
                prescription: prescription ? {
                    ...(prescription as object),
                    patient
                } : null
            }
        }) as FinalizedTx[]
        setPendingRx(rxData)
        setFinalizedTx(txData)
        setLoading(false)
    }

    // Load recent history
    const loadHistory = async () => {
        setLoadingHistory(true)
        const result = await getRecentTransactions()
        const txData = (result.data || []).map((tx: Record<string, unknown>) => {
            const prescription = Array.isArray(tx.prescription) ? tx.prescription[0] : tx.prescription
            let patient = null
            if (prescription && typeof prescription === 'object') {
                const p = prescription as Record<string, unknown>
                patient = Array.isArray(p.patient) ? p.patient[0] : p.patient
            }
            return {
                ...tx,
                prescription: prescription ? {
                    ...(prescription as object),
                    patient
                } : null
            }
        }) as FinalizedTx[]
        setRecentTx(txData)
        setViewingHistory(true)
        setLoadingHistory(false)
    }

    // Reset to today view
    const resetToToday = () => {
        setViewingHistory(false)
        setActiveTab('finalized')
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg">💊 จ่ายยา — รายการวันนี้</CardTitle>
                        <button
                            onClick={loadHistory}
                            className="mt-1 text-sm text-neutral-500 hover:text-neutral-700 hover:underline inline-flex items-center gap-1"
                        >
                            <History className="w-3.5 h-3.5" />
                            ดูย้อนหลัง
                        </button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {/* Healthcare UI v1.0 Tabs */}
                <div className="flex items-end gap-6 border-b border-neutral-200 mb-4">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`relative pb-3 px-1 text-base font-medium transition-colors ${activeTab === 'pending' ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-800'}`}
                    >
                        <span>รอสรุปเคส</span>
                        <span className={pendingRx.length > 0 && activeTab === 'pending'
                            ? "ml-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-orange-500 px-2 text-sm font-semibold text-white"
                            : pendingRx.length > 0
                                ? "ml-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-neutral-200 bg-white px-2 text-sm text-neutral-400"
                                : "ml-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-neutral-200 bg-white px-2 text-sm text-neutral-400"
                        }>
                            {pendingRx.length}
                        </span>
                        {activeTab === 'pending' && (
                            <span className="absolute left-0 -bottom-[1px] h-[3px] w-full rounded-full bg-orange-500" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('finalized')}
                        className={`relative pb-3 px-1 text-base font-medium transition-colors ${activeTab === 'finalized' ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-800'}`}
                    >
                        <span>สรุปเคสแล้ว</span>
                        {activeTab === 'finalized' && (
                            <span className="absolute left-0 -bottom-[1px] h-[3px] w-full rounded-full bg-neutral-600" />
                        )}
                    </button>
                </div>

                {/* Content Zone */}
                <div className="mt-6 rounded-2xl bg-neutral-50/60 p-4">
                    {/* Pending Tab Content */}
                    {activeTab === 'pending' && (
                        loading ? (
                            <div className="text-center py-8 text-muted-foreground">กำลังโหลด...</div>
                        ) : pendingRx.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                ✅ ไม่มีใบสั่งยารอสรุป
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {pendingRx.map((rx) => (
                                    <Link
                                        key={rx.id}
                                        href={`/prescriptions/${rx.id}`}
                                        className="block"
                                    >
                                        {/* Healthcare Card */}
                                        <div className="relative rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-200/60 transition hover:shadow-md before:content-[''] before:absolute before:left-0 before:top-4 before:bottom-4 before:w-[2px] before:rounded-full before:bg-orange-500">
                                            <div className="flex items-start justify-between gap-6">
                                                <div className="min-w-0">
                                                    <div className="text-xl font-semibold text-neutral-900 leading-tight">
                                                        {rx.patient ? getDisplayName({
                                                            name: rx.patient.name,
                                                            name_en: rx.patient.name_en,
                                                            nationality: rx.patient.nationality || 'thai'
                                                        }) : '-'}
                                                    </div>
                                                    <div className="mt-1 text-base text-neutral-500">
                                                        <span className="font-mono">{rx.patient?.hn}</span>
                                                        <span className="mx-2">•</span>
                                                        <span>{rx.prescription_no}</span>
                                                    </div>
                                                </div>
                                                <div className="shrink-0 text-right">
                                                    <div className="text-2xl font-semibold text-emerald-600 tabular-nums">
                                                        {formatCurrency(rx.total_price || 0)}
                                                    </div>
                                                    <div className="mt-1 text-sm text-neutral-400 tabular-nums">
                                                        {new Date(rx.created_at).toLocaleTimeString('th-TH', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )
                    )}

                    {/* Finalized Tab Content */}
                    {activeTab === 'finalized' && !viewingHistory && (
                        loading ? (
                            <div className="text-center py-8 text-muted-foreground">กำลังโหลด...</div>
                        ) : finalizedTx.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <p>📭 ไม่มีรายการของวันนี้</p>
                                {isLateHour() && (
                                    <button
                                        onClick={loadHistory}
                                        disabled={loadingHistory}
                                        className="mt-3 text-sm text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1"
                                    >
                                        👉 {loadingHistory ? 'กำลังโหลด...' : 'ดูรายการล่าสุด'}
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {finalizedTx.map((tx) => {
                                    const isVoided = tx.status === 'voided'
                                    const patient = tx.prescription?.patient
                                    return (
                                        <Link
                                            key={tx.id}
                                            href={`/billing/receipt/${tx.id}`}
                                            className="block"
                                        >
                                            {/* Healthcare Card */}
                                            <div className={`relative rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-200/60 transition before:content-[''] before:absolute before:left-0 before:top-4 before:bottom-4 before:w-[2px] before:rounded-full before:bg-neutral-400 ${isVoided ? 'opacity-50' : 'hover:shadow-md'}`}>
                                                <div className="flex items-start justify-between gap-6">
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xl font-semibold text-neutral-900 leading-tight">
                                                                {patient ? getDisplayName({
                                                                    name: patient.name,
                                                                    name_en: patient.name_en,
                                                                    nationality: patient.nationality || 'thai'
                                                                }) : '-'}
                                                            </span>
                                                            {isVoided && (
                                                                <Badge variant="destructive" className="text-xs">
                                                                    ยกเลิก
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="mt-1 text-base text-neutral-500">
                                                            <span className="font-mono">{tx.receipt_no}</span>
                                                            <span className="mx-2">•</span>
                                                            <span>
                                                                {new Date(tx.paid_at).toLocaleTimeString('th-TH', {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="shrink-0 text-right">
                                                        <div className={`text-2xl font-semibold tabular-nums ${isVoided ? 'line-through text-neutral-400' : 'text-emerald-600'}`}>
                                                            {formatCurrency(tx.total_amount || 0)}
                                                        </div>
                                                        <Badge variant="outline" className="mt-1 text-xs opacity-70">
                                                            ดูใบเสร็จ
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>
                        )
                    )}

                    {/* History View */}
                    {viewingHistory && (
                        loadingHistory ? (
                            <div className="text-center py-8 text-muted-foreground">กำลังโหลด...</div>
                        ) : (
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="text-sm font-medium text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full">
                                        📜 รายการล่าสุด (ไม่ใช่วันนี้)
                                    </div>
                                    <button
                                        onClick={resetToToday}
                                        className="text-sm text-neutral-500 hover:text-neutral-700 hover:underline"
                                    >
                                        ← กลับไปวันนี้
                                    </button>
                                </div>
                                {recentTx.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        ไม่มีรายการย้อนหลัง
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {recentTx.map((tx) => {
                                            const isVoided = tx.status === 'voided'
                                            const patient = tx.prescription?.patient
                                            return (
                                                <Link
                                                    key={tx.id}
                                                    href={`/billing/receipt/${tx.id}`}
                                                    className="block"
                                                >
                                                    <div className={`relative rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-200/60 transition before:content-[''] before:absolute before:left-0 before:top-4 before:bottom-4 before:w-[2px] before:rounded-full before:bg-amber-400 ${isVoided ? 'opacity-50' : 'hover:shadow-md'}`}>
                                                        <div className="flex items-start justify-between gap-6">
                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xl font-semibold text-neutral-900 leading-tight">
                                                                        {patient ? getDisplayName({
                                                                            name: patient.name,
                                                                            name_en: patient.name_en,
                                                                            nationality: patient.nationality || 'thai'
                                                                        }) : '-'}
                                                                    </span>
                                                                    {isVoided && (
                                                                        <Badge variant="destructive" className="text-xs">
                                                                            ยกเลิก
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <div className="mt-1 text-base text-neutral-500">
                                                                    <span className="font-mono">{tx.receipt_no}</span>
                                                                    <span className="mx-2">•</span>
                                                                    <span>
                                                                        {new Date(tx.paid_at).toLocaleDateString('th-TH', {
                                                                            day: 'numeric',
                                                                            month: 'short'
                                                                        })} {new Date(tx.paid_at).toLocaleTimeString('th-TH', {
                                                                            hour: '2-digit',
                                                                            minute: '2-digit'
                                                                        })}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="shrink-0 text-right">
                                                                <div className={`text-2xl font-semibold tabular-nums ${isVoided ? 'line-through text-neutral-400' : 'text-emerald-600'}`}>
                                                                    {formatCurrency(tx.total_amount || 0)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )
                    )}
                </div>

                {/* Refresh Button */}
                <div className="mt-4 text-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={loadData}
                        disabled={loading}
                    >
                        🔄 รีเฟรช
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
