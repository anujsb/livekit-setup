'use client'
// FILE: src/components/call/ActiveCallBar.tsx
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, PhoneOff, Mic, MicOff } from 'lucide-react'
import { useStore } from '@/lib/store'
import { formatTimer, cn } from '@/lib/utils'

export default function ActiveCallBar() {
  const { activeCall, setMuted, setActiveCall } = useStore()
  const [, setTick] = useState(0)

  useEffect(() => {
    if (!activeCall) return
    const t = setInterval(() => setTick(n => n + 1), 1000)
    return () => clearInterval(t)
  }, [activeCall])

  return (
    <AnimatePresence>
      {activeCall && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 35 }} className="flex-shrink-0 overflow-hidden">
          <div className="flex items-center gap-4 bg-brand-500/8 px-6 py-2.5 border-brand-500/15 border-b">
            <div className="relative flex-shrink-0">
              <div className="flex justify-center items-center bg-brand-500/15 rounded-full w-7 h-7">
                <Phone className="w-3.5 h-3.5 text-brand-400" />
              </div>
              <span className="absolute inset-0 rounded-full ring-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-surface-950 text-xs">Live Call</span>
                <span className="font-mono text-brand-400 text-xs">{formatTimer(activeCall.startTime)}</span>
                <span className="bg-brand-500/10 border-brand-500/15 text-[10px] text-brand-400 badge">{activeCall.agentName}</span>
              </div>
              <div className="flex items-end gap-0.5 mt-0.5 h-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className={cn('w-1 wave-bar', activeCall.isMuted && 'bg-surface-500 [animation-play-state:paused] opacity-30')} />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setMuted(!activeCall.isMuted)}
                className={cn('flex items-center gap-1 px-2.5 py-1.5 border rounded-lg text-xs transition-all',
                  activeCall.isMuted ? 'bg-amber-500/12 border-amber-500/20 text-amber-400' : 'glass border-surface-400/20 text-surface-700')}>
                {activeCall.isMuted ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                {activeCall.isMuted ? 'Unmute' : 'Mute'}
              </button>
              <button onClick={() => setActiveCall(null)}
                className="flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 px-2.5 py-1.5 border border-red-500/15 rounded-lg text-red-400 text-xs transition-all">
                <PhoneOff className="w-3 h-3" />End
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}