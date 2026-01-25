'use server'

import { createClient } from '@/lib/supabase/server'

// Get prescriptions without transactions (รอสรุปเคส)
export async function getPendingPrescriptions() {
    const supabase = await createClient()

    // Get prescriptions that don't have a paid transaction
    const { data: prescriptions, error } = await supabase
        .from('prescriptions')
        .select(`
            id,
            prescription_no,
            status,
            total_price,
            created_at,
            patient:patients(id, hn, name, name_en, nationality)
        `)
        .in('status', ['pending', 'finished'])
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching pending prescriptions:', error)
        return { data: null, error: error.message }
    }

    // Filter out those that already have paid transactions
    const { data: paidTxs } = await supabase
        .from('transactions')
        .select('prescription_id')
        .eq('status', 'paid')

    const paidPrescriptionIds = new Set(paidTxs?.map(tx => tx.prescription_id) || [])

    const pendingRx = prescriptions?.filter(rx => !paidPrescriptionIds.has(rx.id)) || []

    return { data: pendingRx, error: null }
}

// Get today's transactions (รอดำเนินการ)
export async function getTodayTransactions() {
    const supabase = await createClient()

    // Get today's date in Bangkok timezone
    const today = new Date()
    const bangkokOffset = 7 * 60 // UTC+7
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
            patient:patients(id, hn, name, name_en, nationality),
            prescription:prescriptions(id, prescription_no)
        `)
        .gte('paid_at', `${dateStr}T00:00:00+07:00`)
        .lt('paid_at', `${dateStr}T23:59:59+07:00`)
        .order('paid_at', { ascending: false })

    if (error) {
        console.error('Error fetching today transactions:', error)
        return { data: null, error: error.message }
    }

    return { data: transactions || [], error: null }
}
