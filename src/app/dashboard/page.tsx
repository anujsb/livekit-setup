// FILE: src/app/dashboard/page.tsx
import { Suspense } from 'react'
import { getAnalytics, getCalls, getAgents, getDefaultWorkspace } from '@/lib/db/queries'
import { getWorkspaceId, formatDuration, timeAgo, sentimentBadge, statusBadge, cn } from '@/lib/utils'
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'
import Link from 'next/link'
import { Phone, Clock, CheckCircle2, Star, ArrowUpRight, ArrowDownRight, ChevronRight, Zap, PhoneIncoming } from 'lucide-react'
import DashboardClient from '@/components/dashboard/DashboardClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardPage() {
  const [analytics, { data: recentCalls }, agents, workspace] = await Promise.all([
    getAnalytics(getWorkspaceId(), 30),
    getCalls(getWorkspaceId(), { limit: 5 }),
    getAgents(getWorkspaceId()),
    getDefaultWorkspace(),
  ])

  const stats = [
    { label: 'Total Calls',     value: analytics.calls.toLocaleString(),           delta: analytics.callsDelta,        icon: Phone },
    { label: 'Avg Duration',    value: formatDuration(analytics.avgDuration),       delta: analytics.durationDelta,     icon: Clock },
    { label: 'Resolution Rate', value: `${analytics.resolutionRate}%`,              delta: analytics.resolutionDelta,   icon: CheckCircle2 },
    { label: 'Satisfaction',    value: analytics.satisfactionScore > 0 ? `${analytics.satisfactionScore}/5` : '—', delta: analytics.satisfactionDelta, icon: Star },
  ]

  return (
    <div className="space-y-6 mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-display text-surface-950 text-3xl">{workspace?.name ?? 'Dashboard'}</h1>
          <p className="mt-1 text-surface-600 text-sm">Last 30 days · {agents.filter(a => a.status === 'active').length} agents active</p>
        </div>
        <Link href="/dashboard/agents/new" className="btn-primary">
          <Zap className="w-3.5 h-3.5" />
          New Agent
        </Link>
      </div>

      {/* Stats */}
      <div className="gap-4 grid grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <div key={s.label} className="card" style={{ animationDelay: `${i * 60}ms` }}>
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

      {/* Charts row */}
      <div className="gap-4 grid lg:grid-cols-3">
        <div className="lg:col-span-2 card">
          <p className="mb-1 font-medium text-surface-950">Call Volume</p>
          <p className="mb-4 text-surface-600 text-xs">30-day trend</p>
          <DashboardClient callsByDay={analytics.callsByDay} />
        </div>

        {/* Sentiment */}
        <div className="card">
          <p className="mb-1 font-medium text-surface-950">Sentiment</p>
          <p className="mb-4 text-surface-600 text-xs">AI-analyzed</p>
          {analytics.calls === 0 ? (
            <div className="flex flex-col justify-center items-center py-8 text-surface-600">
              <Phone className="opacity-20 mb-2 w-8 h-8" />
              <p className="text-sm">No calls yet</p>
              <p className="mt-1 text-xs">Start a call to see analysis</p>
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { k: 'positive', label: 'Positive', v: analytics.sentimentBreakdown.positive, color: 'bg-brand-500' },
                { k: 'neutral',  label: 'Neutral',  v: analytics.sentimentBreakdown.neutral,  color: 'bg-surface-500' },
                { k: 'negative', label: 'Negative', v: analytics.sentimentBreakdown.negative, color: 'bg-red-500' },
              ].map(s => (
                <div key={s.k}>
                  <div className="flex justify-between mb-1 text-xs">
                    <span className="text-surface-700">{s.label}</span>
                    <span className="font-medium text-surface-950">{s.v}%</span>
                  </div>
                  <div className="bg-surface-300/20 rounded-full h-1.5 overflow-hidden">
                    <div className={cn('rounded-full h-full transition-all duration-700', s.color)} style={{ width: `${s.v}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom */}
      <div className="gap-4 grid lg:grid-cols-2">
        {/* Agent performance */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <p className="font-medium text-surface-950">Agents</p>
            <Link href="/dashboard/agents" className="flex items-center gap-1 text-brand-400 hover:text-brand-300 text-xs">View all <ChevronRight className="w-3 h-3" /></Link>
          </div>
          {agents.length === 0 ? (
            <div className="py-8 text-surface-600 text-center">
              <p className="text-sm">No agents yet</p>
              <Link href="/dashboard/agents/new" className="block mt-1 text-brand-400 text-xs">Create your first agent →</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {analytics.agentPerformance.slice(0, 4).map(row => (
                <div key={row.agentId} className="flex items-center gap-3 bg-surface-200/20 hover:bg-surface-200/35 p-3 rounded-xl transition-colors">
                  <div className="flex flex-shrink-0 justify-center items-center bg-brand-500/15 rounded-full w-7 h-7">
                    <span className="font-bold text-brand-400 text-xs">{row.agentName.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-surface-950 text-sm truncate">{row.agentName}</p>
                    <p className="text-surface-600 text-xs">{row.calls} calls · {formatDuration(row.avgDuration)} avg</p>
                  </div>
                  <span className="font-medium text-brand-400 text-sm">{row.resolutionRate}%</span>
                </div>
              ))}
              {analytics.agentPerformance.length === 0 && agents.map(a => (
                <div key={a.id} className="flex items-center gap-3 bg-surface-200/20 p-3 rounded-xl">
                  <div className="flex flex-shrink-0 justify-center items-center bg-brand-500/15 rounded-full w-7 h-7">
                    <span className="font-bold text-brand-400 text-xs">{a.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-surface-950 text-sm truncate">{a.name}</p>
                    <p className="text-surface-600 text-xs">0 calls</p>
                  </div>
                  <span className={cn('badge', a.status === 'active' ? 'bg-brand-500/10 text-brand-400 border-brand-500/20' : 'bg-surface-300/30 text-surface-600 border-surface-400/20')}>{a.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent calls */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <p className="font-medium text-surface-950">Recent Calls</p>
            <Link href="/dashboard/calls" className="flex items-center gap-1 text-brand-400 hover:text-brand-300 text-xs">View all <ChevronRight className="w-3 h-3" /></Link>
          </div>
          {recentCalls.length === 0 ? (
            <div className="py-8 text-surface-600 text-center">
              <Phone className="opacity-20 mx-auto mb-2 w-8 h-8" />
              <p className="text-sm">No calls yet</p>
              <p className="mt-1 text-xs">Test an agent to see calls here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentCalls.map(call => (
                <div key={call.id} className="flex items-center gap-3 bg-surface-200/20 hover:bg-surface-200/35 p-3 rounded-xl transition-colors">
                  <div className={cn('flex flex-shrink-0 justify-center items-center rounded-full w-7 h-7',
                    call.status === 'completed' ? 'bg-brand-500/15' : call.status === 'missed' ? 'bg-amber-500/15' : 'bg-surface-200/40')}>
                    <PhoneIncoming className={cn('w-3.5 h-3.5',
                      call.status === 'completed' ? 'text-brand-400' : call.status === 'missed' ? 'text-amber-400' : 'text-surface-600')} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-surface-950 text-sm truncate">{call.callerName ?? 'Unknown'}</p>
                    <p className="text-surface-600 text-xs truncate">{call.agentName}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    {call.sentiment && <span className={cn('block mb-1 text-[10px] badge', sentimentBadge(call.sentiment))}>{call.sentiment}</span>}
                    <p className="text-[10px] text-surface-600">{timeAgo(call.startTime.toISOString())}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}