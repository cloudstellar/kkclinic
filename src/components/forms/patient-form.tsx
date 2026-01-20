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
import { patientFormSchema, PatientFormValues, Patient, Nationality } from '@/types/patients'
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
        resolver: zodResolver(patientFormSchema) as any,
        defaultValues: {
            hn: patient?.hn || '',
            name: patient?.name || '',
            name_en: patient?.name_en || '',
            birth_date: patient?.birth_date || '',
            gender: patient?.gender || undefined,
            phone: patient?.phone || '',
            address: patient?.address || '',
            address_en: patient?.address_en || '',
            postal_code: patient?.postal_code || '',
            nationality: patient?.nationality || 'thai',
            emergency_contact_name: patient?.emergency_contact_name || '',
            emergency_contact_relationship: patient?.emergency_contact_relationship || '',
            emergency_contact_phone: patient?.emergency_contact_phone || '',
            notes: patient?.notes || '',
            id_card: patient?.id_card || '',
            drug_allergies: patient?.drug_allergies || '',
            underlying_conditions: patient?.underlying_conditions || '',
        },
    })

    const gender = watch('gender')
    const nationality = watch('nationality')

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* ข้อมูลพื้นฐาน */}
            <Card>
                <CardContent className="pt-6 space-y-4">
                    <h3 className="font-semibold text-lg mb-4">📋 ข้อมูลพื้นฐาน</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* TN */}
                        <div className="space-y-2">
                            <Label htmlFor="hn">รหัส TN *</Label>
                            <Input
                                id="hn"
                                {...register('hn')}
                                placeholder="TN250429 หรือ 250429"
                                disabled={isSubmitting}
                            />
                            {errors.hn && (
                                <p className="text-sm text-red-500">{errors.hn.message}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                💡 พิมพ์ตัวเลข 6 หลัก ระบบจะเติม TN ให้อัตโนมัติ
                            </p>
                        </div>

                        {/* Nationality */}
                        <div className="space-y-2">
                            <Label htmlFor="nationality">สัญชาติ *</Label>
                            <Select
                                value={nationality}
                                onValueChange={(value) => setValue('nationality', value as Nationality)}
                                disabled={isSubmitting}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="เลือกสัญชาติ" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="thai">🇹🇭 ไทย</SelectItem>
                                    <SelectItem value="other">🌍 ต่างชาติ</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* เลขบัตรประชาชน */}
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

                    {/* Name fields based on nationality */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* ชื่อไทย - always show, required for thai */}
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                ชื่อ-นามสกุล (ไทย) {nationality === 'thai' && <span className="text-red-500">*</span>}
                            </Label>
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

                        {/* ชื่อ EN - always show, required for other */}
                        <div className="space-y-2">
                            <Label htmlFor="name_en">
                                Name (EN) {nationality === 'other' && <span className="text-red-500">*</span>}
                            </Label>
                            <Input
                                id="name_en"
                                {...register('name_en')}
                                placeholder="Full Name in English"
                                disabled={isSubmitting}
                            />
                            {errors.name_en && (
                                <p className="text-sm text-red-500">{errors.name_en.message}</p>
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

                    {/* Address fields */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="address">
                                ที่อยู่ {nationality === 'thai' ? '(ไทย)' : ''}
                            </Label>
                            <Textarea
                                id="address"
                                {...register('address')}
                                placeholder="บ้านเลขที่ ถนน ตำบล อำเภอ จังหวัด"
                                rows={2}
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="postal_code">รหัสไปรษณีย์</Label>
                            <Input
                                id="postal_code"
                                {...register('postal_code')}
                                placeholder="10000"
                                maxLength={5}
                                disabled={isSubmitting}
                            />
                            {errors.postal_code && (
                                <p className="text-sm text-red-500">{errors.postal_code.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Address EN - show when nationality is other */}
                    {nationality === 'other' && (
                        <div className="space-y-2">
                            <Label htmlFor="address_en">Address (EN)</Label>
                            <Textarea
                                id="address_en"
                                {...register('address_en')}
                                placeholder="Full address in English"
                                rows={2}
                                disabled={isSubmitting}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ผู้ติดต่อฉุกเฉิน */}
            <Card>
                <CardContent className="pt-6 space-y-4">
                    <h3 className="font-semibold text-lg mb-4">📞 ผู้ติดต่อฉุกเฉิน</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="emergency_contact_name">ชื่อผู้ติดต่อ</Label>
                            <Input
                                id="emergency_contact_name"
                                {...register('emergency_contact_name')}
                                placeholder="ชื่อ นามสกุล"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="emergency_contact_relationship">ความสัมพันธ์</Label>
                            <Input
                                id="emergency_contact_relationship"
                                {...register('emergency_contact_relationship')}
                                placeholder="เช่น บิดา มารดา คู่สมรส"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="emergency_contact_phone">เบอร์โทร</Label>
                            <Input
                                id="emergency_contact_phone"
                                {...register('emergency_contact_phone')}
                                placeholder="0812345678"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ข้อมูลทางการแพทย์ */}
            <Card>
                <CardContent className="pt-6 space-y-4">
                    <h3 className="font-semibold text-lg mb-4">🩺 ข้อมูลทางการแพทย์</h3>

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
