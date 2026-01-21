import Link from 'next/link'
import { getPrescriptions } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getDisplayName, hasValidName } from '@/lib/patient-utils'
import { formatPatientId } from '@/lib/clinic-config'

const statusLabels: Record<string, { label: string; className: string }> = {
    pending: { label: 'รอจ่ายยา', className: 'bg-yellow-100 text-yellow-700' },
    dispensed: { label: 'จ่ายแล้ว', className: 'bg-green-100 text-green-700' },
    cancelled: { label: 'ยกเลิก', className: 'bg-red-100 text-red-700' },
}

export default async function PrescriptionsPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string; status?: string }>
}) {
    const params = await searchParams
    const { data: prescriptions, error } = await getPrescriptions(params.status, params.search)

    // Count by status
    const pendingCount = prescriptions?.filter((p: { status: string }) => p.status === 'pending').length || 0
    const dispensedCount = prescriptions?.filter((p: { status: string }) => p.status === 'dispensed').length || 0

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">💊 ใบสั่งยา</h1>
                <Link href="/prescriptions/new">
                    <Button>+ สร้างใบสั่งยา</Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card className={pendingCount > 0 ? 'border-yellow-300 bg-yellow-50' : ''}>
                    <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground">รอจ่ายยา</p>
                        <p className={`text-3xl font-bold ${pendingCount > 0 ? 'text-yellow-600' : ''}`}>
                            {pendingCount}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground">จ่ายแล้ววันนี้</p>
                        <p className="text-3xl font-bold text-green-600">{dispensedCount}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <form method="get" className="flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-[200px]">
                            <Input
                                name="search"
                                placeholder="ค้นหาเลขใบสั่งยา..."
                                defaultValue={params.search || ''}
                            />
                        </div>
                        <select
                            name="status"
                            defaultValue={params.status || 'all'}
                            className="h-9 px-3 rounded-md border border-input bg-background"
                        >
                            <option value="all">ทุกสถานะ</option>
                            <option value="pending">รอจ่ายยา</option>
                            <option value="dispensed">จ่ายแล้ว</option>
                            <option value="cancelled">ยกเลิก</option>
                        </select>
                        <Button type="submit" variant="secondary">
                            ค้นหา
                        </Button>
                        {(params.search || params.status) && (
                            <Link href="/prescriptions">
                                <Button type="button" variant="outline">
                                    ล้าง
                                </Button>
                            </Link>
                        )}
                    </form>
                </CardContent>
            </Card>

            {/* Error */}
            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <p className="text-red-600">เกิดข้อผิดพลาด: {error}</p>
                    </CardContent>
                </Card>
            )}

            {/* Empty */}
            {!error && (!prescriptions || prescriptions.length === 0) && (
                <Card>
                    <CardContent className="pt-12 pb-12 text-center">
                        <p className="text-muted-foreground text-lg mb-4">
                            {params.search || params.status
                                ? 'ไม่พบใบสั่งยาที่ตรงกับการค้นหา'
                                : 'ยังไม่มีใบสั่งยาในระบบ'}
                        </p>
                        <Link href="/prescriptions/new">
                            <Button>+ สร้างใบสั่งยาใหม่</Button>
                        </Link>
                    </CardContent>
                </Card>
            )}

            {/* Table */}
            {prescriptions && prescriptions.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            พบ {prescriptions.length} รายการ
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>เลขใบสั่งยา</TableHead>
                                    <TableHead>ผู้ป่วย</TableHead>
                                    <TableHead>แพทย์</TableHead>
                                    <TableHead className="text-right">ยอดรวม</TableHead>
                                    <TableHead>สถานะ</TableHead>
                                    <TableHead>วันที่</TableHead>
                                    <TableHead className="text-right">จัดการ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {prescriptions.map((rx: { id: string; prescription_no: string; status: string; total_price: number; created_at: string; patient?: { name: string | null; name_en?: string | null; nationality?: string; hn: string; drug_allergies?: string }; doctor?: { full_name: string } }) => {
                                    const status = statusLabels[rx.status] || statusLabels.pending
                                    return (
                                        <TableRow key={rx.id}>
                                            <TableCell className="font-mono font-medium">
                                                {rx.prescription_no}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <span className="font-medium">
                                                        {rx.patient ? getDisplayName({
                                                            name: rx.patient.name || null,
                                                            name_en: rx.patient.name_en || null,
                                                            nationality: rx.patient.nationality || 'thai'
                                                        }) : '-'}
                                                        {rx.patient && !hasValidName({
                                                            name: rx.patient.name || null,
                                                            name_en: rx.patient.name_en || null,
                                                            nationality: rx.patient.nationality || 'thai'
                                                        }) && (
                                                                <span className="text-red-500 ml-1">⚠️</span>
                                                            )}
                                                    </span>
                                                    <span className="text-sm text-muted-foreground ml-2">
                                                        ({formatPatientId(rx.patient?.hn || '')})
                                                    </span>
                                                </div>
                                                {rx.patient?.drug_allergies && (
                                                    <span className="text-xs text-red-600">
                                                        ⚠️ แพ้ยา: {rx.patient.drug_allergies}
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>{rx.doctor?.full_name}</TableCell>
                                            <TableCell className="text-right">
                                                ฿{(rx.total_price || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs ${status.className}`}>
                                                    {status.label}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {new Date(rx.created_at).toLocaleDateString('th-TH')}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link href={`/prescriptions/${rx.id}`}>
                                                    <Button variant="ghost" size="sm">
                                                        ดู
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
