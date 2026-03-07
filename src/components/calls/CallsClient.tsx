'use client'
// FILE: src/components/calls/CallsClient.tsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Bot, User, ChevronRight, CheckCircle2, AlertCircle, Tag, MessageSquare, Download } from 'lucide-react'
import { cn, formatDuration, timeAgo, sentimentBadge, statusBadge } from '@/lib/utils'

interface TranscriptEntry { id: string; role: 'agent'|'user'; content: string; timestamp: string }
interface Call {
  id: string; agentName: string; callerName: string|null; callerPhone: string|null
  status: string; sentiment: string|null; direction: string; startTime: string
  endTime: string|null; durationSeconds: number|null; summary: string|null
  resolvedWithoutEscalation: boolean; transcript: TranscriptEntry[]; tags: string[]
}

function TranscriptPanel({ call, onClose }: { call: Call; onClose: () => void }) {
  return (
    <motion.div initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 60, opacity: 0 }}
      className="right-0 z-40 fixed inset-y-0 flex flex-col shadow-2xl border-surface-300/20 border-l w-full max-w-md glass-dark">
      <div className="flex items-center gap-3 p-4 border-surface-300/15 border-b">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-surface-950">{call.callerName ?? 'Unknown Caller'}</p>
          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
            <span className={cn('text-[10px] badge', statusBadge(call.status))}>{call.status}</span>
            {call.sentiment && <span className={cn('text-[10px] badge', sentimentBadge(call.sentiment))}>{call.sentiment}</span>}
            {call.durationSeconds && <span className="text-surface-600 text-xs">{formatDuration(call.durationSeconds)}</span>}
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl btn-ghost"><X className="w-4 h-4" /></button>
      </div>

      {call.summary && (
        <div className="mx-4 mt-4 p-3 rounded-xl glass">
          <p className="mb-1 font-medium text-[10px] text-surface-600 uppercase tracking-wider">AI Summary</p>
          <p className="text-surface-950 text-sm">{call.summary}</p>
        </div>
      )}

      {call.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mx-4 mt-2">
          {call.tags.map(t => <span key={t} className="text-[10px] badge glass"><Tag className="w-2.5 h-2.5" />{t}</span>)}
        </div>
      )}

      <div className="flex-1 space-y-3 p-4 overflow-y-auto">
        <p className="font-medium text-[10px] text-surface-600 uppercase tracking-wider">Transcript</p>
        {call.transcript.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-surface-500">
            <MessageSquare className="opacity-20 mb-2 w-7 h-7" />
            <p className="text-sm">No transcript available</p>
          </div>
        ) : call.transcript.map(e => (
          <div key={e.id} className={cn('flex gap-2', e.role === 'user' && 'flex-row-reverse')}>
            <div className={cn('flex flex-shrink-0 justify-center items-center mt-0.5 rounded-full w-5 h-5', e.role === 'agent' ? 'bg-brand-500/20' : 'bg-surface-300/40')}>
              {e.role === 'agent' ? <Bot className="w-2.5 h-2.5 text-brand-400" /> : <User className="w-2.5 h-2.5 text-surface-600" />}
            </div>
            <div className={cn('px-3 py-2 rounded-xl max-w-[80%] text-xs leading-relaxed',
              e.role === 'agent' ? 'bg-brand-500/8 border border-brand-500/12 text-surface-950 rounded-tl-sm' : 'bg-surface-200/40 border border-surface-300/15 text-surface-800 rounded-tr-sm')}>
              {e.content}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 p-4 border-surface-300/15 border-t">
        <button className="flex-1 text-sm btn-secondary"><Download className="w-3.5 h-3.5" />Export</button>
        <div className={cn('flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs',
          call.resolvedWithoutEscalation ? 'bg-brand-500/8 border-brand-500/15 text-brand-400' : 'bg-amber-500/8 border-amber-500/15 text-amber-400')}>
          {call.resolvedWithoutEscalation ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
          {call.resolvedWithoutEscalation ? 'Resolved' : 'Escalated'}
        </div>
      </div>
    </motion.div>
  )
}

export default function CallsClient({ calls }: { calls: Call[] }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState<Call|null>(null)

  const filtered = calls.filter(c => {
    const q = search.toLowerCase()
    return (!q || c.callerName?.toLowerCase().includes(q) || c.agentName.toLowerCase().includes(q))
      && (statusFilter === 'all' || c.status === statusFilter)
  })

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="top-1/2 left-3 absolute w-3.5 h-3.5 text-surface-600 -translate-y-1/2" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search calls…" className="pl-9 input" />
        </div>
        <div className="flex gap-1.5">
          {['all','completed','missed','active','failed'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={cn('px-3 py-2 border rounded-xl text-xs capitalize transition-all',
                statusFilter === s ? 'bg-brand-500/12 border-brand-500/20 text-brand-400' : 'glass border-surface-400/20 text-surface-600 hover:text-surface-950')}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="p-0 overflow-hidden card">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-surface-500">
            <MessageSquare className="opacity-20 mb-2 w-8 h-8" />
            <p className="text-sm">{calls.length === 0 ? 'No calls yet — test an agent to see calls here' : 'No calls match your filter'}</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-surface-300/15 border-b">
                {['Caller','Agent','Status','Duration','Sentiment','Resolved','Time',''].map(h => (
                  <th key={h} className="px-4 py-3 font-medium text-[10px] text-surface-600 text-left uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-300/8">
              {filtered.map(call => (
                <tr key={call.id} onClick={() => setSelected(call)}
                  className={cn('group hover:bg-surface-200/15 transition-colors cursor-pointer', selected?.id === call.id && 'bg-brand-500/4')}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-surface-950 text-sm">{call.callerName ?? 'Unknown'}</p>
                    {call.callerPhone && <p className="font-mono text-[10px] text-surface-500">{call.callerPhone}</p>}
                  </td>
                  <td className="px-4 py-3 max-w-[120px] text-surface-700 text-xs truncate">{call.agentName}</td>
                  <td className="px-4 py-3"><span className={cn('badge', statusBadge(call.status))}>{call.status}</span></td>
                  <td className="px-4 py-3 font-mono text-surface-700 text-xs">{formatDuration(call.durationSeconds)}</td>
                  <td className="px-4 py-3">{call.sentiment ? <span className={cn('badge', sentimentBadge(call.sentiment))}>{call.sentiment}</span> : <span className="text-surface-500 text-xs">—</span>}</td>
                  <td className="px-4 py-3">{call.resolvedWithoutEscalation ? <CheckCircle2 className="w-4 h-4 text-brand-400" /> : <AlertCircle className="w-4 h-4 text-amber-400" />}</td>
                  <td className="px-4 py-3 text-surface-600 text-xs">{timeAgo(call.startTime)}</td>
                  <td className="px-4 py-3"><ChevronRight className="opacity-0 group-hover:opacity-100 w-4 h-4 text-surface-500 transition-opacity" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
              className="z-30 fixed inset-0 bg-black" onClick={() => setSelected(null)} />
            <TranscriptPanel call={selected} onClose={() => setSelected(null)} />
          </>
        )}
      </AnimatePresence>
    </>
  )
}