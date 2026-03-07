'use client'
// FILE: src/components/dashboard/DashboardClient.tsx
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts'

export default function DashboardClient({ callsByDay }: { callsByDay: { date: string; calls: number; resolved: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={callsByDay} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="date" tick={{ fill: '#6e6e8a', fontSize: 9 }} tickFormatter={d => d.slice(5)} interval={6} />
        <Tooltip contentStyle={{ background: '#13131f', border: '1px solid #2e2e45', borderRadius: 10, fontSize: 11 }} labelStyle={{ color: '#9898b0' }} />
        <Area type="monotone" dataKey="calls" stroke="#22c55e" strokeWidth={2} fill="url(#g1)" dot={false} name="Calls" />
        <Area type="monotone" dataKey="resolved" stroke="#15803d" strokeWidth={1.5} fill="none" dot={false} name="Resolved" />
      </AreaChart>
    </ResponsiveContainer>
  )
}