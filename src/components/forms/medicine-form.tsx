'use client'

import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { medicineFormSchema, MedicineFormValues, Medicine } from '@/types/medicines'
import Link from 'next/link'

type MedicineFormProps = {
    medicine?: Medicine
    onSubmit: (data: MedicineFormValues) => Promise<void>
    isSubmitting?: boolean
}

export function MedicineForm({ medicine, onSubmit, isSubmitting }: MedicineFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<MedicineFormValues>({
        resolver: zodResolver(medicineFormSchema) as any,
        defaultValues: {
            code: medicine?.code || '',
            name: medicine?.name || '',
            unit: medicine?.unit || 'เม็ด',
            price: medicine?.price || 0,
            stock_qty: medicine?.stock_qty || 0,
            min_stock: medicine?.min_stock || 10,
            description: medicine?.description || '',
        },
    })

    const onFormSubmit: SubmitHandler<MedicineFormValues> = async (data) => {
        await onSubmit(data)
    }

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            <Card>
                <CardContent className="pt-6 space-y-4">
                    <h3 className="font-semibold text-lg mb-4">ข้อมูลยา</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="code">รหัสยา/Barcode *</Label>
                            <Input
                                id="code"
                                {...register('code')}
                                placeholder="MED001"
                                disabled={isSubmitting}
                            />
                            {errors.code && (
                                <p className="text-sm text-red-500">{errors.code.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">ชื่อยา *</Label>
                            <Input
                                id="name"
                                {...register('name')}
                                placeholder="พาราเซตามอล 500mg"
                                disabled={isSubmitting}
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500">{errors.name.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="unit">หน่วย *</Label>
                            <Input
                                id="unit"
                                {...register('unit')}
                                placeholder="เม็ด, ขวด, กล่อง"
                                disabled={isSubmitting}
                            />
                            {errors.unit && (
                                <p className="text-sm text-red-500">{errors.unit.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="price">ราคาต่อหน่วย (บาท) *</Label>
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                {...register('price')}
                                placeholder="0.00"
                                disabled={isSubmitting}
                            />
                            {errors.price && (
                                <p className="text-sm text-red-500">{errors.price.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="min_stock">จำนวนขั้นต่ำ (แจ้งเตือน)</Label>
                            <Input
                                id="min_stock"
                                type="number"
                                {...register('min_stock')}
                                placeholder="10"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    {!medicine && (
                        <div className="space-y-2">
                            <Label htmlFor="stock_qty">จำนวนเริ่มต้น</Label>
                            <Input
                                id="stock_qty"
                                type="number"
                                {...register('stock_qty')}
                                placeholder="0"
                                disabled={isSubmitting}
                            />
                            <p className="text-xs text-muted-foreground">
                                ใช้สำหรับตั้งค่าเริ่มต้นเท่านั้น การเพิ่ม/ลดสต็อกให้ใช้ฟังก์ชันเพิ่มสต็อก
                            </p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="description">รายละเอียด/หมายเหตุ</Label>
                        <Textarea
                            id="description"
                            {...register('description')}
                            placeholder="ข้อมูลเพิ่มเติมเกี่ยวกับยา"
                            rows={2}
                            disabled={isSubmitting}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
                <Link href="/inventory">
                    <Button type="button" variant="outline" disabled={isSubmitting}>
                        ยกเลิก
                    </Button>
                </Link>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'กำลังบันทึก...' : medicine ? 'บันทึกการแก้ไข' : 'เพิ่มรายการยา'}
                </Button>
            </div>
        </form>
    )
}
