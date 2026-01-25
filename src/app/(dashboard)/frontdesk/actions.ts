'use server'

import { createClient } from '@/lib/supabase/server'
import { getTodayRange } from '@/lib/date-utils'

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

// Get today's transactions (รอดำเนินการ) - excludes voided and closed
export async function getTodayTransactions() {
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
            voided_at,
            closed_at,
            patient:patients(id, hn, name, name_en, nationality),
            prescription:prescriptions(id, prescription_no)
        `)
        .gte('paid_at', start)
        .lt('paid_at', nextStart)
        .is('voided_at', null)
        .is('closed_at', null)
        .order('paid_at', { ascending: false })

    if (error) {
        console.error('Error fetching today transactions:', error)
        return { data: null, error: error.message }
    }

    return { data: transactions || [], error: null }
}

// Close a transaction (ปิดงาน)
export async function closeTransaction(transactionId: string) {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    const { start, nextStart } = getTodayRange('Asia/Bangkok')

    // Conditional update: only if not already closed, not voided, and from today
    const { data, error } = await supabase
        .from('transactions')
        .update({
            closed_at: new Date().toISOString(),
            closed_by: user.id
        })
        .eq('id', transactionId)
        .is('closed_at', null)
        .is('voided_at', null)
        .gte('paid_at', start)
        .lt('paid_at', nextStart)
        .select('id, closed_at, closed_by')

    if (error) {
        console.error('Error closing transaction:', error)
        return { success: false, error: error.message }
    }

    // Check if any row was actually updated
    if (data && data.length > 0) {
        return { success: true, status: 'closed' as const }
    }

    // No rows affected = idempotent (already closed) or not eligible
    return { success: true, status: 'noop' as const }
}
