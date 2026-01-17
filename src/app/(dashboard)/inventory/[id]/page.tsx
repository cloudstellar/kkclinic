import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getMedicine, getStockLogs } from '../actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StockAdjustment } from './stock-adjustment'
import { StockHistoryTable } from '@/components/inventory/stock-history-table'

export default async function MedicineDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const { data: medicine, error } = await getMedicine(id)
    const { data: logs } = await getStockLogs(id)

    if (error || !medicine) {
        notFound()
    }

    const isLowStock = medicine.stock_qty <= medicine.min_stock

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/inventory">
                        <Button variant="ghost" size="sm">
                            ← ย้อนกลับ
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">{medicine.name}</h1>
                        <p className="text-muted-foreground font-mono">{medicine.code}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link href={`/inventory/${medicine.id}/edit`}>
                        <Button variant="outline">แก้ไข</Button>
                    </Link>
                </div>
            </div>

            {/* Low Stock Warning */}
            {isLowStock && (
                <Card className="border-orange-300 bg-orange-50">
                    <CardContent className="pt-6">
                        <p className="text-orange-700 font-medium">
                            ⚠️ ยาใกล้หมด! คงเหลือ {medicine.stock_qty} {medicine.unit} (ต่ำกว่าขั้นต่ำ {medicine.min_stock})
                        </p>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">ข้อมูลยา</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">รหัส/Barcode</p>
                                <p className="font-mono font-medium">{medicine.code}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">หน่วย</p>
                                <p>{medicine.unit}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">ราคาต่อหน่วย</p>
                            <p className="text-xl font-bold text-primary">
                                ฿{medicine.price.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        {medicine.description && (
                            <div>
                                <p className="text-sm text-muted-foreground">รายละเอียด</p>
                                <p>{medicine.description}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Stock Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">สต็อก</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">คงเหลือ</p>
                                <p className={`text-3xl font-bold ${isLowStock ? 'text-orange-600' : 'text-green-600'}`}>
                                    {medicine.stock_qty}
                                </p>
                                <p className="text-sm text-muted-foreground">{medicine.unit}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">ขั้นต่ำ</p>
                                <p className="text-xl font-medium">{medicine.min_stock}</p>
                                <p className="text-sm text-muted-foreground">{medicine.unit}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">มูลค่าคงเหลือ</p>
                            <p className="text-xl font-bold">
                                ฿{(medicine.price * medicine.stock_qty).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Stock Adjustment */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">เพิ่ม/ลดสต็อก</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <StockAdjustment medicineId={medicine.id} currentStock={medicine.stock_qty} unit={medicine.unit} />
                    </CardContent>
                </Card>

                {/* Stock History */}
                <div className="md:col-span-2">
                    <StockHistoryTable logs={logs || []} />
                </div>

                {/* Metadata */}
                <Card className="md:col-span-2 bg-gray-50">
                    <CardContent className="pt-6">
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>
                                สร้างเมื่อ:{' '}
                                {new Date(medicine.created_at).toLocaleDateString('th-TH', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </span>
                            <span>
                                สถานะ:{' '}
                                <span className={medicine.is_active ? 'text-green-600' : 'text-red-600'}>
                                    {medicine.is_active ? 'ใช้งาน' : 'ปิดใช้งาน'}
                                </span>
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
