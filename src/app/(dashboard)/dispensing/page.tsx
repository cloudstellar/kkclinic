import Link from 'next/link'
import { getPrescriptions } from '../prescriptions/actions'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

export default async function DispensingPage() {
    const { data: prescriptions } = await getPrescriptions('pending')

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">💊 จ่ายยา</h1>

            <div className="bg-white rounded-lg border">
                {prescriptions && prescriptions.length > 0 ? (
                    <div className="divide-y">
                        {prescriptions.map((prescription: any) => (
                            <Link
                                key={prescription.id}
                                href={`/prescriptions/${prescription.id}`}
                                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono font-bold text-primary">
                                            {prescription.prescription_no}
                                        </span>
                                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                            รอจ่ายยา
                                        </Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-1">
                                        <span className="font-medium">{prescription.patient?.name}</span>
                                        <span className="mx-2">•</span>
                                        <span>{prescription.patient?.hn}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-semibold">
                                        {formatCurrency(prescription.total_price || 0)}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {new Date(prescription.created_at).toLocaleDateString('th-TH', {
                                            day: 'numeric',
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-muted-foreground">
                        <p className="text-lg mb-2">✓ ไม่มีใบสั่งยาที่รอจ่าย</p>
                        <p className="text-sm">ใบสั่งยาที่สถานะ "รอจ่ายยา" จะแสดงที่นี่</p>
                    </div>
                )}
            </div>

            <p className="text-sm text-muted-foreground mt-4">
                💡 คลิกที่ใบสั่งยาเพื่อดูรายละเอียดและทำการชำระเงิน
            </p>
        </div>
    )
}
