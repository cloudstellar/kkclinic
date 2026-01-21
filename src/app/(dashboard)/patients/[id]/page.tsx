import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPatient } from '../actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DeletePatientButton } from './delete-button'
import { calculateAge } from '@/lib/date-utils'

export default async function PatientDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const { data: patient, error } = await getPatient(id)

    if (error || !patient) {
        notFound()
    }

    // Using imported calculateAge from date-utils (timezone-safe)

    const genderMap: Record<string, string> = {
        male: 'ชาย',
        female: 'หญิง',
        other: 'อื่นๆ',
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/patients">
                        <Button variant="ghost" size="sm">
                            ← ย้อนกลับ
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">
                            {patient.nationality === 'other' && patient.name_en
                                ? patient.name_en
                                : patient.name || patient.name_en}
                        </h1>
                        <p className="text-muted-foreground font-mono">{patient.hn}</p>
                        {patient.nationality === 'other' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                                🌍 Foreigner
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link href={`/patients/${patient.id}/edit`}>
                        <Button variant="outline">แก้ไข</Button>
                    </Link>
                    <DeletePatientButton patientId={patient.id} patientName={patient.name} />
                </div>
            </div>

            {/* Drug Allergy Warning */}
            {patient.drug_allergies && (
                <Card className="border-red-300 bg-red-50 mb-6">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-red-700 text-base">
                            🚨 ประวัติแพ้ยา
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-red-800 font-medium">{patient.drug_allergies}</p>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">ข้อมูลพื้นฐาน</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">TN</p>
                                <p className="font-mono font-medium">{patient.hn}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">เลขบัตรประชาชน</p>
                                <p className="font-mono">{patient.id_card || '-'}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">เพศ</p>
                                <p>{patient.gender ? genderMap[patient.gender] : '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">อายุ</p>
                                <p>
                                    {patient.birth_date
                                        ? `${calculateAge(patient.birth_date)} ปี`
                                        : '-'}
                                </p>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">วันเกิด</p>
                            <p>
                                {patient.birth_date
                                    ? new Date(patient.birth_date).toLocaleDateString('th-TH', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })
                                    : '-'}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">ข้อมูลติดต่อ</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground">เบอร์โทรศัพท์</p>
                            <p className="font-medium">{patient.phone}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">ที่อยู่</p>
                            <p>{patient.address || '-'}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Emergency Contact */}
                {(patient.emergency_contact_name || patient.emergency_contact_phone) && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">📞 ผู้ติดต่อฉุกเฉิน</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {patient.emergency_contact_name && (
                                <div>
                                    <p className="text-sm text-muted-foreground">ชื่อ</p>
                                    <p className="font-medium">{patient.emergency_contact_name}</p>
                                </div>
                            )}
                            {patient.emergency_contact_relationship && (
                                <div>
                                    <p className="text-sm text-muted-foreground">ความสัมพันธ์</p>
                                    <p>{patient.emergency_contact_relationship}</p>
                                </div>
                            )}
                            {patient.emergency_contact_phone && (
                                <div>
                                    <p className="text-sm text-muted-foreground">เบอร์โทร</p>
                                    <p className="font-medium">{patient.emergency_contact_phone}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Medical Info */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">ข้อมูลทางการแพทย์</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground">โรคประจำตัว</p>
                            <p>{patient.underlying_conditions || 'ไม่มี'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">หมายเหตุ</p>
                            <p>{patient.notes || '-'}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Registration Info */}
                <Card className="md:col-span-2 bg-gray-50">
                    <CardContent className="pt-6">
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>
                                ลงทะเบียนเมื่อ:{' '}
                                {new Date(patient.created_at).toLocaleDateString('th-TH', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </span>
                            <span>
                                แก้ไขล่าสุด:{' '}
                                {new Date(patient.updated_at).toLocaleDateString('th-TH', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
