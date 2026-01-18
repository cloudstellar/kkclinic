'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { PaymentFormData } from '@/types/transactions'

// Generate receipt number
async function generateReceiptNo(): Promise<string> {
    const supabase = await createClient()
    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')

    const { count } = await supabase
        .from('transactions')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', today.toISOString().slice(0, 10))

    const nextNum = (count || 0) + 1
    return `RC${dateStr}-${nextNum.toString().padStart(4, '0')}`
}

// Process payment and dispense
export async function processPayment(prescriptionId: string, formData: PaymentFormData) {
    const supabase = await createClient()

    // Get current user (staff)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { data: null, error: 'ไม่ได้เข้าสู่ระบบ' }
    }

    // Get prescription with items
    const { data: prescription, error: prescriptionError } = await supabase
        .from('prescriptions')
        .select(`
            *,
            patient:patients(id, hn, name),
            items:prescription_items(medicine_id, quantity)
        `)
        .eq('id', prescriptionId)
        .single()

    if (prescriptionError || !prescription) {
        return { data: null, error: 'ไม่พบใบสั่งยา' }
    }

    if (prescription.status !== 'pending') {
        return { data: null, error: 'ใบสั่งยานี้ไม่อยู่ในสถานะรอจ่ายยา' }
    }

    // Stock validation (Fail Fast)
    if (prescription.items && prescription.items.length > 0) {
        const medicineIds = prescription.items
            .filter((item: { medicine_id: string | null }) => item.medicine_id)
            .map((item: { medicine_id: string }) => item.medicine_id)

        if (medicineIds.length > 0) {
            const { data: medicines } = await supabase
                .from('medicines')
                .select('id, name, stock_qty')
                .in('id', medicineIds)

            const stockMap = new Map(medicines?.map(m => [m.id, { name: m.name, stock: m.stock_qty }]) || [])

            const insufficientItems: string[] = []
            for (const item of prescription.items) {
                if (item.medicine_id) {
                    const med = stockMap.get(item.medicine_id)
                    if (med && item.quantity > med.stock) {
                        insufficientItems.push(`${med.name} (ต้องการ ${item.quantity}, เหลือ ${med.stock})`)
                    }
                }
            }

            if (insufficientItems.length > 0) {
                return { data: null, error: `สต็อกไม่เพียงพอ: ${insufficientItems.join(', ')}` }
            }
        }
    }

    // Calculate amounts
    const subtotal = prescription.total_price || 0
    const discount = formData.discount || 0
    const totalAmount = Math.max(0, Math.round((subtotal - discount) * 100) / 100)

    // Generate receipt number
    const receiptNo = await generateReceiptNo()

    // Create transaction
    const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
            receipt_no: receiptNo,
            prescription_id: prescriptionId,
            patient_id: prescription.patient_id,
            staff_id: user.id,
            subtotal: subtotal,
            discount: discount,
            vat_amount: 0,
            vat_included: false,
            total_amount: totalAmount,
            payment_method: formData.payment_method,
            paid_at: new Date().toISOString(),
            notes: formData.notes || null,
        })
        .select()
        .single()

    if (transactionError) {
        console.error('Error creating transaction:', transactionError)
        return { data: null, error: transactionError.message }
    }

    // Deduct stock for each item
    if (prescription.items) {
        for (const item of prescription.items) {
            if (item.medicine_id) {
                const { data: medicine } = await supabase
                    .from('medicines')
                    .select('stock_qty')
                    .eq('id', item.medicine_id)
                    .single()

                if (medicine) {
                    const newQty = Math.max(0, medicine.stock_qty - item.quantity)
                    await supabase
                        .from('medicines')
                        .update({ stock_qty: newQty })
                        .eq('id', item.medicine_id)

                    // Log stock change
                    await supabase.from('stock_logs').insert({
                        medicine_id: item.medicine_id,
                        changed_by: user.id,
                        change_type: 'dispense',
                        quantity_change: -item.quantity,
                        quantity_before: medicine.stock_qty,
                        quantity_after: newQty,
                        reference_id: prescriptionId,
                        notes: `จ่ายยาตามใบสั่งยา - ใบเสร็จ ${receiptNo}`,
                    })
                }
            }
        }
    }

    // Update prescription status
    await supabase
        .from('prescriptions')
        .update({
            status: 'dispensed',
            completed_at: new Date().toISOString(),
        })
        .eq('id', prescriptionId)

    revalidatePath('/prescriptions')
    revalidatePath(`/prescriptions/${prescriptionId}`)
    revalidatePath('/inventory')
    revalidatePath('/billing')

    return { data: transaction, error: null }
}

