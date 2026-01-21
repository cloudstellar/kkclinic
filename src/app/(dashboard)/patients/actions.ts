'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { PatientFormValues, normalizeTN } from '@/types/patients'

// TN format regex
const TN_REGEX = /^TN[0-9]{6}$/

// Get all patients with optional search
export async function getPatients(search?: string) {
    const supabase = await createClient()

    let query = supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false })

    if (search && search.trim()) {
        const searchTerm = `%${search.trim()}%`
        query = query.or(`hn.ilike.${searchTerm},name.ilike.${searchTerm},name_en.ilike.${searchTerm},phone.ilike.${searchTerm}`)
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

// Check if TN exists (for real-time validation)
export async function checkTNExists(tn: string, excludeId?: string) {
    const supabase = await createClient()

    const normalizedTN = normalizeTN(tn)

    let query = supabase
        .from('patients')
        .select('id')
        .eq('hn', normalizedTN)

    if (excludeId) {
        query = query.neq('id', excludeId)
    }

    const { data, error } = await query.maybeSingle()

    if (error) {
        console.error('Error checking TN:', error)
        return { exists: false, error: error.message }
    }

    return { exists: !!data, error: null }
}

// Server-side validation (SKILL.md: Data Integrity)
function validatePatientData(data: PatientFormValues): { valid: boolean; error?: string } {
    // Normalize TN
    const normalizedTN = normalizeTN(data.hn)

    // TN format validation
    if (!TN_REGEX.test(normalizedTN)) {
        return { valid: false, error: 'รหัส TN ต้องเป็น TN ตามด้วยตัวเลข 6 หลัก (เช่น TN250429)' }
    }

    // Nationality-based validation
    if (data.nationality === 'thai') {
        if (!data.name || data.name.trim().length < 2) {
            return { valid: false, error: 'กรุณากรอกชื่อ-นามสกุล' }
        }
    } else if (data.nationality === 'other') {
        if (!data.name_en || data.name_en.trim().length < 2) {
            return { valid: false, error: 'Please enter name in English' }
        }
    }

    return { valid: true }
}

// Create new patient
export async function createPatient(formData: PatientFormValues) {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { data: null, error: 'ไม่ได้เข้าสู่ระบบ' }
    }

    // Normalize TN
    const normalizedTN = normalizeTN(formData.hn)

    // Server-side validation
    const validation = validatePatientData({ ...formData, hn: normalizedTN })
    if (!validation.valid) {
        return { data: null, error: validation.error }
    }

    // Check TN unique
    const { exists } = await checkTNExists(normalizedTN)
    if (exists) {
        return { data: null, error: `รหัส TN ${normalizedTN} มีอยู่ในระบบแล้ว` }
    }

    const { data, error } = await supabase
        .from('patients')
        .insert({
            hn: normalizedTN,
            name: formData.name,
            name_en: formData.name_en || null,
            birth_date: formData.birth_date || null,
            gender: formData.gender || null,
            phone: formData.phone,
            address: formData.address || null,
            postal_code: formData.postal_code || null,
            nationality: formData.nationality || 'thai',
            emergency_contact_name: formData.emergency_contact_name || null,
            emergency_contact_relationship: formData.emergency_contact_relationship || null,
            emergency_contact_phone: formData.emergency_contact_phone || null,
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
        // Handle unique constraint violation
        if (error.code === '23505') {
            return { data: null, error: `รหัส TN ${normalizedTN} มีอยู่ในระบบแล้ว` }
        }
        return { data: null, error: error.message }
    }

    revalidatePath('/patients')
    return { data, error: null }
}

// Update patient
export async function updatePatient(id: string, formData: PatientFormValues) {
    const supabase = await createClient()

    // Normalize TN
    const normalizedTN = normalizeTN(formData.hn)

    // Server-side validation
    const validation = validatePatientData({ ...formData, hn: normalizedTN })
    if (!validation.valid) {
        return { data: null, error: validation.error }
    }

    // Check TN unique (exclude current patient)
    const { exists } = await checkTNExists(normalizedTN, id)
    if (exists) {
        return { data: null, error: `รหัส TN ${normalizedTN} มีอยู่ในระบบแล้ว` }
    }

    const { data, error } = await supabase
        .from('patients')
        .update({
            hn: normalizedTN,
            name: formData.name,
            name_en: formData.name_en || null,
            birth_date: formData.birth_date || null,
            gender: formData.gender || null,
            phone: formData.phone,
            address: formData.address || null,
            postal_code: formData.postal_code || null,
            nationality: formData.nationality || 'thai',
            emergency_contact_name: formData.emergency_contact_name || null,
            emergency_contact_relationship: formData.emergency_contact_relationship || null,
            emergency_contact_phone: formData.emergency_contact_phone || null,
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
        if (error.code === '23505') {
            return { data: null, error: `รหัส TN ${normalizedTN} มีอยู่ในระบบแล้ว` }
        }
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
