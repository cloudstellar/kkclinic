'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { getPrescription, updatePrescription, searchMedicines } from '../../actions'
import { toast } from 'sonner'
import { QuantityInput } from '@/components/ui/quantity-input'
import { DosageDisplay } from '@/components/prescription/dosage-display'
import { DosageInstructionSheet } from '@/components/prescription/dosage-instruction-sheet'
import { getDisplayName } from '@/lib/patient-utils'
import { formatPatientId } from '@/lib/clinic-config'

type Medicine = {
    id: string
    code: string
    name: string
    unit: string
    price: number
    stock_qty: number
}

type PrescriptionItem = {
    medicine_id: string
    medicine_name: string
    unit: string
    price: number
    quantity: number
    stock_qty: number
    dosage_original: string
    dosage_instruction: string
    dosage_language: 'th' | 'en'
}

type EditPrescriptionFormProps = {
    prescriptionId: string
}

export default function EditPrescriptionForm({ prescriptionId }: EditPrescriptionFormProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [loading, setLoading] = useState(true)

    // Prescription data
    const [prescriptionNo, setPrescriptionNo] = useState('')
    const [patient, setPatient] = useState<{
        id: string
        hn: string
        name: string
        name_en?: string | null
        nationality?: string
        drug_allergies: string | null
    } | null>(null)

    // Medicine search
    const [medicineSearch, setMedicineSearch] = useState('')
    const [medicines, setMedicines] = useState<Medicine[]>([])
    const [showMedicineResults, setShowMedicineResults] = useState(false)

    // Prescription items
    const [items, setItems] = useState<PrescriptionItem[]>([])
    const [note, setNote] = useState('')

    // DF
    const [df, setDf] = useState(0)
    const [dfNote, setDfNote] = useState('')

    // Dosage sheet
    const [dosageSheetOpen, setDosageSheetOpen] = useState(false)
    const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null)

    // Load existing prescription
    useEffect(() => {
        loadPrescription()
    }, [prescriptionId])

    const loadPrescription = async () => {
        const { data, error } = await getPrescription(prescriptionId)
        if (error || !data) {
            toast.error('ไม่พบใบสั่งยา')
            router.push('/prescriptions')
            return
        }

        if (data.status !== 'pending') {
            toast.error('ไม่สามารถแก้ไขใบสั่งยาที่สรุปเคสแล้ว')
            router.push(`/prescriptions/${prescriptionId}`)
            return
        }

        setPrescriptionNo(data.prescription_no)
        setPatient(data.patient)
        setNote(data.note || '')
        setDf(data.df || 0)
        setDfNote(data.df_note || '')

        // Convert items
        const loadedItems: PrescriptionItem[] = (data.items || []).map((item: Record<string, unknown>) => ({
            medicine_id: item.medicine_id as string,
            medicine_name: (item.medicine as Record<string, unknown>)?.name as string || '',
            unit: (item.medicine as Record<string, unknown>)?.unit as string || '',
            price: item.unit_price as number || 0,
            quantity: item.quantity as number || 1,
            stock_qty: (item.medicine as Record<string, unknown>)?.stock_qty as number || 0,
            dosage_original: item.dosage_original as string || '',
            dosage_instruction: item.dosage_instruction as string || '',
            dosage_language: (item.dosage_language as 'th' | 'en') || 'th',
        }))
        setItems(loadedItems)
        setLoading(false)
    }

    // Medicine search
    useEffect(() => {
        const timer = setTimeout(async () => {
            const { data } = await searchMedicines(medicineSearch)
            setMedicines(data || [])
        }, 300)
        return () => clearTimeout(timer)
    }, [medicineSearch])

    const addMedicine = (medicine: Medicine) => {
        const existingIndex = items.findIndex(i => i.medicine_id === medicine.id)
        if (existingIndex >= 0) {
            const newItems = [...items]
            newItems[existingIndex].quantity += 1
            setItems(newItems)
        } else {
            setItems([...items, {
                medicine_id: medicine.id,
                medicine_name: medicine.name,
                unit: medicine.unit,
                price: medicine.price,
                quantity: 1,
                stock_qty: medicine.stock_qty,
                dosage_original: '',
                dosage_instruction: '',
                dosage_language: 'th',
            }])
        }
        setMedicineSearch('')
        setShowMedicineResults(false)
    }

    const updateItemQuantity = (index: number, quantity: number) => {
        const newItems = [...items]
        newItems[index].quantity = quantity
        setItems(newItems)
    }

    const updateItemDosage = (index: number, original: string, instruction: string, lang: 'th' | 'en') => {
        const newItems = [...items]
        newItems[index].dosage_original = original
        newItems[index].dosage_instruction = instruction
        newItems[index].dosage_language = lang
        setItems(newItems)
    }

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index))
    }

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const total = subtotal + df

    const handleSubmit = async () => {
        if (items.length === 0) {
            toast.error('กรุณาเพิ่มรายการยาอย่างน้อย 1 รายการ')
            return
        }

        setIsSubmitting(true)
        const { error } = await updatePrescription(
            prescriptionId,
            items.map(item => ({
                medicine_id: item.medicine_id,
                quantity: item.quantity,
                dosage_original: item.dosage_original,
                dosage_instruction: item.dosage_instruction,
                dosage_language: item.dosage_language,
            })),
            note,
            df,
            dfNote
        )

        if (error) {
            toast.error(error)
            setIsSubmitting(false)
            return
        }

        toast.success('บันทึกการแก้ไขเรียบร้อย')
        router.push(`/prescriptions/${prescriptionId}`)
    }

    if (loading) {
        return <div className="p-6 text-center">กำลังโหลด...</div>
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link href={`/prescriptions/${prescriptionId}`}>
                        <Button variant="ghost" size="sm">
                            ← ย้อนกลับ
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">✏️ แก้ไขใบสั่งยา {prescriptionNo}</h1>
                </div>
            </div>

            {/* Patient Info (Read-only) */}
            {patient && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="text-base">ข้อมูลผู้ป่วย</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">{formatPatientId('label')}</p>
                                <p className="font-mono">{patient.hn}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">ชื่อ-นามสกุล</p>
                                <p className="font-medium">
                                    {getDisplayName({
                                        name: patient.name,
                                        name_en: patient.name_en || null,
                                        nationality: patient.nationality || 'thai'
                                    })}
                                </p>
                            </div>
                        </div>
                        {patient.drug_allergies && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-700 font-medium">🚨 แพ้ยา: {patient.drug_allergies}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Medicine Search */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-base">💊 รายการยา</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative mb-4">
                        <Input
                            placeholder="ค้นหายา..."
                            value={medicineSearch}
                            onChange={(e) => {
                                setMedicineSearch(e.target.value)
                                setShowMedicineResults(true)
                            }}
                            onFocus={() => setShowMedicineResults(true)}
                        />
                        {showMedicineResults && medicines.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
                                {medicines.map((med) => (
                                    <div
                                        key={med.id}
                                        className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-0"
                                        onClick={() => addMedicine(med)}
                                    >
                                        <div className="flex justify-between">
                                            <span className="font-medium">{med.name}</span>
                                            <span className="text-green-600">฿{med.price}</span>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {med.code} • {med.unit} • คงเหลือ {med.stock_qty}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {items.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            ยังไม่มีรายการยา
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ยา</TableHead>
                                    <TableHead className="w-24">จำนวน</TableHead>
                                    <TableHead>วิธีใช้</TableHead>
                                    <TableHead className="text-right">ราคา</TableHead>
                                    <TableHead className="w-12"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((item, index) => (
                                    <TableRow key={item.medicine_id}>
                                        <TableCell>
                                            <div className="font-medium">{item.medicine_name}</div>
                                            <div className="text-sm text-muted-foreground">{item.unit}</div>
                                        </TableCell>
                                        <TableCell>
                                            <QuantityInput
                                                value={item.quantity}
                                                onChange={(val) => updateItemQuantity(index, val)}
                                                min={1}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <DosageDisplay
                                                instruction={item.dosage_instruction}
                                                language={item.dosage_language}
                                                onClick={() => {
                                                    setEditingItemIndex(index)
                                                    setDosageSheetOpen(true)
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            ฿{(item.price * item.quantity).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeItem(index)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                ✕
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* DF & Note */}
            <Card className="mb-6">
                <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>ค่าแพทย์ (DF)</Label>
                            <Input
                                type="number"
                                value={df}
                                onChange={(e) => setDf(Number(e.target.value))}
                                min={0}
                            />
                        </div>
                        <div>
                            <Label>หมายเหตุ DF</Label>
                            <Input
                                value={dfNote}
                                onChange={(e) => setDfNote(e.target.value)}
                                placeholder="เช่น ค่าหัตถการ"
                            />
                        </div>
                    </div>
                    <div>
                        <Label>หมายเหตุใบสั่งยา</Label>
                        <Textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="หมายเหตุเพิ่มเติม..."
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Summary & Submit */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-lg">รวมค่ายา</span>
                        <span className="font-semibold">฿{subtotal.toLocaleString()}</span>
                    </div>
                    {df > 0 && (
                        <div className="flex justify-between items-center mb-4 text-muted-foreground">
                            <span>ค่าแพทย์ (DF)</span>
                            <span>฿{df.toLocaleString()}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center mb-6 text-xl font-bold border-t pt-4">
                        <span>ยอดรวม</span>
                        <span className="text-green-600">฿{total.toLocaleString()}</span>
                    </div>
                    <Button
                        className="w-full"
                        size="lg"
                        onClick={handleSubmit}
                        disabled={isSubmitting || items.length === 0}
                    >
                        {isSubmitting ? 'กำลังบันทึก...' : '💾 บันทึกการแก้ไข'}
                    </Button>
                </CardContent>
            </Card>

            {/* Dosage Sheet */}
            {editingItemIndex !== null && (
                <DosageInstructionSheet
                    open={dosageSheetOpen}
                    dosageOriginal={items[editingItemIndex]?.dosage_original || ''}
                    dosageInstruction={items[editingItemIndex]?.dosage_instruction || ''}
                    dosageLanguage={items[editingItemIndex]?.dosage_language || 'th'}
                    medicineName={items[editingItemIndex]?.medicine_name || ''}
                    isForeignPatient={patient?.nationality !== 'thai'}
                    onSave={(original, instruction, lang) => {
                        updateItemDosage(editingItemIndex, original, instruction, lang)
                        setDosageSheetOpen(false)
                        setEditingItemIndex(null)
                    }}
                    onClose={() => {
                        setDosageSheetOpen(false)
                        setEditingItemIndex(null)
                    }}
                />
            )}
        </div>
    )
}
