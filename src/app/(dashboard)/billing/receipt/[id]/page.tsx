import { notFound } from 'next/navigation'
import { getTransaction } from '../../actions'
import { ReceiptView } from './receipt-view'

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

    return <ReceiptView transaction={transaction as any} />
}
