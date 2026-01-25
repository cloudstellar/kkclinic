'use server'

import { createClient } from '@/lib/supabase/server'

// Get prescriptions for doctor: pending ones (รอสรุปเคส)
export async function getPendingForDoctor() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('prescriptions')
        .select(`
            id,
            prescription_no,
            status,
            total_price,
            created_at,
            patient:patients(id, hn, name, name_en, nationality)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching pending prescriptions:', error)
        return { data: null, error: error.message }
    }

    return { data, error: null }
}

// Get prescriptions that are finalized today (สรุปเคสแล้ว)
export async function getFinalizedToday() {
    const supabase = await createClient()

    // Get today's transactions with their prescriptions
    const today = new Date()
    const bangkokOffset = 7 * 60
    const localDate = new Date(today.getTime() + bangkokOffset * 60 * 1000)
    const dateStr = localDate.toISOString().slice(0, 10)

    const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
            id,
            receipt_no,
            status,
            total_amount,
            paid_at,
            prescription:prescriptions(
                id,
                prescription_no,
                patient:patients(id, hn, name, name_en, nationality)
            )
        `)
        .gte('paid_at', `${dateStr}T00:00:00+07:00`)
        .lt('paid_at', `${dateStr}T23:59:59+07:00`)
        .order('paid_at', { ascending: false })

    if (error) {
        console.error('Error fetching finalized:', error)
        return { data: null, error: error.message }
    }

    return { data: transactions || [], error: null }
}
