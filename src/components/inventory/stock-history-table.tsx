'use client'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { Package, Pill, Pencil, User } from 'lucide-react'

type StockLog = {
    id: string
    created_at: string
    change_type: 'restock' | 'adjust' | 'dispense'
    quantity_change: number
    quantity_before: number
    quantity_after: number
    notes: string | null
    changed_by: string
}

type StockHistoryTableProps = {
    logs: StockLog[]
}

export function StockHistoryTable({ logs }: StockHistoryTableProps) {
    if (!logs || logs.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">ประวัติการเคลื่อนไหวสต็อก</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                        <Package className="h-10 w-10 mx-auto mb-2 opacity-50" />
                        <p>ยังไม่มีประวัติการเคลื่อนไหว</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'restock':
                return <Package className="h-4 w-4 mr-2" />
            case 'dispense':
                return <Pill className="h-4 w-4 mr-2" />
            case 'adjust':
                return <Pencil className="h-4 w-4 mr-2" />
            default:
                return null
        }
    }

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'restock':
                return 'เพิ่มสต็อก'
            case 'dispense':
                return 'จ่ายยา'
            case 'adjust':
                return 'ปรับปรุง'
            default:
                return type
        }
    }

    const getChangeColor = (change: number) => {
        if (change > 0) return 'text-green-600'
        if (change < 0) return 'text-red-600'
        return ''
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">ประวัติการเคลื่อนไหวสต็อก</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>วัน/เวลา</TableHead>
                            <TableHead>ประเภท</TableHead>
                            <TableHead className="text-right">เปลี่ยนแปลง</TableHead>
                            <TableHead className="text-right">คงเหลือ</TableHead>
                            <TableHead>หมายเหตุ</TableHead>
                            <TableHead>ผู้ทำรายการ</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.map((log) => (
                            <TableRow key={log.id}>
                                <TableCell className="whitespace-nowrap">
                                    {format(new Date(log.created_at), 'dd MMM yyyy HH:mm', { locale: th })}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center">
                                        {getTypeIcon(log.change_type)}
                                        <span>{getTypeLabel(log.change_type)}</span>
                                        {/* Optional badges can be added here */}
                                    </div>
                                </TableCell>
                                <TableCell className={`text-right font-medium ${getChangeColor(log.quantity_change)}`}>
                                    {log.quantity_change > 0 ? '+' : ''}{log.quantity_change}
                                </TableCell>
                                <TableCell className="text-right text-muted-foreground">
                                    {log.quantity_after}
                                </TableCell>
                                <TableCell className="max-w-[200px] truncate" title={log.notes || ''}>
                                    {log.notes || '-'}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center text-muted-foreground text-xs">
                                        <User className="h-3 w-3 mr-1" />
                                        <span title={log.changed_by}>
                                            {/* Show short ID for now as requested */}
                                            {log.changed_by.slice(0, 8)}...
                                        </span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
