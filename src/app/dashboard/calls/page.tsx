// FILE: src/app/dashboard/calls/page.tsx
import { getCalls } from '@/lib/db/queries'
import { getWorkspaceId, formatDuration, timeAgo, sentimentBadge, statusBadge, cn } from '@/lib/utils'
import { Phone, PhoneIncoming, PhoneMissed, CheckCircle2, AlertCircle, Download } from 'lucide-react'
import CallsClient from '@/components/calls/CallsClient'

export const dynamic = 'force-dynamic'

export default async function CallsPage() {
  const { data: calls, total } = await getCalls(getWorkspaceId(), { limit: 100 })

  // Serialize dates to strings for client
  const serialized = calls.map(c => ({
    ...c,
    startTime:  c.startTime.toISOString(),
    endTime:    c.endTime?.toISOString() ?? null,
    createdAt:  c.createdAt.toISOString(),
    transcript: (c.transcript as any[]) ?? [],
    tags:       (c.tags as string[]) ?? [],
    metadata:   (c.metadata as Record<string,string>) ?? {},
  }))

  return (
    <div className="space-y-6 mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-display text-surface-950 text-3xl">Call Log</h1>
          <p className="mt-1 text-surface-600 text-sm">{total} total calls</p>
        </div>
        <button className="text-sm btn-secondary"><Download className="w-3.5 h-3.5" />Export CSV</button>
      </div>
      <CallsClient calls={serialized} />
    </div>
  )
}