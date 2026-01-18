import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPrescription } from '../actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { PaymentButton } from './payment-button'

const statusLabels: Record<string, { label: string; className: string }> = {
    pending: { label: 'รอจ่ายยา', className: 'bg-yellow-100 text-yellow-700' },
    dispensed: { label: 'จ่ายแล้ว', className: 'bg-green-100 text-green-700' },
    cancelled: { label: 'ยกเลิก', className: 'bg-red-100 text-red-700' },
}

export default async function PrescriptionDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const { data: prescription, error } = await getPrescription(id)

    if (error || !prescription) {
        notFound()
    }

    const status = statusLabels[prescription.status] || statusLabels.pending

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/prescriptions">
                        <Button variant="ghost" size="sm">
                            ← ย้อนกลับ
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">{prescription.prescription_no}</h1>
                        <span className={`px-2 py-1 rounded-full text-sm ${status.className}`}>
                            {status.label}
                        </span>
                    </div>
                </div>
                {prescription.status === 'pending' && (
                    <PaymentButton prescription={prescription} />
                )}
            </div>

            {/* Drug Allergy Warning */}
            {prescription.patient?.drug_allergies && (
                <Card className="border-red-300 bg-red-50 mb-6">
                    <CardContent className="pt-6">
                        <p className="text-red-700 font-medium">
                            🚨 ผู้ป่วยแพ้ยา: {prescription.patient.drug_allergies}
                        </p>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Patient Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">ข้อมูลผู้ป่วย</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div>
                            <p className="text-sm text-muted-foreground">ชื่อ-นามสกุล</p>
                            <p className="font-medium">{prescription.patient?.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">HN</p>
                            <p className="font-mono">{prescription.patient?.hn}</p>
                        </div>
                        {prescription.patient?.phone && (
                            <div>
                                <p className="text-sm text-muted-foreground">เบอร์โทร</p>
                                <p>{prescription.patient.phone}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Prescription Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">ข้อมูลใบสั่งยา</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div>
                            <p className="text-sm text-muted-foreground">แพทย์ผู้สั่ง</p>
                            <p className="font-medium">{prescription.doctor?.full_name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">วันที่สร้าง</p>
                            <p>
                                {new Date(prescription.created_at).toLocaleDateString('th-TH', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>
                        </div>
                        {prescription.completed_at && (
                            <div>
                                <p className="text-sm text-muted-foreground">วันที่จ่ายยา</p>
                                <p>
                                    {new Date(prescription.completed_at).toLocaleDateString('th-TH', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Items */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-base">รายการยา</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>รหัส</TableHead>
                                <TableHead>ชื่อยา</TableHead>
                                <TableHead>วิธีใช้</TableHead>
                                <TableHead className="text-right">จำนวน</TableHead>
                                <TableHead className="text-right">ราคา/หน่วย</TableHead>
                                <TableHead className="text-right">รวม</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {prescription.items?.map((item: any) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-mono">{item.medicine?.code}</TableCell>
                                    <TableCell>
                                        <span className="font-medium">{item.medicine?.name}</span>
                                        <span className="text-sm text-muted-foreground ml-2">({item.medicine?.unit})</span>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {item.dosage_instruction || item.note || '-'}
                                    </TableCell>
                                    <TableCell className="text-right">{item.quantity}</TableCell>
                                    <TableCell className="text-right">
                                        ฿{item.unit_price.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        ฿{(item.unit_price * item.quantity).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Total & Notes */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-medium">ยอดรวมทั้งสิ้น</span>
                        <span className="text-2xl font-bold text-primary">
                            ฿{(prescription.total_price || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                    {prescription.note && (
                        <div className="pt-4 border-t">
                            <p className="text-sm text-muted-foreground">หมายเหตุ</p>
                            <p>{prescription.note}</p>
                        </div>
                    )}
                    {prescription.cancelled_reason && (
                        <div className="pt-4 border-t">
                            <p className="text-sm text-red-600">เหตุผลที่ยกเลิก</p>
                            <p className="text-red-700">{prescription.cancelled_reason}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
