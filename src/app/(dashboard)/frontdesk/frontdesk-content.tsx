'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getPendingPrescriptions, getTodayTransactions } from './actions'
import { formatCurrency } from '@/lib/utils'
import { getDisplayName } from '@/lib/patient-utils'

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

type Transaction = {
    id: string
    receipt_no: string
    status: string
    total_amount: number
    paid_at: string
    patient: Patient | null
    prescription: { id: string; prescription_no: string } | null
}

export function FrontdeskContent() {
    const [searchTerm, setSearchTerm] = useState('')
    const [pendingRx, setPendingRx] = useState<PendingRx[]>([])
    const [todayTx, setTodayTx] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('pending')

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        const [rxResult, txResult] = await Promise.all([
            getPendingPrescriptions(),
            getTodayTransactions()
        ])
        // Supabase returns single relations as arrays, extract first element
        const rxData = (rxResult.data || []).map((rx: Record<string, unknown>) => ({
            ...rx,
            patient: Array.isArray(rx.patient) ? rx.patient[0] : rx.patient
        })) as PendingRx[]
        const txData = (txResult.data || []).map((tx: Record<string, unknown>) => ({
            ...tx,
            patient: Array.isArray(tx.patient) ? tx.patient[0] : tx.patient,
            prescription: Array.isArray(tx.prescription) ? tx.prescription[0] : tx.prescription
        })) as Transaction[]
        setPendingRx(rxData)
        setTodayTx(txData)
        setLoading(false)
    }

    const filteredPatients = searchTerm.trim() ?
        [...pendingRx, ...todayTx].filter(item => {
            const patient = item.patient
            if (!patient) return false
            const term = searchTerm.toLowerCase()
            return (
                patient.hn?.toLowerCase().includes(term) ||
                patient.name?.toLowerCase().includes(term) ||
                patient.name_en?.toLowerCase().includes(term)
            )
        }) : []

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Patient Search */}
            <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle className="text-lg">🔍 ค้นหาผู้ป่วย</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input
                        placeholder="ค้นหาด้วยชื่อ / TN / เบอร์"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                    />

                    <Link href="/patients/new">
                        <Button variant="outline" className="w-full">
                            ➕ เพิ่มผู้ป่วยใหม่
                        </Button>
                    </Link>

                    {/* Search Results */}
                    {searchTerm && filteredPatients.length > 0 && (
                        <div className="mt-4 space-y-2">
                            <p className="text-sm text-muted-foreground">
                                ผลการค้นหา ({filteredPatients.length})
                            </p>
                            {filteredPatients.slice(0, 5).map((item, idx) => (
                                <div key={idx} className="p-2 border rounded-md text-sm">
                                    <span className="font-mono">{item.patient?.hn}</span>
                                    <span className="mx-2">•</span>
                                    <span>{item.patient ? getDisplayName({
                                        name: item.patient.name,
                                        name_en: item.patient.name_en,
                                        nationality: item.patient.nationality || 'thai'
                                    }) : '-'}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Right Column: Today's Work */}
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle className="text-lg">📋 งานวันนี้</CardTitle>
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
                            onClick={() => setActiveTab('done')}
                            className={`relative pb-3 px-1 text-base font-medium transition-colors flex flex-col items-start ${activeTab === 'done' ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-800'}`}
                        >
                            <div className="flex items-center">
                                <span>รอดำเนินการ</span>
                                <span className={todayTx.length > 0 && activeTab === 'done'
                                    ? "ml-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-blue-600 px-2 text-sm font-semibold text-white"
                                    : todayTx.length > 0
                                        ? "ml-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-neutral-200 bg-white px-2 text-sm text-neutral-400"
                                        : "ml-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-neutral-200 bg-white px-2 text-sm text-neutral-400"
                                }>
                                    {todayTx.length}
                                </span>
                            </div>
                            <span className="text-[10px] text-neutral-400">รอเก็บเงิน / ปรับรายการ</span>
                            {activeTab === 'done' && (
                                <span className="absolute left-0 -bottom-[1px] h-[3px] w-full rounded-full bg-blue-600" />
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
                                            {/* Healthcare Card: shadow + ring + hairline accent */}
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

                        {/* Done Tab Content */}
                        {activeTab === 'done' && (
                            loading ? (
                                <div className="text-center py-8 text-muted-foreground">กำลังโหลด...</div>
                            ) : todayTx.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    📭 ยังไม่มีรายการสรุปเคสวันนี้
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {todayTx.map((tx) => {
                                        const isVoided = tx.status === 'voided'
                                        return (
                                            <Link
                                                key={tx.id}
                                                href={`/billing/receipt/${tx.id}`}
                                                className="block"
                                            >
                                                {/* Healthcare Card: shadow + ring + hairline accent */}
                                                <div className={`relative rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-200/60 transition before:content-[''] before:absolute before:left-0 before:top-4 before:bottom-4 before:w-[2px] before:rounded-full before:bg-blue-600 ${isVoided ? 'opacity-50' : 'hover:shadow-md'}`}>
                                                    <div className="flex items-start justify-between gap-6">
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xl font-semibold text-neutral-900 leading-tight">
                                                                    {tx.patient ? getDisplayName({
                                                                        name: tx.patient.name,
                                                                        name_en: tx.patient.name_en,
                                                                        nationality: tx.patient.nationality || 'thai'
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
                                                            {!isVoided && (
                                                                <Badge variant="outline" className="mt-1 text-xs">
                                                                    🧾 รอเก็บเงิน
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        )
                                    })}
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
        </div>
    )
}
