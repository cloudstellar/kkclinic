'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { MedicineFormData } from '@/types/medicines'

// Get all medicines with optional search
export async function getMedicines(search?: string, showInactive = false) {
    const supabase = await createClient()

    let query = supabase
        .from('medicines')
        .select('*')
        .order('name', { ascending: true })

    if (!showInactive) {
        query = query.eq('is_active', true)
    }

    if (search && search.trim()) {
        const searchTerm = `%${search.trim()}%`
        query = query.or(`code.ilike.${searchTerm},name.ilike.${searchTerm}`)
    }

    const { data, error } = await query

    if (error) {
        console.error('Error fetching medicines:', error)
        return { data: null, error: error.message }
    }

    return { data, error: null }
}

// Get single medicine by ID
export async function getMedicine(id: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching medicine:', error)
        return { data: null, error: error.message }
    }

    return { data, error: null }
}

// Create new medicine
export async function createMedicine(formData: MedicineFormData) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('medicines')
        .insert({
            code: formData.code,
            name: formData.name,
            unit: formData.unit,
            price: formData.price,
            stock_qty: formData.stock_qty || 0,
            min_stock: formData.min_stock || 10,
            description: formData.description || null,
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating medicine:', error)
        if (error.code === '23505') {
            return { data: null, error: 'รหัสยานี้มีอยู่ในระบบแล้ว' }
        }
        return { data: null, error: error.message }
    }

    revalidatePath('/inventory')
    return { data, error: null }
}

// Update medicine
export async function updateMedicine(id: string, formData: MedicineFormData) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('medicines')
        .update({
            code: formData.code,
            name: formData.name,
            unit: formData.unit,
            price: formData.price,
            min_stock: formData.min_stock || 10,
            description: formData.description || null,
        })
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error('Error updating medicine:', error)
        return { data: null, error: error.message }
    }

    revalidatePath('/inventory')
    revalidatePath(`/inventory/${id}`)
    return { data, error: null }
}

// Toggle medicine active status
export async function toggleMedicineStatus(id: string, isActive: boolean) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('medicines')
        .update({ is_active: isActive })
        .eq('id', id)

    if (error) {
        console.error('Error toggling medicine status:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/inventory')
    return { success: true, error: null }
}

// Update stock quantity
export async function updateStock(id: string, quantityChange: number, notes?: string) {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, error: 'ไม่ได้เข้าสู่ระบบ' }
    }

    // Get current stock
    const { data: medicine, error: fetchError } = await supabase
        .from('medicines')
        .select('stock_qty')
        .eq('id', id)
        .single()

    if (fetchError || !medicine) {
        return { success: false, error: 'ไม่พบข้อมูลยา' }
    }

    const newQty = medicine.stock_qty + quantityChange
    if (newQty < 0) {
        return { success: false, error: 'จำนวนสต็อกไม่เพียงพอ' }
    }

    // Update stock
    const { error: updateError } = await supabase
        .from('medicines')
        .update({ stock_qty: newQty })
        .eq('id', id)

    if (updateError) {
        return { success: false, error: updateError.message }
    }

    // Log stock change
    await supabase.from('stock_logs').insert({
        medicine_id: id,
        changed_by: user.id,
        change_type: quantityChange > 0 ? 'restock' : 'adjust',
        quantity_change: quantityChange,
        quantity_before: medicine.stock_qty,
        quantity_after: newQty,
        notes: notes || null,
    })

    revalidatePath('/inventory')
    revalidatePath(`/inventory/${id}`)
    return { success: true, error: null }
}
