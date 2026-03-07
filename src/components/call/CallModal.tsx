'use client'
// FILE: src/components/call/CallModal.tsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, PhoneOff, Mic, MicOff, Volume2, X, Loader2, Bot, User, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import {
  LiveKitRoom, useLocalParticipant, useRoomContext,
  RoomAudioRenderer, useConnectionState,
} from '@livekit/components-react'
import { Track, ConnectionState, RoomEvent } from 'livekit-client'
import { cn, formatTimer } from '@/lib/utils'
import { nanoid } from 'nanoid'

interface TranscriptEntry { id: string; role: 'agent' | 'user'; content: string; timestamp: string }

function WaveForm({ active }: { active: boolean }) {
  return (
    <div className={cn('flex items-end gap-0.5 h-7', !active && 'opacity-20')}>
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className={cn('w-1.5 wave-bar', !active && '[animation-play-state:paused] bg-surface-500')} />
      ))}
    </div>
  )
}

function TranscriptView({ entries, agentName }: { entries: TranscriptEntry[]; agentName: string }) {
  const bottomRef = useRef<HTMLDivElement>(null)
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [entries])
  return (
    <div className="flex-1 space-y-3 px-4 py-3 min-h-0 overflow-y-auto">
      {entries.length === 0 ? (
        <div className="flex flex-col justify-center items-center h-full text-surface-600">
          <Bot className="opacity-20 mb-2 w-7 h-7" />
          <p className="text-sm">Waiting for conversation…</p>
        </div>
      ) : entries.map(e => (
        <div key={e.id} className={cn('flex gap-2', e.role === 'user' && 'flex-row-reverse')}>
          <div className={cn('flex flex-shrink-0 justify-center items-center mt-0.5 rounded-full w-6 h-6', e.role === 'agent' ? 'bg-brand-500/20' : 'bg-surface-300/40')}>
            {e.role === 'agent' ? <Bot className="w-3 h-3 text-brand-400" /> : <User className="w-3 h-3 text-surface-600" />}
          </div>
          <div className={cn('px-3 py-2 rounded-2xl max-w-[80%] text-sm leading-relaxed',
            e.role === 'agent' ? 'bg-brand-500/8 border border-brand-500/15 text-surface-950 rounded-tl-sm' : 'bg-surface-200/50 border border-surface-300/20 text-surface-900 rounded-tr-sm')}>
            {e.content}
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  )
}

function ActiveRoom({ agentName, onEnd, onTranscript }: {
  agentName: string; onEnd: () => void; onTranscript: (e: TranscriptEntry) => void
}) {
  const { localParticipant } = useLocalParticipant()
  const room = useRoomContext()
  const connState = useConnectionState()
  const [muted, setMuted] = useState(false)
  const [agentSpeaking, setAgentSpeaking] = useState(false)

  useEffect(() => {
    if (!room) return
    const handler = (payload: Uint8Array) => {
      try {
        const msg = JSON.parse(new TextDecoder().decode(payload))
        if (msg.type === 'transcript') {
          onTranscript({ id: nanoid(), role: msg.role, content: msg.content, timestamp: new Date().toISOString() })
        }
        if (msg.type === 'agent_speaking') setAgentSpeaking(msg.value)
      } catch {}
    }
    room.on(RoomEvent.DataReceived, handler)
    return () => { room.off(RoomEvent.DataReceived, handler) }
  }, [room, onTranscript])

  const toggleMute = async () => {
    await localParticipant?.setMicrophoneEnabled(muted)
    setMuted(!muted)
  }

  return (
    <>
      <RoomAudioRenderer />
      <div className="flex justify-center items-center py-2 border-surface-300/15 border-b">
        {connState !== ConnectionState.Connected
          ? <div className="flex items-center gap-1.5 text-amber-400 text-xs"><Loader2 className="w-3 h-3 animate-spin" />Connecting…</div>
          : <div className="flex items-center gap-1.5 text-brand-400 text-xs"><div className="bg-brand-500 rounded-full w-1.5 h-1.5 animate-pulse" />Live via LiveKit</div>}
      </div>
      <div className="flex justify-around items-center px-6 py-3">
        <div className="flex flex-col items-center gap-1"><WaveForm active={agentSpeaking} /><span className="text-[10px] text-surface-600">{agentName}</span></div>
        <div className="bg-surface-300/15 w-px h-7" />
        <div className="flex flex-col items-center gap-1"><WaveForm active={!muted} /><span className="text-[10px] text-surface-600">You</span></div>
      </div>
      <div className="flex justify-center items-center gap-3 py-3 border-surface-300/15 border-t">
        <button onClick={toggleMute} className={cn('flex flex-col items-center gap-1 p-3 border rounded-2xl w-13 h-13 transition-all', muted ? 'bg-amber-500/12 border-amber-500/25 text-amber-400' : 'glass border-surface-400/20 text-surface-700')}>
          {muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          <span className="text-[9px]">{muted ? 'Unmute' : 'Mute'}</span>
        </button>
        <button onClick={onEnd} className="flex flex-col items-center gap-1 bg-red-500 hover:bg-red-400 p-3 rounded-2xl w-14 h-14 text-white active:scale-95 transition-all">
          <PhoneOff className="mt-0.5 w-5 h-5" />
          <span className="text-[9px]">End</span>
        </button>
        <button className="flex flex-col items-center gap-1 p-3 border border-surface-400/20 rounded-2xl w-13 h-13 text-surface-700 transition-all glass">
          <Volume2 className="w-5 h-5" />
          <span className="text-[9px]">Speaker</span>
        </button>
      </div>
    </>
  )
}

interface Props { agentId: string; agentName: string; greeting: string; onClose: () => void }

export default function CallModal({ agentId, agentName, greeting, onClose }: Props) {
  const [phase, setPhase] = useState<'idle'|'connecting'|'active'|'ending'|'ended'>('idle')
  const [token, setToken] = useState<string|null>(null)
  const [roomName, setRoomName] = useState<string|null>(null)
  const [callId, setCallId] = useState<string|null>(null)
  const [startTime, setStartTime] = useState<string|null>(null)
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
  const [error, setError] = useState<string|null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (phase !== 'active') return
    const t = setInterval(() => setTick(n => n+1), 1000)
    return () => clearInterval(t)
  }, [phase])

  const start = async () => {
    setPhase('connecting'); setError(null)
    try {
      const res = await fetch('/api/livekit/token', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, callerName: 'Test Caller' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setToken(data.token); setRoomName(data.roomName); setCallId(data.callId)
      setStartTime(new Date().toISOString())
      setTranscript([{ id: nanoid(), role: 'agent', content: greeting, timestamp: new Date().toISOString() }])
      setPhase('active')
    } catch (e: any) { setError(e.message); setPhase('idle') }
  }

  const end = async () => {
    setPhase('ending')
    // Save final transcript to DB
    if (callId && transcript.length > 0) {
      await fetch('/api/calls', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId, transcript }),
      }).catch(() => {})
    }
    // Trigger analysis
    if (agentId && transcript.length > 0) {
      await fetch('/api/agent/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, action: 'analyze', transcript, roomName }),
      }).catch(() => {})
    }
    setTimeout(() => setPhase('ended'), 600)
  }

  const addTranscript = useCallback((e: TranscriptEntry) => setTranscript(p => [...p, e]), [])

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="z-50 fixed inset-0 flex justify-center items-center bg-black/65 backdrop-blur-sm p-4"
        onClick={e => e.target === e.currentTarget && phase === 'idle' && onClose()}>
        <motion.div initial={{ opacity: 0, scale: 0.92, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          className="shadow-2xl border border-surface-300/20 rounded-3xl w-full max-w-md overflow-hidden glass-dark">

          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-surface-300/15 border-b">
            <div className={cn('relative flex flex-shrink-0 justify-center items-center rounded-2xl w-10 h-10',
              phase === 'active' ? 'bg-brand-500/15' : 'bg-surface-200/40')}>
              <Bot className={cn('w-5 h-5', phase === 'active' ? 'text-brand-400' : 'text-surface-600')} />
              {phase === 'active' && <span className="absolute inset-0 rounded-2xl ring-pulse" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-surface-950 truncate">{agentName}</p>
              <p className="text-surface-600 text-xs">
                {phase === 'idle'       && 'Ready'}
                {phase === 'connecting' && 'Connecting…'}
                {phase === 'active'     && startTime && `Live · ${formatTimer(startTime)}`}
                {phase === 'ending'     && 'Ending…'}
                {phase === 'ended'      && 'Ended'}
              </p>
            </div>
            {(phase === 'idle' || phase === 'ended') && (
              <button onClick={onClose} className="p-1.5 rounded-lg btn-ghost"><X className="w-3.5 h-3.5" /></button>
            )}
          </div>

          {phase === 'idle' && (
            <div className="flex flex-col items-center gap-4 p-6">
              <div className="flex justify-center items-center bg-brand-500/10 border border-brand-500/20 rounded-full w-16 h-16">
                <Phone className="w-7 h-7 text-brand-400" />
              </div>
              <div className="text-center">
                <p className="font-medium text-surface-950">Test {agentName}</p>
                <p className="mt-1 text-surface-600 text-xs">Live WebRTC call via LiveKit</p>
              </div>
              {error && (
                <div className="flex items-center gap-2 bg-red-500/8 p-3 border border-red-500/15 rounded-xl w-full text-red-400 text-xs">
                  <AlertCircle className="flex-shrink-0 w-4 h-4" />{error}
                </div>
              )}
              <p className="p-3 rounded-xl w-full text-surface-600 text-xs italic glass">"{greeting}"</p>
              <button onClick={start} className="w-full btn-primary"><Phone className="w-4 h-4" />Start Call</button>
            </div>
          )}

          {phase === 'connecting' && (
            <div className="flex flex-col items-center gap-3 p-10">
              <Loader2 className="w-7 h-7 text-brand-400 animate-spin" />
              <p className="text-surface-600 text-sm">Setting up LiveKit room…</p>
            </div>
          )}

          {phase === 'active' && token && roomName && (
            <div className="flex flex-col" style={{ height: 440 }}>
              <TranscriptView entries={transcript} agentName={agentName} />
              <div className="border-surface-300/15 border-t">
                <LiveKitRoom token={token} serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
                  audio={true} video={false} connect={true} onDisconnected={end}>
                  <ActiveRoom agentName={agentName} onEnd={end} onTranscript={addTranscript} />
                </LiveKitRoom>
              </div>
            </div>
          )}

          {phase === 'ending' && (
            <div className="flex flex-col items-center gap-3 p-8">
              <Loader2 className="w-5 h-5 text-surface-600 animate-spin" />
              <p className="text-surface-600 text-xs">Saving transcript & running AI analysis…</p>
            </div>
          )}

          {phase === 'ended' && (
            <div className="flex flex-col items-center gap-4 p-6">
              <div className="flex justify-center items-center bg-brand-500/12 rounded-full w-12 h-12">
                <CheckCircle2 className="w-5 h-5 text-brand-400" />
              </div>
              <div className="text-center">
                <p className="font-medium text-surface-950">Call Complete</p>
                {startTime && <p className="flex justify-center items-center gap-1 mt-1 text-surface-600 text-xs"><Clock className="w-3 h-3" />{formatTimer(startTime)}</p>}
                <p className="mt-1 text-surface-500 text-xs">Transcript saved · AI analysis running</p>
              </div>
              {transcript.length > 0 && (
                <div className="space-y-1.5 w-full max-h-36 overflow-y-auto">
                  {transcript.map(e => (
                    <div key={e.id} className={cn('p-2 rounded-lg text-xs',
                      e.role === 'agent' ? 'bg-brand-500/8 text-brand-300' : 'bg-surface-200/30 text-surface-700')}>
                      <span className="font-medium">{e.role === 'agent' ? agentName : 'You'}:</span> {e.content}
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2 w-full">
                <button onClick={() => { setPhase('idle'); setTranscript([]) }} className="flex-1 text-sm btn-secondary">Again</button>
                <button onClick={onClose} className="flex-1 text-sm btn-primary">Done</button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}