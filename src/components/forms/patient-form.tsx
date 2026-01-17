'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { patientFormSchema, PatientFormValues, Patient } from '@/types/patients'
import Link from 'next/link'

type PatientFormProps = {
    patient?: Patient
    onSubmit: (data: PatientFormValues) => Promise<void>
    isSubmitting?: boolean
}

export function PatientForm({ patient, onSubmit, isSubmitting }: PatientFormProps) {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<PatientFormValues>({
        resolver: zodResolver(patientFormSchema),
        defaultValues: {
            name: patient?.name || '',
            birth_date: patient?.birth_date || '',
            gender: patient?.gender || undefined,
            phone: patient?.phone || '',
            address: patient?.address || '',
            notes: patient?.notes || '',
            id_card: patient?.id_card || '',
            drug_allergies: patient?.drug_allergies || '',
            underlying_conditions: patient?.underlying_conditions || '',
        },
    })

    const gender = watch('gender')

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* ข้อมูลพื้นฐาน */}
            <Card>
                <CardContent className="pt-6 space-y-4">
                    <h3 className="font-semibold text-lg mb-4">ข้อมูลพื้นฐาน</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">ชื่อ-นามสกุล *</Label>
                            <Input
                                id="name"
                                {...register('name')}
                                placeholder="ชื่อ นามสกุล"
                                disabled={isSubmitting}
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500">{errors.name.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="id_card">เลขบัตรประชาชน</Label>
                            <Input
                                id="id_card"
                                {...register('id_card')}
                                placeholder="1234567890123"
                                maxLength={13}
                                disabled={isSubmitting}
                            />
                            {errors.id_card && (
                                <p className="text-sm text-red-500">{errors.id_card.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="birth_date">วันเกิด</Label>
                            <Input
                                id="birth_date"
                                type="date"
                                {...register('birth_date')}
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="gender">เพศ</Label>
                            <Select
                                value={gender}
                                onValueChange={(value) => setValue('gender', value as 'male' | 'female' | 'other')}
                                disabled={isSubmitting}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="เลือกเพศ" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">ชาย</SelectItem>
                                    <SelectItem value="female">หญิง</SelectItem>
                                    <SelectItem value="other">อื่นๆ</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">เบอร์โทรศัพท์ *</Label>
                            <Input
                                id="phone"
                                {...register('phone')}
                                placeholder="0812345678"
                                disabled={isSubmitting}
                            />
                            {errors.phone && (
                                <p className="text-sm text-red-500">{errors.phone.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">ที่อยู่</Label>
                        <Textarea
                            id="address"
                            {...register('address')}
                            placeholder="บ้านเลขที่ ถนน ตำบล อำเภอ จังหวัด"
                            rows={2}
                            disabled={isSubmitting}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* ข้อมูลทางการแพทย์ */}
            <Card>
                <CardContent className="pt-6 space-y-4">
                    <h3 className="font-semibold text-lg mb-4">ข้อมูลทางการแพทย์</h3>

                    <div className="space-y-2">
                        <Label htmlFor="drug_allergies" className="text-red-600 font-medium">
                            🚨 ประวัติแพ้ยา
                        </Label>
                        <Textarea
                            id="drug_allergies"
                            {...register('drug_allergies')}
                            placeholder="ระบุยาที่แพ้ เช่น Penicillin, Aspirin ฯลฯ (ถ้าไม่มีให้เว้นว่าง)"
                            rows={2}
                            className="border-red-200 focus:border-red-400"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="underlying_conditions">โรคประจำตัว</Label>
                        <Textarea
                            id="underlying_conditions"
                            {...register('underlying_conditions')}
                            placeholder="เช่น เบาหวาน, ความดัน, หอบหืด ฯลฯ"
                            rows={2}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">หมายเหตุอื่นๆ</Label>
                        <Textarea
                            id="notes"
                            {...register('notes')}
                            placeholder="ข้อมูลเพิ่มเติมเกี่ยวกับผู้ป่วย"
                            rows={2}
                            disabled={isSubmitting}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
                <Link href="/patients">
                    <Button type="button" variant="outline" disabled={isSubmitting}>
                        ยกเลิก
                    </Button>
                </Link>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'กำลังบันทึก...' : patient ? 'บันทึกการแก้ไข' : 'ลงทะเบียนผู้ป่วย'}
                </Button>
            </div>
        </form>
    )
}
