// FILE: src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m === 0) return `${s}s`
  return s > 0 ? `${m}m ${s}s` : `${m}m`
}

export function formatTimer(startTime: string): string {
  const elapsed = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000)
  const h = Math.floor(elapsed / 3600)
  const m = Math.floor((elapsed % 3600) / 60)
  const s = elapsed % 60
  if (h > 0) return `${h}:${pad(m)}:${pad(s)}`
  return `${pad(m)}:${pad(s)}`
}

function pad(n: number) { return String(n).padStart(2, '0') }

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)  return 'Just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24)return `${hours}h ago`
  return `${days}d ago`
}

export function sentimentBadge(s: string | null | undefined) {
  switch (s) {
    case 'positive': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    case 'negative': return 'bg-red-500/10 text-red-400 border-red-500/20'
    default:         return 'bg-surface-300/30 text-surface-700 border-surface-400/20'
  }
}

export function statusBadge(s: string | null | undefined) {
  switch (s) {
    case 'active':    return 'bg-brand-500/10 text-brand-400 border-brand-500/20'
    case 'completed': return 'bg-surface-300/30 text-surface-700 border-surface-400/20'
    case 'missed':    return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    case 'failed':    return 'bg-red-500/10 text-red-400 border-red-500/20'
    default:          return 'bg-surface-300/30 text-surface-700 border-surface-400/20'
  }
}

export function agentStatusBadge(s: string | null | undefined) {
  switch (s) {
    case 'active':   return 'bg-brand-500/10 text-brand-400 border-brand-500/20'
    case 'inactive': return 'bg-red-500/10 text-red-400 border-red-500/20'
    default:         return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  }
}

export function getWorkspaceId(): string {
  return process.env.WORKSPACE_ID ?? process.env.NEXT_PUBLIC_WORKSPACE_ID ?? ''
}