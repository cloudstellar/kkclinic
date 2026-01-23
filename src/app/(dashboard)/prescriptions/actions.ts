'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { PrescriptionItemFormData } from '@/types/prescriptions'

// Get all prescriptions with filters
export async function getPrescriptions(status?: string, search?: string) {
    const supabase = await createClient()

    let query = supabase
        .from('prescriptions')
        .select(`
            *,
            patient:patients(id, hn, name, name_en, nationality, drug_allergies),
            doctor:users!prescriptions_doctor_id_fkey(id, full_name)
        `)
        .order('created_at', { ascending: false })

    if (status && status !== 'all') {
        query = query.eq('status', status)
    }

    if (search && search.trim()) {
        const searchTerm = `%${search.trim()}%`
        // Can only filter on main table columns - foreign table filters don't work with .or()
        query = query.ilike('prescription_no', searchTerm)
    }

    const { data, error } = await query

    if (error) {
        console.error('Error fetching prescriptions:', error)
        return { data: null, error: error.message }
    }

    return { data, error: null }
}

// Get single prescription with items
export async function getPrescription(id: string) {
    const supabase = await createClient()

    const { data: prescription, error } = await supabase
        .from('prescriptions')
        .select(`
            *,
            patient:patients(id, hn, name, name_en, nationality, drug_allergies, phone, birth_date),
            doctor:users!prescriptions_doctor_id_fkey(id, full_name)
        `)
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching prescription:', error)
        return { data: null, error: error.message }
    }

    // Get items separately
    const { data: items } = await supabase
        .from('prescription_items')
        .select(`
            *,
            medicine:medicines(id, code, name, unit, stock_qty)
        `)
        .eq('prescription_id', id)

    return {
        data: { ...prescription, items: items || [] },
        error: null
    }
}

// Generate prescription number
async function generatePrescriptionNo(): Promise<string> {
    const supabase = await createClient()
    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')

    const { count } = await supabase
        .from('prescriptions')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', today.toISOString().slice(0, 10))

    const nextNum = (count || 0) + 1
    return `RX${dateStr}-${nextNum.toString().padStart(4, '0')}`
}

// Create prescription (Sprint 3C: Added df params)
export async function createPrescription(
    patientId: string,
    items: PrescriptionItemFormData[],
    note?: string,
    df?: number,
    dfNote?: string
) {
    const supabase = await createClient()

    // Get current user (doctor)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { data: null, error: 'ไม่ได้เข้าสู่ระบบ' }
    }

    // Get medicine prices
    const medicineIds = items.map(i => i.medicine_id)
    const { data: medicines } = await supabase
        .from('medicines')
        .select('id, price')
        .in('id', medicineIds)

    const priceMap = new Map(medicines?.map(m => [m.id, m.price]) || [])

    // Calculate total
    let totalPrice = 0
    const itemsWithPrices = items.map(item => {
        const unitPrice = priceMap.get(item.medicine_id) || 0
        const itemTotal = unitPrice * item.quantity
        totalPrice += itemTotal
        return { ...item, unit_price: unitPrice }
    })

    // Generate prescription number
    const prescriptionNo = await generatePrescriptionNo()

    // Create prescription (Sprint 3C: total_price includes df)
    const totalWithDf = totalPrice + (df || 0)

    const { data: prescription, error: prescriptionError } = await supabase
        .from('prescriptions')
        .insert({
            prescription_no: prescriptionNo,
            patient_id: patientId,
            doctor_id: user.id,
            status: 'pending',
            note: note || null,
            total_price: totalWithDf,
            // Sprint 3C: Doctor Fee
            df: df || 0,
            df_note: dfNote || null,
        })
        .select()
        .single()

    if (prescriptionError) {
        console.error('Error creating prescription:', prescriptionError)
        return { data: null, error: prescriptionError.message }
    }

    // Create prescription items (Sprint 3B schema - Option A: Single Snapshot)
    const itemsToInsert = itemsWithPrices.map(item => ({
        prescription_id: prescription.id,
        item_type: 'medicine' as const,
        medicine_id: item.medicine_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        // Sprint 3B M6: Smart Dosage fields
        // Rule: If dosage_original is blank → ALL fields NULL
        // Rule: If dosage_original exists → dictionary_version='1.0', all fields required
        dosage_original: item.dosage_original?.trim() || null,
        dosage_instruction: item.dosage_original?.trim() ? (item.dosage_instruction?.trim() || item.dosage_original.trim()) : null,
        dosage_language: item.dosage_original?.trim() ? (item.dosage_language || 'th') : null,
        dictionary_version: item.dosage_original?.trim() ? '1.0' : null,
        note: item.note || null,
    }))

    const { error: itemsError } = await supabase
        .from('prescription_items')
        .insert(itemsToInsert)

    if (itemsError) {
        console.error('Error creating prescription items:', itemsError)
        // Rollback prescription
        await supabase.from('prescriptions').delete().eq('id', prescription.id)
        return { data: null, error: itemsError.message }
    }

    revalidatePath('/prescriptions')
    return { data: prescription, error: null }
}

