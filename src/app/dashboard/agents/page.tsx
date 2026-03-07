// FILE: src/app/dashboard/agents/page.tsx
import { getAgents, getAgentStats } from '@/lib/db/queries'
import { getWorkspaceId, agentStatusBadge, formatDuration, cn } from '@/lib/utils'
import Link from 'next/link'
import { Plus, Bot, Phone, Settings, CheckCircle, Clock } from 'lucide-react'
import AgentActionsClient from '@/components/agents/AgentActionsClient'

export const dynamic = 'force-dynamic'

export default async function AgentsPage() {
  const agents = await getAgents(getWorkspaceId())

  // Fetch stats for all agents in parallel
  const agentsWithStats = await Promise.all(
    agents.map(async a => ({ ...a, stats: await getAgentStats(a.id) }))
  )

  return (
    <div className="space-y-6 mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-display text-surface-950 text-3xl">Agents</h1>
          <p className="mt-1 text-surface-600 text-sm">
            {agentsWithStats.filter(a => a.status === 'active').length} active · {agentsWithStats.length} total
          </p>
        </div>
        <Link href="/dashboard/agents/new" className="btn-primary">
          <Plus className="w-4 h-4" />
          New Agent
        </Link>
      </div>

      <div className="gap-4 grid md:grid-cols-2 xl:grid-cols-3">
        {agentsWithStats.map(agent => (
          <div key={agent.id} className="group hover:border-surface-400/40 transition-all card">
            {/* Header */}
            <div className="flex items-start gap-3 mb-4">
              <div className="relative flex-shrink-0">
                <div className="flex justify-center items-center bg-brand-500/10 border border-brand-500/20 rounded-xl w-11 h-11">
                  <Bot className="w-5 h-5 text-brand-400" />
                </div>
                {agent.status === 'active' && (
                  <div className="-right-0.5 -bottom-0.5 absolute bg-brand-500 border-2 border-surface-100 rounded-full w-3 h-3" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-surface-950 truncate">{agent.name}</p>
                <p className="text-surface-600 text-xs">{agent.businessName}</p>
                <span className={cn('mt-1 badge', agentStatusBadge(agent.status))}>{agent.status}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="gap-2 grid grid-cols-3 mb-4">
              {[
                { label: 'Today',    value: agent.stats.callsToday },
                { label: 'Resolved', value: `${agent.stats.resolutionRate}%` },
                { label: 'Avg',      value: formatDuration(agent.stats.avgDuration) },
              ].map(s => (
                <div key={s.label} className="bg-surface-200/25 p-2 rounded-xl text-center">
                  <p className="font-display text-surface-950 text-sm">{s.value}</p>
                  <p className="text-[10px] text-surface-600">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Greeting */}
            <p className="bg-surface-200/20 mb-4 px-3 py-2 border-brand-500/25 border-l-2 rounded-xl text-surface-600 text-xs italic line-clamp-2">
              "{agent.greeting}"
            </p>

            {/* Actions */}
            <div className="flex gap-2 pt-3 border-surface-300/15 border-t">
              <AgentActionsClient agentId={agent.id} agentName={agent.name} agentGreeting={agent.greeting} currentStatus={agent.status} />
              <Link href={`/dashboard/agents/${agent.id}`} className="flex-1 justify-center py-2 text-xs btn-secondary">
                <Settings className="w-3.5 h-3.5" />
                Configure
              </Link>
            </div>
          </div>
        ))}

        {/* Add card */}
        <Link href="/dashboard/agents/new"
          className="group flex flex-col justify-center items-center hover:bg-brand-500/3 border-surface-400/25 hover:border-brand-500/35 border-dashed min-h-[260px] transition-all cursor-pointer card">
          <div className="flex justify-center items-center bg-surface-200/30 group-hover:bg-brand-500/10 mb-3 border border-surface-400/30 group-hover:border-brand-500/25 border-dashed rounded-xl w-11 h-11 transition-all">
            <Plus className="w-5 h-5 text-surface-600 group-hover:text-brand-400 transition-colors" />
          </div>
          <p className="font-medium text-surface-600 group-hover:text-surface-950 text-sm transition-colors">Create New Agent</p>
          <p className="mt-0.5 text-surface-500 text-xs">Deploy in minutes</p>
        </Link>
      </div>
    </div>
  )
}