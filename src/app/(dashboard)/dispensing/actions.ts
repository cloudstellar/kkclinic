'use server'

import { createClient } from '@/lib/supabase/server'
import { getTodayRange } from '@/lib/date-utils'

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
    const { start, nextStart } = getTodayRange('Asia/Bangkok')

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
        .gte('paid_at', start)
        .lt('paid_at', nextStart)
        .order('paid_at', { ascending: false })

    if (error) {
        console.error('Error fetching finalized:', error)
        return { data: null, error: error.message }
    }

    return { data: transactions || [], error: null }
}

// Get recent transactions (for "ดูย้อนหลัง" feature)
export async function getRecentTransactions() {
    const supabase = await createClient()

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
        .order('paid_at', { ascending: false })
        .limit(20)

    if (error) {
        console.error('Error fetching recent transactions:', error)
        return { data: null, error: error.message }
    }

    return { data: transactions || [], error: null }
}