// Get transaction for receipt
export async function getTransaction(id: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('transactions')
        .select(`
            *,
            patient:patients(id, hn, name, phone),
            prescription:prescriptions(id, prescription_no, note),
            staff:users!transactions_staff_id_fkey(id, full_name)
        `)
        .eq('id', id)
        .single()

    if (error) {
        return { data: null, error: error.message }
    }

    // Get prescription items
    if (data?.prescription?.id) {
        const { data: items } = await supabase
            .from('prescription_items')
            .select(`
                *,
                medicine:medicines(code, name, unit)
            `)
            .eq('prescription_id', data.prescription.id)

        return { data: { ...data, items: items || [] }, error: null }
    }

    return { data, error: null }
}

// Void transaction
export async function voidTransaction(id: string, reason: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, error: 'ไม่ได้เข้าสู่ระบบ' }
    }

    // Get transaction
    const { data: transaction, error: fetchError } = await supabase
        .from('transactions')
        .select('*, prescription:prescriptions(items:prescription_items(medicine_id, quantity))')
        .eq('id', id)
        .single()

    if (fetchError || !transaction) {
        return { success: false, error: 'ไม่พบ Transaction' }
    }

    // Restore stock
    if (transaction.prescription?.items) {
        for (const item of transaction.prescription.items) {
            if (item.medicine_id) {
                const { data: medicine } = await supabase
                    .from('medicines')
                    .select('stock_qty')
                    .eq('id', item.medicine_id)
                    .single()

                if (medicine) {
                    const newQty = medicine.stock_qty + item.quantity
                    await supabase
                        .from('medicines')
                        .update({ stock_qty: newQty })
                        .eq('id', item.medicine_id)

                    // Log stock restore
                    await supabase.from('stock_logs').insert({
                        medicine_id: item.medicine_id,
                        changed_by: user.id,
                        change_type: 'void',
                        quantity_change: item.quantity,
                        quantity_before: medicine.stock_qty,
                        quantity_after: newQty,
                        reference_id: transaction.prescription_id,
                        notes: `ยกเลิก Transaction: ${reason}`,
                    })
                }
            }
        }
    }

    // Update prescription back to pending
    await supabase
        .from('prescriptions')
        .update({
            status: 'cancelled',
            cancelled_reason: `Voided: ${reason}`,
        })
        .eq('id', transaction.prescription_id)

    // Delete transaction
    await supabase.from('transactions').delete().eq('id', id)

    revalidatePath('/prescriptions')
    revalidatePath('/billing')
    revalidatePath('/inventory')

    return { success: true, error: null }
}

// Get sales summary for date range
// Max 31 days to prevent slow queries
export async function getSalesSummary(dateFrom?: string, dateTo?: string) {
    const supabase = await createClient()

    // Default to today if no dates provided
    const today = new Date().toISOString().slice(0, 10)
    const from = dateFrom || today
    const to = dateTo || from

    // Validate max 31 days
    const fromDate = new Date(from)
    const toDate = new Date(to)
    const diffDays = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays > 31) {
        return { data: null, error: 'ช่วงวันที่เกิน 31 วัน กรุณาเลือกช่วงที่สั้นกว่านี้' }
    }

    const { data, error } = await supabase
        .from('transactions')
        .select(`
            *,
            patient:patients(id, hn, name),
            staff:users!transactions_staff_id_fkey(full_name)
        `)
        .gte('paid_at', `${from}T00:00:00`)
        .lte('paid_at', `${to}T23:59:59`)
        .order('paid_at', { ascending: false })

    if (error) {
        return { data: null, error: error.message }
    }

    // Calculate unique patients
    const patientIds = new Set(data?.map(t => t.patient?.id).filter(Boolean))

    // Calculate totals
    // TODO: Phase 2.5 - Add breakdown by service_category (ยา/บริการ/แว่น)
    const summary = {
        dateFrom: from,
        dateTo: to,
        transactions: data || [],
        count: data?.length || 0,
        uniquePatients: patientIds.size,
        totalSubtotal: data?.reduce((sum, t) => sum + (t.subtotal || 0), 0) || 0,
        totalAmount: data?.reduce((sum, t) => sum + (t.total_amount || 0), 0) || 0,
        totalDiscount: data?.reduce((sum, t) => sum + (t.discount || 0), 0) || 0,
        byCash: data?.filter(t => t.payment_method === 'cash').reduce((sum, t) => sum + (t.total_amount || 0), 0) || 0,
        byTransfer: data?.filter(t => t.payment_method === 'transfer').reduce((sum, t) => sum + (t.total_amount || 0), 0) || 0,
        byCard: data?.filter(t => t.payment_method === 'card').reduce((sum, t) => sum + (t.total_amount || 0), 0) || 0,
    }

    return { data: summary, error: null }
}

// Alias for backward compatibility
export async function getDailySales(date?: string) {
    return getSalesSummary(date, date)
}
