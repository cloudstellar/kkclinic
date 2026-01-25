'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="w-full grid grid-cols-2 mb-4">
                            <TabsTrigger value="pending" className="flex flex-col items-center">
                                <span>รอสรุปเคส ({pendingRx.length})</span>
                            </TabsTrigger>
                            <TabsTrigger value="done" className="flex flex-col items-center">
                                <span>รอดำเนินการ ({todayTx.length})</span>
                                <span className="text-xs opacity-70">รอเก็บเงิน / ปรับรายการ</span>
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
                                <div className="space-y-2">
                                    {pendingRx.map((rx) => (
                                        <Link
                                            key={rx.id}
                                            href={`/prescriptions/${rx.id}`}
                                            className="block"
                                        >
                                            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
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

                        <TabsContent value="done">
                            {loading ? (
                                <div className="text-center py-8 text-muted-foreground">กำลังโหลด...</div>
                            ) : todayTx.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    📭 ยังไม่มีรายการสรุปเคสวันนี้
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {todayTx.map((tx) => {
                                        const isVoided = tx.status === 'voided'
                                        return (
                                            <Link
                                                key={tx.id}
                                                href={`/billing/receipt/${tx.id}`}
                                                className="block"
                                            >
                                                <div className={`flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer ${isVoided ? 'bg-red-50/50 opacity-60' : ''}`}>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">
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
                                                        {!isVoided && (
                                                            <Badge variant="outline" className="text-xs">
                                                                🧾 รอเก็บเงิน
                                                            </Badge>
                                                        )}
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
        </div>
    )
}
