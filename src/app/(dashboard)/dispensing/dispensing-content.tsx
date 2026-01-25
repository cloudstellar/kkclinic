'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getPendingForDoctor, getFinalizedToday } from './actions'
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
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('pending')

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

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">📋 รายการใบสั่งยา</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="w-full grid grid-cols-2 mb-4 h-auto bg-transparent p-0">
                        <TabsTrigger
                            value="pending"
                            className="flex items-center gap-2 py-3 rounded-none border-b-[3px] border-transparent data-[state=active]:border-orange-500 data-[state=active]:text-orange-600 data-[state=inactive]:text-gray-500 bg-transparent"
                        >
                            <span className="font-medium">รอสรุปเคส</span>
                            <Badge className={pendingRx.length > 0
                                ? "bg-orange-500 text-white"
                                : "bg-gray-200 text-gray-500"
                            }>
                                {pendingRx.length}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger
                            value="finalized"
                            className="flex items-center gap-2 py-3 rounded-none border-b-[3px] border-transparent data-[state=active]:border-gray-500 data-[state=active]:text-gray-700 data-[state=inactive]:text-gray-500 bg-transparent"
                        >
                            <span className="font-medium">สรุปเคสแล้ว</span>
                            <Badge className="bg-gray-200 text-gray-500">
                                {finalizedTx.length}
                            </Badge>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="pending">
                        {loading ? (
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
                                        <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                            <div>
                                                <div className="font-medium">
                                                    {rx.patient ? getDisplayName({
                                                        name: rx.patient.name,
                                                        name_en: rx.patient.name_en,
                                                        nationality: rx.patient.nationality || 'thai'
                                                    }) : '-'}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    <span className="font-mono">{rx.patient?.hn}</span>
                                                    <span className="mx-2">•</span>
                                                    <span>{rx.prescription_no}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-semibold text-green-600">
                                                    {formatCurrency(rx.total_price || 0)}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {new Date(rx.created_at).toLocaleTimeString('th-TH', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="finalized">
                        {loading ? (
                            <div className="text-center py-8 text-muted-foreground">กำลังโหลด...</div>
                        ) : finalizedTx.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                📭 ยังไม่มีรายการสรุปเคสวันนี้
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
                                            <div className={`flex items-center justify-between p-4 bg-white rounded-xl shadow-sm transition-shadow cursor-pointer ${isVoided ? 'opacity-50' : 'hover:shadow-md'}`}>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">
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
                                                    <div className="text-sm text-muted-foreground">
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
                                                <div className="text-right">
                                                    <div className={`font-semibold ${isVoided ? 'line-through text-gray-400' : 'text-green-600'}`}>
                                                        {formatCurrency(tx.total_amount || 0)}
                                                    </div>
                                                    <Badge variant="outline" className="text-xs opacity-70">
                                                        ดูใบเสร็จ
                                                    </Badge>
                                                </div>
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

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
