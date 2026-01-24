'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { PaymentFormData } from '@/types/transactions'

// ============================================
// CONSTANTS
// ============================================
const POSTGRES_UNIQUE_VIOLATION = '23505'

// ============================================
// HELPER FUNCTIONS
// ============================================

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

// Get transaction by request_id (for idempotency)
async function getTransactionByRequestId(requestId: string) {
    const supabase = await createClient()
    const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('request_id', requestId)
        .single()
    return data
}

// Get existing paid transaction for prescription
async function getExistingPaidTransaction(prescriptionId: string) {
    const supabase = await createClient()
    const { data } = await supabase
        .from('transactions')
        .select('id, receipt_no')
        .eq('prescription_id', prescriptionId)
        .eq('status', 'paid')
        .single()
    return data
}

// ============================================
// PROCESS PAYMENT - Correct Order per Sprint 2A
// ============================================
// Order: 1) Read prescription → 2) INSERT transaction (lock) →
//        3) Handle unique → 4) Deduct stock (if not repay) → 5) Auto-void if fail
export async function processPayment(prescriptionId: string, formData: PaymentFormData) {
    const supabase = await createClient()

    // 0. Validate request_id
    if (!formData.request_id) {
        return { data: null, error: 'Missing request_id for idempotency' }
    }

    // 1. Get current user (staff)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { data: null, error: 'ไม่ได้เข้าสู่ระบบ' }
    }

    // 2. Get prescription with items (read latest state)
    const { data: prescription, error: prescriptionError } = await supabase
        .from('prescriptions')
        .select(`
            *,
            patient:patients(id, hn, name, name_en, nationality),
            items:prescription_items(medicine_id, quantity)
        `)
        .eq('id', prescriptionId)
        .single()

    if (prescriptionError || !prescription) {
        return { data: null, error: 'ไม่พบใบสั่งยา' }
    }

    // 3. Check if this is a repay (prescription already dispensed)
    const isRepay = prescription.status === 'dispensed'

    // 4. For new payment: Validate stock (Fail Fast)
    // Sprint 4: Use effective_items if provided, otherwise use prescription.items
    type ItemToProcess = { medicine_id: string | null; quantity: number; unit_price: number }
    const itemsToProcess: ItemToProcess[] = formData.effective_items || prescription.items?.map(
        (item: { medicine_id: string | null; quantity: number }) => ({
            medicine_id: item.medicine_id,
            quantity: item.quantity,
            unit_price: 0  // Will be fetched from prescription_items
        })
    ) || []

    if (!isRepay && itemsToProcess.length > 0) {
        const medicineIds = itemsToProcess
            .filter(item => item.medicine_id)
            .map(item => item.medicine_id!)

        if (medicineIds.length > 0) {
            const { data: medicines } = await supabase
                .from('medicines')
                .select('id, name, stock_qty')
                .in('id', medicineIds)

            const stockMap = new Map(medicines?.map(m => [m.id, { name: m.name, stock: m.stock_qty }]) || [])

            const insufficientItems: string[] = []
            for (const item of itemsToProcess) {
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

    // 5. Calculate amounts
    // Sprint 4: Use effective_items total if provided, otherwise use prescription total
    const medicineTotal = formData.effective_items
        ? formData.effective_items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
        : (prescription.total_price || 0) - (prescription.df || 0)
    const subtotal = medicineTotal + (prescription.df || 0)
    const discount = formData.discount || 0
    const totalAmount = Math.max(0, Math.round((subtotal - discount) * 100) / 100)

    // 6. Generate receipt number
    const receiptNo = await generateReceiptNo()

    // 7. INSERT transaction FIRST (this is the "logic lock")
    const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
            receipt_no: receiptNo,
            prescription_id: prescriptionId,
            patient_id: prescription.patient_id,
            staff_id: user.id,
            status: 'paid',
            request_id: formData.request_id,  // Idempotency key
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

    // 8. Handle unique constraint violation
    if (transactionError) {
        if (transactionError.code === POSTGRES_UNIQUE_VIOLATION) {
            // Case A: Same request_id (idempotent - return existing)
            const sameRequest = await getTransactionByRequestId(formData.request_id)
            if (sameRequest) {
                return { data: sameRequest, error: null }
            }

            // Case B: Prescription already paid by another request
            const existing = await getExistingPaidTransaction(prescriptionId)
            if (existing) {
                return {
                    data: null,
                    error: `ใบสั่งยานี้ชำระแล้ว (${existing.receipt_no})`,
                    existingReceiptId: existing.id
                }
            }

            // Fallback
            return { data: null, error: 'ชำระแล้ว กรุณารีเฟรชรายการ', shouldRefresh: true }
        }

        console.error('Error creating transaction:', transactionError)
        return { data: null, error: transactionError.message }
    }

    // 8.5 Sprint 4: Insert transaction_items (base items snapshot)
    // This creates immutable base items for receipt/adjustment/void
    if (itemsToProcess.length > 0) {
        const transactionItems = itemsToProcess
            .filter(item => item.medicine_id && item.quantity > 0)
            .map(item => ({
                transaction_id: transaction.id,
                medicine_id: item.medicine_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                amount: item.quantity * item.unit_price,
                item_type: 'medicine' as const,
            }))

        if (transactionItems.length > 0) {
            const { error: itemsError } = await supabase
                .from('transaction_items')
                .insert(transactionItems)

            if (itemsError) {
                // Auto-void if transaction_items insert failed
                await supabase.from('transactions').update({
                    status: 'voided',
                    voided_at: new Date().toISOString(),
                    voided_by: user.id,
                    void_reason: 'auto-void: transaction_items insert failed',
                }).eq('id', transaction.id)

                console.error('Error inserting transaction_items:', itemsError)
                return { data: null, error: 'เกิดข้อผิดพลาดในการบันทึกรายการ กรุณาลองใหม่' }
            }
        }
    }

    // 9. If NOT repay: Deduct stock from effective items
    // Sprint 4: Use itemsToProcess (effective items)
    if (!isRepay && itemsToProcess.length > 0) {
        let stockError = false

        for (const item of itemsToProcess) {
            if (item.medicine_id) {
                const { data: medicine } = await supabase
                    .from('medicines')
                    .select('stock_qty')
                    .eq('id', item.medicine_id)
                    .single()

                if (medicine) {
                    const newQty = Math.max(0, medicine.stock_qty - item.quantity)
                    const { error: updateError } = await supabase
                        .from('medicines')
                        .update({ stock_qty: newQty })
                        .eq('id', item.medicine_id)

                    if (updateError) {
                        stockError = true
                        break
                    }

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

        // 10. Auto-void if stock update failed
        if (stockError) {
            await supabase.from('transactions').update({
                status: 'voided',
                voided_at: new Date().toISOString(),
                voided_by: user.id,
                void_reason: 'auto-void: stock update failed',
            }).eq('id', transaction.id)

            return { data: null, error: 'เกิดข้อผิดพลาดในการตัดสต๊อก กรุณาลองใหม่' }
        }
    }

    // 11. Update prescription status (only for new payment, not repay)
    if (!isRepay) {
        await supabase
            .from('prescriptions')
            .update({
                status: 'dispensed',
                completed_at: new Date().toISOString(),
            })
            .eq('id', prescriptionId)
    }

    revalidatePath('/prescriptions')
    revalidatePath(`/prescriptions/${prescriptionId}`)
    revalidatePath('/inventory')
    revalidatePath('/billing')

    return { data: transaction, error: null }
}

// ============================================
// GET TRANSACTION
// ============================================
export async function getTransaction(id: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('transactions')
        .select(`
            *,
            patient:patients(id, hn, name, name_en, nationality, phone),
            prescription:prescriptions(id, prescription_no, note, df, df_note, created_at),
            staff:users!transactions_staff_id_fkey(id, full_name),
            voided_by_user:users!transactions_voided_by_fkey(id, full_name)
        `)
        .eq('id', id)
        .single()

    if (error) {
        return { data: null, error: error.message }
    }

    // Sprint 4: Try transaction_items first (new payments with base snapshot)
    const { data: transactionItems } = await supabase
        .from('transaction_items')
        .select(`
            *,
            medicine:medicines(code, name, name_en, unit, description, description_en, expiry_note_th, expiry_note_en)
        `)
        .eq('transaction_id', id)
        .order('created_at', { ascending: true })

    if (transactionItems && transactionItems.length > 0) {
        // Sprint 4 mode: has base items
        return {
            data: {
                ...data,
                items: transactionItems,
                hasBaseItems: true  // Flag for UI to enable adjustment
            },
            error: null
        }
    }

    // Legacy fallback: no transaction_items, use prescription_items
    if (data?.prescription?.id) {
        const { data: prescriptionItems } = await supabase
            .from('prescription_items')
            .select(`
                *,
                medicine:medicines(code, name, name_en, unit, description, description_en, expiry_note_th, expiry_note_en)
            `)
            .eq('prescription_id', data.prescription.id)
            .order('created_at', { ascending: true })

        return {
            data: {
                ...data,
                items: prescriptionItems || [],
                hasBaseItems: false  // Flag for UI to disable adjustment
            },
            error: null
        }
    }

    return { data: { ...data, hasBaseItems: false }, error: null }
}

// ============================================
// VOID TRANSACTION - Sprint 2A Correct Implementation
// ============================================
// Rules:
// ✅ Soft void (update, not delete)
// ❌ NO stock restoration (ยาจ่ายไปแล้ว)
// ✅ Idempotent (void ซ้ำไม่ทำอะไร)
// ✅ Permission: admin/staff only (doctor ❌)
export async function voidTransaction(id: string, reason: string) {
    const supabase = await createClient()

    // 1. Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, error: 'ไม่ได้เข้าสู่ระบบ' }
    }

    // 2. Check user role (admin/staff only)
    const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!userData || !['admin', 'staff'].includes(userData.role)) {
        return { success: false, error: 'ไม่มีสิทธิ์ยกเลิกบิล (ต้องเป็น Admin หรือ Staff)' }
    }

    // 3. Get transaction
    const { data: transaction, error: fetchError } = await supabase
        .from('transactions')
        .select('id, status, receipt_no')
        .eq('id', id)
        .single()

    if (fetchError || !transaction) {
        return { success: false, error: 'ไม่พบ Transaction' }
    }

    // 4. Idempotent: Already voided → no-op
    if (transaction.status === 'voided') {
        return { success: true, error: null, alreadyVoided: true }
    }

    // 5. Guard: Can only void 'paid' status
    if (transaction.status !== 'paid') {
        return { success: false, error: `ไม่สามารถยกเลิกบิลสถานะ "${transaction.status}" ได้` }
    }

    // 6. Validate reason
    if (!reason || reason.trim().length === 0) {
        return { success: false, error: 'กรุณาระบุเหตุผลในการยกเลิก' }
    }

    // 7. Soft void (NO stock restoration per spec)
    const { error: updateError } = await supabase
        .from('transactions')
        .update({
            status: 'voided',
            voided_at: new Date().toISOString(),
            voided_by: user.id,
            void_reason: reason.trim(),
        })
        .eq('id', id)

    if (updateError) {
        console.error('Error voiding transaction:', updateError)
        return { success: false, error: updateError.message }
    }

    revalidatePath('/billing')
    revalidatePath(`/billing/receipt/${id}`)

    return { success: true, error: null }
}

// ============================================
// GET SALES SUMMARY
// ============================================
// Max 31 days to prevent slow queries
// Only counts status='paid' (excludes voided)
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

    // Get all transactions including voided (for display)
    const { data, error } = await supabase
        .from('transactions')
        .select(`
            *,
            patient:patients(id, hn, name, name_en, nationality),
            staff:users!transactions_staff_id_fkey(full_name)
        `)
        .gte('paid_at', `${from}T00:00:00`)
        .lte('paid_at', `${to}T23:59:59`)
        .order('paid_at', { ascending: false })

    if (error) {
        return { data: null, error: error.message }
    }

    // Filter paid only for calculations
    const paidTransactions = data?.filter(t => t.status === 'paid') || []
    const voidedTransactions = data?.filter(t => t.status === 'voided') || []

    // Calculate unique patients (paid only)
    const patientIds = new Set(paidTransactions.map(t => t.patient?.id).filter(Boolean))

    // Calculate totals (paid only)
    const summary = {
        dateFrom: from,
        dateTo: to,
        transactions: data || [],  // All for display
        count: paidTransactions.length,
        voidedCount: voidedTransactions.length,
        uniquePatients: patientIds.size,
        totalSubtotal: paidTransactions.reduce((sum, t) => sum + (t.subtotal || 0), 0),
        totalAmount: paidTransactions.reduce((sum, t) => sum + (t.total_amount || 0), 0),
        totalDiscount: paidTransactions.reduce((sum, t) => sum + (t.discount || 0), 0),
        byCash: paidTransactions.filter(t => t.payment_method === 'cash').reduce((sum, t) => sum + (t.total_amount || 0), 0),
        byTransfer: paidTransactions.filter(t => t.payment_method === 'transfer').reduce((sum, t) => sum + (t.total_amount || 0), 0),
        byCard: paidTransactions.filter(t => t.payment_method === 'card').reduce((sum, t) => sum + (t.total_amount || 0), 0),
    }

    return { data: summary, error: null }
}

// Alias for backward compatibility
export async function getDailySales(date?: string) {
    return getSalesSummary(date, date)
}
