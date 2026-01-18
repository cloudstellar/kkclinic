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
import { generateMedicineCode, checkCodeUnique } from '@/app/(dashboard)/inventory/actions'
import { toast } from 'sonner'
import { useState } from 'react'
import { Dice5, Loader2, Check, ChevronsUpDown } from 'lucide-react'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type MedicineFormProps = {
    medicine?: Medicine
    onSubmit: (data: MedicineFormValues) => Promise<void>
    isSubmitting?: boolean
}

export function MedicineForm({ medicine, onSubmit, isSubmitting }: MedicineFormProps) {
    const [isGenerating, setIsGenerating] = useState(false)
    const [isValidating, setIsValidating] = useState(false)
    const [openUnit, setOpenUnit] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    const {
        register,
        handleSubmit,
        setValue,
        setError,
        clearErrors,
        watch,
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

    const code = watch('code')
    const units = ['เม็ด', 'แคปซูล', 'ขวด', 'หลอด', 'ซอง', 'ชิ้น', 'กล่อง', 'ชุด', 'cc', 'ml', 'dose', 'vial']

    const onFormSubmit: SubmitHandler<MedicineFormValues> = async (data) => {
        // Final validation before submit
        if (!medicine || medicine.code !== data.code) {
            const { isUnique } = await checkCodeUnique(data.code, medicine?.id)
            if (!isUnique) {
                setError('code', {
                    type: 'manual',
                    message: 'รหัสยานี้มีอยู่ในระบบแล้ว'
                })
                return
            }
        }
        await onSubmit(data)
    }

    // Auto Generate Code
    const generateCode = async () => {
        setIsGenerating(true)
        try {
            const { data, error } = await generateMedicineCode()
            if (error || !data) {
                toast.error('ไม่สามารถสร้างรหัสได้ กรุณาลองใหม่')
                return
            }
            setValue('code', data, { shouldValidate: true })
            clearErrors('code')
            toast.success(`สร้างรหัส ${data} สำเร็จ`)
        } catch (error) {
            toast.error('เกิดข้อผิดพลาดในการสร้างรหัส')
        } finally {
            setIsGenerating(false)
        }
    }

    // Real-time unique check on blur
    const onCodeBlur = async () => {
        if (!code || code === medicine?.code) return

        setIsValidating(true)
        try {
            const { isUnique } = await checkCodeUnique(code, medicine?.id)
            if (!isUnique) {
                setError('code', {
                    type: 'manual',
                    message: 'รหัสยานี้มีอยู่ในระบบแล้ว'
                })
            } else {
                clearErrors('code')
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsValidating(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            <Card>
                <CardContent className="pt-6 space-y-4">
                    <h3 className="font-semibold text-lg mb-4">ข้อมูลยา</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="code">รหัสยา/Barcode *</Label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Input
                                        id="code"
                                        {...register('code')}
                                        onBlur={(e) => {
                                            register('code').onBlur(e)
                                            onCodeBlur()
                                        }}
                                        placeholder="MED001 หรือ Scan Barcode"
                                        disabled={isSubmitting}
                                        className={errors.code ? "border-red-500 pr-8" : "pr-8"}
                                    />
                                    {isValidating && (
                                        <div className="absolute right-2 top-2.5">
                                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                                {!medicine && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={generateCode}
                                        title="สร้างรหัสอัตโนมัติ"
                                        disabled={isSubmitting || isGenerating}
                                    >
                                        {isGenerating ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Dice5 className="h-4 w-4" />
                                        )}
                                    </Button>
                                )}
                            </div>
                            {errors.code && (
                                <p className="text-sm text-red-500">{errors.code.message}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                รองรับการพิมพ์รหัสเอง, ยิง Barcode, หรือกดปุ่มลูกเต๋าเพื่อสร้างรหัสอัตโนมัติ
                            </p>
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
                        <div className="space-y-2 flex flex-col">
                            <Label htmlFor="unit">หน่วย *</Label>
                            <Popover open={openUnit} onOpenChange={setOpenUnit}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openUnit}
                                        className={cn(
                                            "w-full justify-between",
                                            !watch('unit') && "text-muted-foreground"
                                        )}
                                        disabled={isSubmitting}
                                    >
                                        {watch('unit') ? watch('unit') : "เลือกหรือพิมพ์หน่วย..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[200px] p-0" align="start">
                                    <Command>
                                        <CommandInput
                                            placeholder="ค้นหาหน่วย..."
                                            onValueChange={setSearchTerm}
                                        />
                                        <CommandList>
                                            <CommandEmpty>
                                                <div
                                                    className="p-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-sm"
                                                    onClick={() => {
                                                        if (searchTerm) {
                                                            setValue('unit', searchTerm, { shouldValidate: true })
                                                            setOpenUnit(false)
                                                        }
                                                    }}
                                                >
                                                    ใช้ "{searchTerm}"
                                                </div>
                                            </CommandEmpty>
                                            <CommandGroup>
                                                {units.map((unit) => (
                                                    <CommandItem
                                                        key={unit}
                                                        value={unit}
                                                        onSelect={(currentValue) => {
                                                            setValue('unit', currentValue === watch('unit') ? "" : currentValue, { shouldValidate: true })
                                                            setOpenUnit(false)
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                watch('unit') === unit ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {unit}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            <p className="text-xs text-muted-foreground">
                                สามารถพิมพ์หน่วยใหม่ได้โดยตรงหากไม่พบในรายการ
                            </p>
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
                        <Label htmlFor="description">สรรพคุณ/คำอธิบาย</Label>
                        <Textarea
                            id="description"
                            {...register('description')}
                            placeholder="เช่น บรรเทาอาการปวด ลดไข้, น้ำตาเทียม รักษาแผลถลอกผิวตา"
                            rows={2}
                            disabled={isSubmitting}
                        />
                        <p className="text-xs text-muted-foreground">
                            ข้อมูลนี้จะแสดงบนฉลากยา
                        </p>
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
