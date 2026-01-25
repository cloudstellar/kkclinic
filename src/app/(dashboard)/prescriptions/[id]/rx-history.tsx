import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getRxHistory } from '@/app/(dashboard)/billing/actions'

type HistoryEvent = {
    type: 'created' | 'adjusted' | 'voided'
    at: string
    label: string
    by?: string
    detail?: string
}

const eventIcons: Record<string, string> = {
    created: '✅',
    adjusted: '🔧',
    voided: '❌'
}

const eventColors: Record<string, string> = {
    created: 'text-green-600',
    adjusted: 'text-blue-600',
    voided: 'text-red-600'
}

export async function RxHistory({ prescriptionId }: { prescriptionId: string }) {
    const { data: events } = await getRxHistory(prescriptionId)

    if (!events || events.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">📋 ประวัติ</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">ยังไม่มีประวัติ (รอสรุปเคส)</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">📋 ประวัติ</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {events.map((event: HistoryEvent, idx: number) => (
                        <div key={idx} className="flex items-start gap-3">
                            <span className="text-lg">{eventIcons[event.type]}</span>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`font-medium ${eventColors[event.type]}`}>
                                        {event.label}
                                    </span>
                                    {event.detail && (
                                        <span className="text-sm text-muted-foreground">
                                            | {event.detail}
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {new Date(event.at).toLocaleString('th-TH', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                    {event.by && <span> | {event.by}</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