// Update prescription status (for dispensing)
export async function updatePrescriptionStatus(
    id: string,
    status: 'dispensed' | 'cancelled',
    reason?: string
) {
    const supabase = await createClient()

    const updateData: Record<string, unknown> = { status }

    if (status === 'dispensed') {
        updateData.completed_at = new Date().toISOString()

        // Get prescription items to deduct stock
        const { data: items } = await supabase
            .from('prescription_items')
            .select('medicine_id, quantity')
            .eq('prescription_id', id)

        // Deduct stock for each item
        if (items) {
            for (const item of items) {
                if (item.medicine_id) {
                    const { data: medicine } = await supabase
                        .from('medicines')
                        .select('stock_qty')
                        .eq('id', item.medicine_id)
                        .single()

                    if (medicine) {
                        const newQty = medicine.stock_qty - item.quantity
                        await supabase
                            .from('medicines')
                            .update({ stock_qty: Math.max(0, newQty) })
                            .eq('id', item.medicine_id)

                        // Log stock change
                        const { data: { user } } = await supabase.auth.getUser()
                        await supabase.from('stock_logs').insert({
                            medicine_id: item.medicine_id,
                            changed_by: user?.id,
                            change_type: 'dispense',
                            quantity_change: -item.quantity,
                            quantity_before: medicine.stock_qty,
                            quantity_after: Math.max(0, newQty),
                            reference_id: id,
                            notes: `จ่ายยาตามใบสั่งยา`,
                        })
                    }
                }
            }
        }
    }

    if (status === 'cancelled' && reason) {
        updateData.cancelled_reason = reason
    }

    const { error } = await supabase
        .from('prescriptions')
        .update(updateData)
        .eq('id', id)

    if (error) {
        console.error('Error updating prescription status:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/prescriptions')
    revalidatePath(`/prescriptions/${id}`)
    revalidatePath('/inventory')
    return { success: true, error: null }
}

// Search patients for prescription creation
export async function searchPatients(query: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('patients')
        .select('id, hn, name, name_en, nationality, drug_allergies')
        .or(`hn.ilike.%${query}%,name.ilike.%${query}%,name_en.ilike.%${query}%`)
        .limit(10)

    if (error) {
        return { data: null, error: error.message }
    }

    return { data, error: null }
}

// Search medicines for prescription
export async function searchMedicines(query: string) {
    const supabase = await createClient()

    if (query && query.trim()) {
        // If searching, use simple text search
        const { data, error } = await supabase
            .from('medicines')
            .select('id, code, name, unit, price, stock_qty')
            .eq('is_active', true)
            .or(`code.ilike.%${query}%,name.ilike.%${query}%`)
            .limit(30)

        if (error) {
            return { data: null, error: error.message }
        }
        return { data, error: null }
    }

    // If no query, return frequently used medicines
    const { data, error } = await supabase.rpc('get_frequently_used_medicines', {
        limit_count: 20
    })

    if (error) {
        // Fallback to simple query if RPC doesn't exist
        console.warn('RPC not found, using fallback:', error.message)
        const { data: fallback } = await supabase
            .from('medicines')
            .select('id, code, name, unit, price, stock_qty')
            .eq('is_active', true)
            .order('name')
            .limit(20)
        return { data: fallback, error: null }
    }

    return { data, error: null }
}

