import Link from 'next/link'
import { getPatients } from './actions'
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

export default async function PatientsPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string }>
}) {
    const params = await searchParams
    const { data: patients, error } = await getPatients(params.search)

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">👤 ผู้ป่วย</h1>
                <Link href="/patients/new">
                    <Button>+ เพิ่มผู้ป่วยใหม่</Button>
                </Link>
            </div>

            {/* Search */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <form method="get" className="flex gap-4">
                        <Input
                            name="search"
                            placeholder="ค้นหา HN, ชื่อ, หรือเบอร์โทร..."
                            defaultValue={params.search || ''}
                            className="max-w-md"
                        />
                        <Button type="submit" variant="secondary">
                            ค้นหา
                        </Button>
                        {params.search && (
                            <Link href="/patients">
                                <Button type="button" variant="outline">
                                    ล้าง
                                </Button>
                            </Link>
                        )}
                    </form>
                </CardContent>
            </Card>

            {/* Error state */}
            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <p className="text-red-600">เกิดข้อผิดพลาด: {error}</p>
                    </CardContent>
                </Card>
            )}

            {/* Empty state */}
            {!error && (!patients || patients.length === 0) && (
                <Card>
                    <CardContent className="pt-12 pb-12 text-center">
                        <p className="text-muted-foreground text-lg mb-4">
                            {params.search
                                ? `ไม่พบผู้ป่วยที่ตรงกับ "${params.search}"`
                                : 'ยังไม่มีข้อมูลผู้ป่วยในระบบ'}
                        </p>
                        <Link href="/patients/new">
                            <Button>+ เพิ่มผู้ป่วยคนแรก</Button>
                        </Link>
                    </CardContent>
                </Card>
            )}

            {/* Patients table */}
            {patients && patients.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            พบ {patients.length} รายการ
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>HN</TableHead>
                                    <TableHead>ชื่อ-นามสกุล</TableHead>
                                    <TableHead>เบอร์โทร</TableHead>
                                    <TableHead>แพ้ยา</TableHead>
                                    <TableHead>วันที่ลงทะเบียน</TableHead>
                                    <TableHead className="text-right">จัดการ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {patients.map((patient) => (
                                    <TableRow key={patient.id}>
                                        <TableCell className="font-mono font-medium">
                                            {patient.hn}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {hasValidName(patient) ? (
                                                    <span>{getDisplayName(patient)}</span>
                                                ) : (
                                                    <span className="text-amber-600">⚠️ ชื่อไม่ครบ</span>
                                                )}
                                                {patient.nationality === 'other' && (
                                                    <span className="px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-800">🌍</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>{patient.phone}</TableCell>
                                        <TableCell>
                                            {patient.drug_allergies ? (
                                                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                                                    ⚠️ {patient.drug_allergies.length > 20
                                                        ? patient.drug_allergies.substring(0, 20) + '...'
                                                        : patient.drug_allergies}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {new Date(patient.created_at).toLocaleDateString('th-TH')}
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Link href={`/patients/${patient.id}`}>
                                                <Button variant="ghost" size="sm">
                                                    ดู
                                                </Button>
                                            </Link>
                                            <Link href={`/patients/${patient.id}/edit`}>
                                                <Button variant="ghost" size="sm">
                                                    แก้ไข
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
