import { notFound } from 'next/navigation'
import { getTransaction } from '../../actions'
import { ReceiptView } from './receipt-view'
import { createClient } from '@/lib/supabase/server'

// Force dynamic since we're fetching transaction data that changes often
// and we want fresh data for the receipt
export const dynamic = 'force-dynamic'

export default async function ReceiptPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const { data: transaction, error } = await getTransaction(id)

    if (error || !transaction) {
        notFound()
    }

    // Get current user role for permission check
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    let userRole = 'staff'

    if (user) {
        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()
        userRole = userData?.role || 'staff'
    }

    return <ReceiptView transaction={transaction as any} userRole={userRole} />
}
