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
import { createPrescription, searchPatients, searchMedicines } from '../actions'
import { toast } from 'sonner'
import { QuantityInput } from '@/components/ui/quantity-input'
import { DosageDisplay } from '@/components/prescription/dosage-display'
import { DosageInstructionSheet } from '@/components/prescription/dosage-instruction-sheet'
import { getDisplayName } from '@/lib/patient-utils'
import { formatPatientId } from '@/lib/clinic-config'

type Patient = {
    id: string
    hn: string
    name: string
    name_en?: string | null
    nationality?: 'thai' | 'other' | string
    drug_allergies: string | null
}

type Medicine = {
    id: string
    code: string
    name: string
    unit: string
    price: number
    stock_qty: number
}

// Sprint 3B: Local prescription item state
type PrescriptionItem = {
    medicine_id: string
    medicine_name: string
    unit: string
    price: number
    quantity: number
    stock_qty: number  // เก็บไว้เตือน Soft warn
    // Sprint 3B: Smart Dosage fields
    dosage_original: string     // Raw shorthand from doctor
    dosage_instruction: string  // Snapshot (translated or override)
    dosage_language: 'th' | 'en'  // Language for label
}

export default function NewPrescriptionPage() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Patient selection
    const [patientSearch, setPatientSearch] = useState('')
    const [patients, setPatients] = useState<Patient[]>([])
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
    const [showPatientDropdown, setShowPatientDropdown] = useState(false)

    // Medicine selection
    const [medicineSearch, setMedicineSearch] = useState('')
    const [medicines, setMedicines] = useState<Medicine[]>([])
    const [showMedicineDropdown, setShowMedicineDropdown] = useState(false)

    // Prescription items
    const [items, setItems] = useState<PrescriptionItem[]>([])
    const [note, setNote] = useState('')

    // Sprint 3C: Doctor Fee
    const [df, setDf] = useState(0)
    const [dfNote, setDfNote] = useState('')

    // Dosage sheet state (tracks which item's sheet is open by medicine_id)
    const [openSheetItemId, setOpenSheetItemId] = useState<string | null>(null)

    // Search patients
    useEffect(() => {
        // Load initial patients or search
        searchPatients(patientSearch).then(({ data }) => {
            setPatients(data || [])
            // Only show dropdown if there's a search term or explicit focus (handled by onFocus)
        })
    }, [patientSearch])

    // Search medicines
    useEffect(() => {
        // Load initial medicines or search
        searchMedicines(medicineSearch).then(({ data }) => {
            setMedicines(data || [])
        })
    }, [medicineSearch])

    function selectPatient(patient: Patient) {
        setSelectedPatient(patient)
        setPatientSearch('')
        setShowPatientDropdown(false)
    }

    function addMedicine(medicine: Medicine) {
        // Check if already in list
        if (items.some(i => i.medicine_id === medicine.id)) {
            toast.error('ยานี้อยู่ในรายการแล้ว')
            return
        }

        setItems([...items, {
            medicine_id: medicine.id,
            medicine_name: medicine.name,
            unit: medicine.unit,
            price: medicine.price,
            stock_qty: medicine.stock_qty,
            quantity: 1,
            // Sprint 3B: Smart Dosage defaults
            dosage_original: '',
            dosage_instruction: '',
            dosage_language: selectedPatient?.nationality === 'other' ? 'en' : 'th',
        }])
        setMedicineSearch('')
        setShowMedicineDropdown(false)
    }

    function updateItemQuantity(index: number, quantity: number) {
        const newItems = [...items]
        newItems[index].quantity = quantity
        setItems(newItems)
    }

    // Sprint 3B: Update dosage with new schema
    function updateItemDosage(index: number, original: string, instruction: string, lang: 'th' | 'en') {
        const newItems = [...items]
        newItems[index].dosage_original = original
        newItems[index].dosage_instruction = instruction
        newItems[index].dosage_language = lang
        setItems(newItems)
    }

    function removeItem(index: number) {
        setItems(items.filter((_, i) => i !== index))
    }

    // Sprint 3C: Total includes DF
    const itemsTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const totalPrice = itemsTotal + df

    async function handleSubmit() {
        if (!selectedPatient) {
            toast.error('กรุณาเลือกผู้ป่วย')
            return
        }

        if (items.length === 0) {
            toast.error('กรุณาเพิ่มรายการยาอย่างน้อย 1 รายการ')
            return
        }

        setIsSubmitting(true)
        try {
            const result = await createPrescription(
                selectedPatient.id,
                items.map(i => ({
                    // Sprint 3B: Smart Dosage schema
                    medicine_id: i.medicine_id,
                    quantity: i.quantity,
                    dosage_original: i.dosage_original || undefined,
                    dosage_instruction: i.dosage_instruction || undefined,
                    dosage_language: i.dosage_language,
                })),
                note || undefined,
                df || undefined,
                dfNote || undefined
            )

            if (result.error) {
                toast.error(result.error)
                return
            }

            toast.success(`สร้างใบสั่งยา ${result.data?.prescription_no} สำเร็จ`)
            router.push('/prescriptions')
        } catch {
            toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/prescriptions">
                    <Button variant="ghost" size="sm">
                        ← ย้อนกลับ
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">สร้างใบสั่งยาใหม่</h1>
            </div>

            {/* Patient Selection */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-base">1. เลือกผู้ป่วย</CardTitle>
                </CardHeader>
                <CardContent>
                    {selectedPatient ? (
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-medium">
                                    {getDisplayName({
                                        name: selectedPatient.name || null,
                                        name_en: selectedPatient.name_en || null,
                                        nationality: selectedPatient.nationality || 'thai'
                                    }) || '-'}
                                </p>
                                <p className="text-sm text-muted-foreground font-mono">{formatPatientId(selectedPatient.hn)}</p>
                                {selectedPatient.drug_allergies && (
                                    <p className="text-sm text-red-600 mt-1">
                                        ⚠️ แพ้ยา: {selectedPatient.drug_allergies}
                                    </p>
                                )}
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setSelectedPatient(null)}>
                                เปลี่ยน
                            </Button>
                        </div>
                    ) : (
                        <div className="relative">
                            <Input
                                placeholder="ค้นหา TN หรือชื่อผู้ป่วย... (คลิกเพื่อดูรายชื่อ)"
                                value={patientSearch}
                                onChange={(e) => {
                                    setPatientSearch(e.target.value)
                                    setShowPatientDropdown(true)
                                }}
                                onFocus={() => setShowPatientDropdown(true)}
                                // Delay hide to allow clicking options
                                onBlur={() => setTimeout(() => setShowPatientDropdown(false), 200)}
                            />
                            {showPatientDropdown && patients.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                                    {patients.map((patient) => (
                                        <button
                                            key={patient.id}
                                            className="w-full px-4 py-2 text-left hover:bg-gray-100 border-b last:border-b-0"
                                            onClick={() => selectPatient(patient)}
                                        >
                                            <span className="font-medium">
                                                {getDisplayName({
                                                    name: patient.name || null,
                                                    name_en: patient.name_en || null,
                                                    nationality: patient.nationality || 'thai'
                                                }) || '-'}
                                            </span>
                                            <span className="text-sm text-muted-foreground ml-2">({formatPatientId(patient.hn)})</span>
                                            {patient.drug_allergies && (
                                                <span className="text-xs text-red-600 ml-2">⚠️ แพ้ยา</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Medicine Selection */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-base">2. เพิ่มรายการยา</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative mb-4">
                        <Input
                            placeholder="ค้นหารหัสยาหรือชื่อยา... (คลิกเพื่อเลือก)"
                            value={medicineSearch}
                            onChange={(e) => {
                                setMedicineSearch(e.target.value)
                                setShowMedicineDropdown(true)
                            }}
                            onFocus={() => setShowMedicineDropdown(true)}
                            onBlur={() => setTimeout(() => setShowMedicineDropdown(false), 200)}
                        />
                        {showMedicineDropdown && medicines.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                                {medicines.map((medicine) => (
                                    <button
                                        key={medicine.id}
                                        className="w-full px-4 py-2 text-left hover:bg-gray-100 border-b last:border-b-0"
                                        onClick={() => addMedicine(medicine)}
                                    >
                                        <span className="font-mono text-sm">{medicine.code}</span>
                                        <span className="font-medium ml-2">{medicine.name}</span>
                                        <span className="text-sm text-muted-foreground ml-2">
                                            ฿{medicine.price} / {medicine.unit}
                                        </span>
                                        <span className={`text-xs ml-2 ${medicine.stock_qty <= 10 ? 'text-orange-600' : 'text-green-600'}`}>
                                            (คงเหลือ {medicine.stock_qty})
                                        </span>
                                    </button>
                                ))}
                                {/* Hint for more results */}
                                {!medicineSearch && (
                                    <div className="px-4 py-2 text-xs text-muted-foreground bg-gray-50 border-t">
                                        💡 แสดง 20 รายการที่ใช้บ่อย — พิมพ์ชื่อ/รหัสยาเพื่อค้นหาเพิ่ม
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {items.length > 0 && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ชื่อยา</TableHead>
                                    <TableHead className="w-[100px]">จำนวน</TableHead>
                                    <TableHead className="w-[300px]">วิธีใช้</TableHead>
                                    <TableHead className="text-right">ราคารวม</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((item, index) => (
                                    <TableRow key={item.medicine_id}>
                                        <TableCell>
                                            <span className="font-medium">{item.medicine_name}</span>
                                            <span className="text-sm text-muted-foreground ml-2">({item.unit})</span>
                                        </TableCell>
                                        <TableCell>
                                            <QuantityInput
                                                value={item.quantity}
                                                onChange={(val) => updateItemQuantity(index, val)}
                                                min={1}
                                                max={999}
                                                stockQty={item.stock_qty}
                                                unit={item.unit}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <DosageDisplay
                                                instruction={item.dosage_instruction}
                                                language={item.dosage_language}
                                                onClick={() => setOpenSheetItemId(item.medicine_id)}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            ฿{(item.price * item.quantity).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="sm" onClick={() => removeItem(index)}>
                                                ✕
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}

                    {items.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">
                            ยังไม่มีรายการยา กรุณาค้นหาและเลือกยา
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Note & Summary */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-base">3. ค่าธรรมเนียมและสรุป</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Sprint 3C: Doctor Fee */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="df">ค่าธรรมเนียมแพทย์ (Doctor Fee)</Label>
                                <Input
                                    id="df"
                                    type="number"
                                    value={df || ''}
                                    onChange={(e) => setDf(Number(e.target.value) || 0)}
                                    placeholder="0"
                                    min={0}
                                />
                            </div>
                            <div>
                                <Label htmlFor="dfNote">หมายเหตุ DF</Label>
                                <Input
                                    id="dfNote"
                                    value={dfNote}
                                    onChange={(e) => setDfNote(e.target.value)}
                                    placeholder="เช่น ตรวจตา, ลอกดูตา"
                                />
                                {/* DF Note Presets */}
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {['ตรวจตา', 'ลอกดูตา', 'ตรวจประเมิน'].map((preset) => (
                                        <button
                                            key={preset}
                                            type="button"
                                            onClick={() => setDfNote(preset)}
                                            className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${dfNote === preset
                                                    ? 'bg-primary text-white border-primary'
                                                    : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                                                }`}
                                        >
                                            {preset}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="note">หมายเหตุแพทย์</Label>
                            <Textarea
                                id="note"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
                                rows={2}
                            />
                        </div>

                        {/* Price Summary */}
                        <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                            {df > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span>ค่าธรรมเนียมแพทย์</span>
                                    <span>฿{df.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}
                            {itemsTotal > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span>ค่ายา</span>
                                    <span>฿{itemsTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-2 border-t">
                                <span className="font-medium">ยอดรวมทั้งสิ้น</span>
                                <span className="text-2xl font-bold text-primary">
                                    ฿{totalPrice.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end gap-3">
                <Link href="/prescriptions">
                    <Button variant="outline" disabled={isSubmitting}>ยกเลิก</Button>
                </Link>
                <Button onClick={handleSubmit} disabled={isSubmitting || !selectedPatient || items.length === 0}>
                    {isSubmitting ? 'กำลังบันทึก...' : 'สร้างใบสั่งยา'}
                </Button>
            </div>

            {/* Dosage Instruction Sheet */}
            {(() => {
                const openItemIndex = items.findIndex(i => i.medicine_id === openSheetItemId)
                const openItem = openItemIndex !== -1 ? items[openItemIndex] : null
                const previousItem = openItemIndex > 0 ? items[openItemIndex - 1] : null
                const isForeignPatient = selectedPatient?.nationality === 'other'

                return (
                    // M5.5: Key forces remount on item change → ensures fresh state init
                    <DosageInstructionSheet
                        key={openSheetItemId ?? 'closed'}
                        open={!!openItem}
                        dosageOriginal={openItem?.dosage_original ?? ''}
                        dosageInstruction={openItem?.dosage_instruction ?? ''}
                        dosageLanguage={openItem?.dosage_language ?? 'th'}
                        medicineName={openItem?.medicine_name}
                        isForeignPatient={isForeignPatient}
                        onSave={(original, instruction, lang) => {
                            if (openItem) {
                                updateItemDosage(openItemIndex, original, instruction, lang)
                            }
                        }}
                        onClose={() => setOpenSheetItemId(null)}
                        previousDosageOriginal={previousItem?.dosage_original ?? ''}
                        previousDosageInstruction={previousItem?.dosage_instruction ?? ''}
                    />
                )
            })()}
        </div>
    )
}
