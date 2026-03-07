'use client'
// FILE: src/components/analytics/AnalyticsClient.tsx
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { cn } from '@/lib/utils'

const T = ({ active, payload, label }: any) => active && payload?.length ? (
  <div className="p-3 border border-surface-300/20 rounded-xl text-xs glass-dark">
    <p className="mb-1.5 text-surface-600">{label}</p>
    {payload.map((p: any) => <p key={p.name} className="flex items-center gap-2" style={{ color: p.color }}><span className="rounded-full w-1.5 h-1.5" style={{ background: p.color }} />{p.name}: <strong>{p.value}</strong></p>)}
  </div>
) : null

export default function AnalyticsClient({ data }: { data: any }) {
  const PIE = ['#22c55e', '#52526e', '#ef4444']

  return (
    <div className="space-y-4">
      {/* Volume chart */}
      <div className="card">
        <p className="mb-1 font-medium text-surface-950">Call Volume & Resolution</p>
        <p className="mb-4 text-surface-600 text-xs">30-day trend</p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data.callsByDay} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
            <XAxis dataKey="date" tick={{ fill: '#6e6e8a', fontSize: 9 }} tickFormatter={d => d.slice(5)} interval={4} />
            <YAxis tick={{ fill: '#6e6e8a', fontSize: 9 }} />
            <Tooltip content={<T />} />
            <Legend wrapperStyle={{ fontSize: 11, color: '#9898b0' }} />
            <Area type="monotone" dataKey="calls" name="Total" stroke="#22c55e" strokeWidth={2} fill="url(#g1)" dot={false} />
            <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#15803d" strokeWidth={1.5} fill="none" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="gap-4 grid lg:grid-cols-3">
        {/* By hour */}
        <div className="card">
          <p className="mb-1 font-medium text-surface-950">Calls by Hour</p>
          <p className="mb-4 text-surface-600 text-xs">Peak times</p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={data.callsByHour} margin={{ top: 0, right: 0, bottom: 0, left: -25 }}>
              <XAxis dataKey="hour" tick={{ fill: '#6e6e8a', fontSize: 9 }} tickFormatter={h => `${h}h`} interval={3} />
              <YAxis tick={{ fill: '#6e6e8a', fontSize: 9 }} />
              <Tooltip content={<T />} />
              <Bar dataKey="calls" fill="#22c55e" radius={[2,2,0,0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sentiment */}
        <div className="card">
          <p className="mb-1 font-medium text-surface-950">Sentiment</p>
          <p className="mb-4 text-surface-600 text-xs">AI-scored</p>
          {data.calls === 0 ? (
            <div className="flex justify-center items-center h-32 text-surface-500 text-sm">No data yet</div>
          ) : (
            <div className="flex items-center gap-3">
              <ResponsiveContainer width={100} height={100}>
                <PieChart>
                  <Pie data={[
                    { name: 'Positive', value: data.sentimentBreakdown.positive },
                    { name: 'Neutral',  value: data.sentimentBreakdown.neutral  },
                    { name: 'Negative', value: data.sentimentBreakdown.negative },
                  ]} cx="50%" cy="50%" innerRadius={28} outerRadius={46} paddingAngle={3} dataKey="value">
                    {PIE.map((c,i) => <Cell key={i} fill={c} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {[
                  { l: 'Positive', v: data.sentimentBreakdown.positive, c: 'bg-brand-500' },
                  { l: 'Neutral',  v: data.sentimentBreakdown.neutral,  c: 'bg-surface-500' },
                  { l: 'Negative', v: data.sentimentBreakdown.negative, c: 'bg-red-500' },
                ].map(s => (
                  <div key={s.l}>
                    <div className="flex justify-between mb-0.5 text-xs"><span className="text-surface-600">{s.l}</span><span className="font-medium text-surface-950">{s.v}%</span></div>
                    <div className="bg-surface-300/20 rounded-full h-1.5 overflow-hidden"><div className={cn('rounded-full h-full', s.c)} style={{ width: `${s.v}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Agent perf */}
        <div className="card">
          <p className="mb-4 font-medium text-surface-950">Agent Performance</p>
          {data.agentPerformance.length === 0 ? (
            <div className="flex justify-center items-center h-20 text-surface-500 text-sm">No calls yet</div>
          ) : (
            <div className="space-y-3">
              {data.agentPerformance.map((r: any) => (
                <div key={r.agentId} className="flex items-center gap-2">
                  <div className="flex flex-shrink-0 justify-center items-center bg-brand-500/15 rounded-full w-6 h-6">
                    <span className="font-bold text-[10px] text-brand-400">{r.agentName.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-surface-950 text-xs truncate">{r.agentName}</p>
                    <div className="bg-surface-300/20 mt-1 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-brand-500 rounded-full h-full" style={{ width: `${r.resolutionRate}%` }} />
                    </div>
                  </div>
                  <span className="font-mono text-brand-400 text-xs">{r.resolutionRate}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}