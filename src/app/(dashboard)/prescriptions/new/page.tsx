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

type Patient = {
    id: string
    hn: string
    name: string
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

type PrescriptionItem = {
    medicine_id: string
    medicine_name: string
    unit: string
    price: number
    quantity: number
    note: string
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

    // Search patients
    useEffect(() => {
        if (patientSearch.length >= 2) {
            searchPatients(patientSearch).then(({ data }) => {
                setPatients(data || [])
                setShowPatientDropdown(true)
            })
        } else {
            setPatients([])
            setShowPatientDropdown(false)
        }
    }, [patientSearch])

    // Search medicines
    useEffect(() => {
        if (medicineSearch.length >= 2) {
            searchMedicines(medicineSearch).then(({ data }) => {
                setMedicines(data || [])
                setShowMedicineDropdown(true)
            })
        } else {
            setMedicines([])
            setShowMedicineDropdown(false)
        }
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
            quantity: 1,
            note: '',
        }])
        setMedicineSearch('')
        setShowMedicineDropdown(false)
    }

    function updateItemQuantity(index: number, quantity: number) {
        const newItems = [...items]
        newItems[index].quantity = Math.max(1, quantity)
        setItems(newItems)
    }

    function updateItemNote(index: number, note: string) {
        const newItems = [...items]
        newItems[index].note = note
        setItems(newItems)
    }

    function removeItem(index: number) {
        setItems(items.filter((_, i) => i !== index))
    }

    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

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
                    medicine_id: i.medicine_id,
                    quantity: i.quantity,
                    note: i.note || undefined,
                })),
                note || undefined
            )

            if (result.error) {
                toast.error(result.error)
                return
            }

            toast.success(`สร้างใบสั่งยา ${result.data?.prescription_no} สำเร็จ`)
            router.push('/prescriptions')
        } catch (error) {
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
                                <p className="font-medium">{selectedPatient.name}</p>
                                <p className="text-sm text-muted-foreground font-mono">{selectedPatient.hn}</p>
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
                                placeholder="ค้นหา HN หรือชื่อผู้ป่วย..."
                                value={patientSearch}
                                onChange={(e) => setPatientSearch(e.target.value)}
                            />
                            {showPatientDropdown && patients.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                                    {patients.map((patient) => (
                                        <button
                                            key={patient.id}
                                            className="w-full px-4 py-2 text-left hover:bg-gray-100 border-b last:border-b-0"
                                            onClick={() => selectPatient(patient)}
                                        >
                                            <span className="font-medium">{patient.name}</span>
                                            <span className="text-sm text-muted-foreground ml-2">({patient.hn})</span>
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
                            placeholder="ค้นหารหัสยาหรือชื่อยา..."
                            value={medicineSearch}
                            onChange={(e) => setMedicineSearch(e.target.value)}
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
                            </div>
                        )}
                    </div>

                    {items.length > 0 && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ชื่อยา</TableHead>
                                    <TableHead className="w-[100px]">จำนวน</TableHead>
                                    <TableHead className="w-[200px]">วิธีใช้</TableHead>
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
                                            <Input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => updateItemQuantity(index, parseInt(e.target.value))}
                                                className="w-20"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                placeholder="เช่น วันละ 3 ครั้ง"
                                                value={item.note}
                                                onChange={(e) => updateItemNote(index, e.target.value)}
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
                    <CardTitle className="text-base">3. หมายเหตุและสรุป</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
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

                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                            <span className="font-medium">ยอดรวมทั้งสิ้น</span>
                            <span className="text-2xl font-bold text-primary">
                                ฿{totalPrice.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                            </span>
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
        </div>
    )
}
