import Link from 'next/link'
import { getMedicines } from './actions'
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
import { Medicine } from '@/types/medicines'

export default async function InventoryPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string }>
}) {
    const params = await searchParams
    const { data: medicines, error } = await getMedicines(params.search)

    // Calculate stats
    const lowStockCount = medicines?.filter((m: Medicine) => m.stock_qty <= m.min_stock).length || 0
    const totalValue = medicines?.reduce((sum: number, m: Medicine) => sum + m.price * m.stock_qty, 0) || 0

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">📦 คลังยา</h1>
                <Link href="/inventory/new">
                    <Button>+ เพิ่มรายการยา</Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground">รายการยาทั้งหมด</p>
                        <p className="text-2xl font-bold">{medicines?.length || 0}</p>
                    </CardContent>
                </Card>
                <Card className={lowStockCount > 0 ? 'border-orange-300 bg-orange-50' : ''}>
                    <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground">ยาใกล้หมด</p>
                        <p className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-orange-600' : ''}`}>
                            {lowStockCount}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground">มูลค่ารวม</p>
                        <p className="text-2xl font-bold text-green-600">
                            ฿{totalValue.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <form method="get" className="flex gap-4">
                        <Input
                            name="search"
                            placeholder="ค้นหารหัสยาหรือชื่อยา..."
                            defaultValue={params.search || ''}
                            className="max-w-md"
                        />
                        <Button type="submit" variant="secondary">
                            ค้นหา
                        </Button>
                        {params.search && (
                            <Link href="/inventory">
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
            {!error && (!medicines || medicines.length === 0) && (
                <Card>
                    <CardContent className="pt-12 pb-12 text-center">
                        <p className="text-muted-foreground text-lg mb-4">
                            {params.search
                                ? `ไม่พบยาที่ตรงกับ "${params.search}"`
                                : 'ยังไม่มีรายการยาในระบบ'}
                        </p>
                        <Link href="/inventory/new">
                            <Button>+ เพิ่มรายการยาแรก</Button>
                        </Link>
                    </CardContent>
                </Card>
            )}

            {/* Medicines table */}
            {medicines && medicines.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            พบ {medicines.length} รายการ
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>รหัส</TableHead>
                                    <TableHead>ชื่อยา</TableHead>
                                    <TableHead>หน่วย</TableHead>
                                    <TableHead className="text-right">ราคา</TableHead>
                                    <TableHead className="text-right">คงเหลือ</TableHead>
                                    <TableHead className="text-right">จัดการ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {medicines.map((medicine: Medicine) => {
                                    const isLowStock = medicine.stock_qty <= medicine.min_stock
                                    return (
                                        <TableRow key={medicine.id}>
                                            <TableCell className="font-mono font-medium">
                                                {medicine.code}
                                            </TableCell>
                                            <TableCell>{medicine.name}</TableCell>
                                            <TableCell>{medicine.unit}</TableCell>
                                            <TableCell className="text-right">
                                                ฿{medicine.price.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className={isLowStock ? 'px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-sm' : ''}>
                                                    {isLowStock && '⚠️ '}{medicine.stock_qty} {medicine.unit}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Link href={`/inventory/${medicine.id}`}>
                                                    <Button variant="ghost" size="sm">
                                                        ดู
                                                    </Button>
                                                </Link>
                                                <Link href={`/inventory/${medicine.id}/edit`}>
                                                    <Button variant="ghost" size="sm">
                                                        แก้ไข
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
