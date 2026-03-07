// FILE: src/app/dashboard/analytics/page.tsx
import { getAnalytics } from '@/lib/db/queries'
import { getWorkspaceId, formatDuration, cn } from '@/lib/utils'
import { ArrowUpRight, ArrowDownRight, Phone, Clock, CheckCircle2, Star, Download } from 'lucide-react'
import AnalyticsClient from '@/components/analytics/AnalyticsClient'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const data = await getAnalytics(getWorkspaceId(), 30)

  const stats = [
    { label: 'Total Calls',     value: data.calls.toLocaleString(),       delta: data.callsDelta,       icon: Phone },
    { label: 'Avg Duration',    value: formatDuration(data.avgDuration),  delta: data.durationDelta,    icon: Clock },
    { label: 'Resolution Rate', value: `${data.resolutionRate}%`,         delta: data.resolutionDelta,  icon: CheckCircle2 },
    { label: 'CSAT',            value: data.satisfactionScore > 0 ? `${data.satisfactionScore}/5` : '—', delta: data.satisfactionDelta, icon: Star },
  ]

  return (
    <div className="space-y-6 mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-display text-surface-950 text-3xl">Analytics</h1>
          <p className="mt-1 text-surface-600 text-sm">Last 30 days · Live from database</p>
        </div>
        <button className="text-sm btn-secondary"><Download className="w-3.5 h-3.5" />Export</button>
      </div>

      <div className="gap-4 grid grid-cols-2 lg:grid-cols-4">
        {stats.map(s => (
          <div key={s.label} className="card">
            <div className="flex justify-between items-start mb-3">
              <div className="flex justify-center items-center bg-brand-500/10 rounded-lg w-8 h-8">
                <s.icon className="w-4 h-4 text-brand-400" />
              </div>
              {s.delta !== 0 && (
                <span className={cn('flex items-center font-medium text-xs', s.delta >= 0 ? 'text-brand-400' : 'text-red-400')}>
                  {s.delta >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(s.delta)}%
                </span>
              )}
            </div>
            <p className="font-display text-surface-950 text-2xl">{s.value}</p>
            <p className="mt-0.5 text-surface-600 text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      <AnalyticsClient data={data} />
    </div>
  )
}