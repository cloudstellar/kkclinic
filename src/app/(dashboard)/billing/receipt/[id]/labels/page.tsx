import { notFound } from 'next/navigation'
import { getTransaction } from '../../../actions'
import { LabelPrintView } from './label-print-view'

export const dynamic = 'force-dynamic'

export default async function LabelsPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const { data: transaction, error } = await getTransaction(id)

    if (error || !transaction) {
        notFound()
    }

    // Only allow printing labels for paid transactions
    if (transaction.status === 'voided') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 text-xl mb-4">❌ ไม่สามารถพิมพ์ฉลากยาได้</p>
                    <p className="text-muted-foreground">บิลนี้ถูกยกเลิกแล้ว</p>
                </div>
            </div>
        )
    }

    return <LabelPrintView transaction={transaction} />
}
