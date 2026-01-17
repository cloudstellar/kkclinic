'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { PatientFormData } from '@/types/patients'

// Get all patients with optional search
export async function getPatients(search?: string) {
    const supabase = await createClient()

    let query = supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false })

    if (search && search.trim()) {
        const searchTerm = `%${search.trim()}%`
        query = query.or(`hn.ilike.${searchTerm},name.ilike.${searchTerm},phone.ilike.${searchTerm}`)
    }

    const { data, error } = await query

    if (error) {
        console.error('Error fetching patients:', error)
        return { data: null, error: error.message }
    }

    return { data, error: null }
}

// Get single patient by ID
export async function getPatient(id: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching patient:', error)
        return { data: null, error: error.message }
    }

    return { data, error: null }
}

// Generate next HN
async function generateHN(): Promise<string> {
    const supabase = await createClient()

    const { data } = await supabase
        .from('patients')
        .select('hn')
        .order('created_at', { ascending: false })
        .limit(1)

    let nextNum = 1
    if (data && data.length > 0 && data[0].hn) {
        const lastNum = parseInt(data[0].hn.replace('HN', ''), 10)
        if (!isNaN(lastNum)) {
            nextNum = lastNum + 1
        }
    }

    return `HN${nextNum.toString().padStart(6, '0')}`
}

// Create new patient
export async function createPatient(formData: PatientFormData) {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { data: null, error: 'ไม่ได้เข้าสู่ระบบ' }
    }

    // Generate HN
    const hn = await generateHN()

    const { data, error } = await supabase
        .from('patients')
        .insert({
            hn,
            name: formData.name,
            birth_date: formData.birth_date || null,
            gender: formData.gender || null,
            phone: formData.phone,
            address: formData.address || null,
            notes: formData.notes || null,
            id_card: formData.id_card || null,
            drug_allergies: formData.drug_allergies || null,
            underlying_conditions: formData.underlying_conditions || null,
            created_by: user.id,
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating patient:', error)
        return { data: null, error: error.message }
    }

    revalidatePath('/patients')
    return { data, error: null }
}

// Update patient
export async function updatePatient(id: string, formData: PatientFormData) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('patients')
        .update({
            name: formData.name,
            birth_date: formData.birth_date || null,
            gender: formData.gender || null,
            phone: formData.phone,
            address: formData.address || null,
            notes: formData.notes || null,
            id_card: formData.id_card || null,
            drug_allergies: formData.drug_allergies || null,
            underlying_conditions: formData.underlying_conditions || null,
        })
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error('Error updating patient:', error)
        return { data: null, error: error.message }
    }

    revalidatePath('/patients')
    revalidatePath(`/patients/${id}`)
    return { data, error: null }
}

// Delete patient
export async function deletePatient(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting patient:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/patients')
    return { success: true, error: null }
}
