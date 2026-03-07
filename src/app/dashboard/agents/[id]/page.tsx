'use client'
// FILE: src/app/dashboard/agents/[id]/page.tsx
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Phone, Loader2, Trash2, Plus, BookOpen, Mic, Clock, Zap, Bot } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { nanoid } from 'nanoid'
import CallModal from '@/components/call/CallModal'

const TABS = ['General', 'Prompt', 'Voice', 'Knowledge', 'Schedule', 'Integrations']
const VOICES = [
  { id: 'Celeste-PlayAI', label: 'Celeste', sub: 'Female · American' },
  { id: 'Atlas-PlayAI',   label: 'Atlas',   sub: 'Male · American'   },
  { id: 'Ada-PlayAI',     label: 'Ada',     sub: 'Female · British'  },
  { id: 'Orion-PlayAI',   label: 'Orion',   sub: 'Male · British'    },
]

export default function AgentConfigPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const isNew = id === 'new'

  const [tab, setTab] = useState('General')
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [testing, setTesting] = useState(false)
  const [form, setForm] = useState({
    name: '', businessName: '', greeting: '', systemPrompt: '',
    language: 'en-US', timezone: 'America/New_York',
    escalationEmail: '', escalationPhone: '', webhookUrl: '',
    status: 'draft',
    voiceConfig: { provider: 'groq-playai', voiceId: 'Celeste-PlayAI', speed: 1.0, pitch: 1.0, stability: 0.75 },
    workingHours: {
      enabled: true, timezone: 'America/New_York',
      schedule: {
        monday:    { open: '09:00', close: '17:00', enabled: true  },
        tuesday:   { open: '09:00', close: '17:00', enabled: true  },
        wednesday: { open: '09:00', close: '17:00', enabled: true  },
        thursday:  { open: '09:00', close: '17:00', enabled: true  },
        friday:    { open: '09:00', close: '17:00', enabled: true  },
        saturday:  { open: '10:00', close: '14:00', enabled: false },
        sunday:    { open: '10:00', close: '14:00', enabled: false },
      }
    },
    knowledgeBase: [] as { id: string; question: string; answer: string; category: string }[],
  })

  // Load existing agent
  useEffect(() => {
    if (isNew) return
    fetch(`/api/agents/${id}`).then(r => r.json()).then(({ data }) => {
      if (data) {
        setForm({
          name: data.name, businessName: data.businessName,
          greeting: data.greeting, systemPrompt: data.systemPrompt,
          language: data.language, timezone: data.timezone,
          escalationEmail: data.escalationEmail, escalationPhone: data.escalationPhone ?? '',
          webhookUrl: data.webhookUrl ?? '', status: data.status,
          voiceConfig: data.voiceConfig as any,
          workingHours: data.workingHours as any,
          knowledgeBase: (data.knowledgeBase ?? []).map((e: any) => ({ id: e.id, question: e.question, answer: e.answer, category: e.category })),
        })
      }
    }).finally(() => setLoading(false))
  }, [id, isNew])

  const set = (field: string, val: any) => setForm(f => ({ ...f, [field]: val }))
  const setVoice = (field: string, val: any) => setForm(f => ({ ...f, voiceConfig: { ...f.voiceConfig, [field]: val } }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = isNew
        ? await fetch('/api/agents', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
        : await fetch(`/api/agents/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const { data } = await res.json()
      if (isNew && data?.id) router.push(`/dashboard/agents/${data.id}`)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this agent? This cannot be undone.')) return
    setDeleting(true)
    await fetch(`/api/agents/${id}`, { method: 'DELETE' })
    router.push('/dashboard/agents')
  }

  const addKB = () => setForm(f => ({ ...f, knowledgeBase: [...f.knowledgeBase, { id: nanoid(), question: '', answer: '', category: 'General' }] }))
  const removeKB = (kid: string) => setForm(f => ({ ...f, knowledgeBase: f.knowledgeBase.filter(e => e.id !== kid) }))
  const updateKB = (kid: string, field: string, val: string) =>
    setForm(f => ({ ...f, knowledgeBase: f.knowledgeBase.map(e => e.id === kid ? { ...e, [field]: val } : e) }))
  const setSchedule = (day: string, field: string, val: any) =>
    setForm(f => ({ ...f, workingHours: { ...f.workingHours, schedule: { ...f.workingHours.schedule, [day]: { ...(f.workingHours.schedule as any)[day], [field]: val } } } }))

  if (loading) return <div className="flex justify-center items-center h-full"><Loader2 className="w-5 h-5 text-surface-600 animate-spin" /></div>

  return (
    <div className="space-y-6 mx-auto p-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/agents" className="p-2 rounded-xl btn-ghost"><ArrowLeft className="w-4 h-4" /></Link>
        <div className="flex-1">
          <h1 className="font-display text-surface-950 text-2xl">{isNew ? 'New Agent' : form.name}</h1>
          {!isNew && <p className="mt-0.5 font-mono text-surface-600 text-xs">{id}</p>}
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <>
              <button onClick={() => setTesting(true)} className="text-sm btn-secondary"><Phone className="w-3.5 h-3.5" />Test</button>
              <button onClick={handleDelete} disabled={deleting} className="text-sm btn-danger">
                {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              </button>
            </>
          )}
          <button onClick={handleSave} disabled={saving} className={cn('text-sm btn-primary', saved && 'bg-brand-600')}>
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {saved ? 'Saved!' : 'Save'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl overflow-x-auto glass">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn('flex-1 px-3 py-2 rounded-lg min-w-fit font-medium text-xs whitespace-nowrap transition-all',
              tab === t ? 'bg-surface-200/60 text-surface-950' : 'text-surface-600 hover:text-surface-950')}>
            {t}
          </button>
        ))}
      </div>

      <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
        {/* GENERAL */}
        {tab === 'General' && (
          <div className="space-y-4 card">
            <h2 className="flex items-center gap-2 font-medium text-surface-950"><Bot className="w-4 h-4 text-brand-400" />Basic Info</h2>
            <div className="gap-3 grid sm:grid-cols-2">
              <div><label className="label">Agent Name</label><input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Emma – Front Desk" /></div>
              <div><label className="label">Business Name</label><input className="input" value={form.businessName} onChange={e => set('businessName', e.target.value)} placeholder="Acme Corp" /></div>
            </div>
            <div><label className="label">Greeting</label>
              <textarea className="resize-none input" rows={3} value={form.greeting} onChange={e => set('greeting', e.target.value)} placeholder="Hi! You've reached Acme Corp..." />
              <p className="mt-1 text-surface-500 text-xs">First thing callers hear when they connect.</p>
            </div>
            <div className="gap-3 grid sm:grid-cols-2">
              <div><label className="label">Escalation Email</label><input className="input" type="email" value={form.escalationEmail} onChange={e => set('escalationEmail', e.target.value)} /></div>
              <div><label className="label">Escalation Phone</label><input className="input" type="tel" value={form.escalationPhone} onChange={e => set('escalationPhone', e.target.value)} /></div>
            </div>
            <div>
              <label className="label">Status</label>
              <div className="flex gap-2">
                {(['active', 'inactive', 'draft'] as const).map(s => (
                  <button key={s} onClick={() => set('status', s)}
                    className={cn('px-4 py-2 border rounded-xl text-sm capitalize transition-all',
                      form.status === s ? 'bg-brand-500/12 border-brand-500/25 text-brand-400' : 'glass border-surface-400/20 text-surface-600 hover:text-surface-950')}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PROMPT */}
        {tab === 'Prompt' && (
          <div className="space-y-3 card">
            <h2 className="flex items-center gap-2 font-medium text-surface-950"><Zap className="w-4 h-4 text-brand-400" />System Prompt</h2>
            <p className="text-surface-600 text-xs">Defines personality, goals, and behavior. Be specific.</p>
            <textarea className="font-mono text-xs leading-relaxed resize-none input" rows={20} value={form.systemPrompt} onChange={e => set('systemPrompt', e.target.value)} placeholder={`You are Emma, the AI receptionist for Acme Corp.\n\nYour goals:\n1. Greet callers warmly\n2. Answer questions from the knowledge base\n3. Schedule appointments when requested\n4. Escalate complex issues to a human\n\nPersonality: professional, warm, concise`} />
            <p className="flex justify-between text-surface-500 text-xs"><span>Groq llama-3.3-70b-versatile</span><span>{form.systemPrompt.length} chars</span></p>
          </div>
        )}

        {/* VOICE */}
        {tab === 'Voice' && (
          <div className="space-y-5 card">
            <h2 className="flex items-center gap-2 font-medium text-surface-950"><Mic className="w-4 h-4 text-brand-400" />Voice Config</h2>
            <div>
              <label className="label">Voice</label>
              <div className="gap-2 grid grid-cols-2">
                {VOICES.map(v => (
                  <button key={v.id} onClick={() => setVoice('voiceId', v.id)}
                    className={cn('p-3 border rounded-xl text-left transition-all',
                      form.voiceConfig.voiceId === v.id ? 'bg-brand-500/10 border-brand-500/25 text-brand-400' : 'glass border-surface-400/20 text-surface-700 hover:text-surface-950')}>
                    <p className="font-medium text-sm">{v.label}</p>
                    <p className="opacity-60 mt-0.5 text-[10px]">{v.sub}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="gap-4 grid sm:grid-cols-2">
              <div>
                <label className="label">Speed: {form.voiceConfig.speed.toFixed(1)}×</label>
                <input type="range" min="0.5" max="2.0" step="0.1" value={form.voiceConfig.speed} onChange={e => setVoice('speed', parseFloat(e.target.value))} className="w-full accent-brand-500" />
              </div>
              <div>
                <label className="label">Stability: {Math.round(form.voiceConfig.stability * 100)}%</label>
                <input type="range" min="0" max="1" step="0.05" value={form.voiceConfig.stability} onChange={e => setVoice('stability', parseFloat(e.target.value))} className="w-full accent-brand-500" />
              </div>
            </div>
            <div className="bg-brand-500/5 p-3 border border-brand-500/15 rounded-xl text-surface-600 text-xs">
              STT: Groq Whisper large-v3-turbo · LLM: Groq llama-3.3-70b · TTS: Groq PlayAI
            </div>
          </div>
        )}

        {/* KNOWLEDGE */}
        {tab === 'Knowledge' && (
          <div className="space-y-4 card">
            <div className="flex justify-between items-center">
              <h2 className="flex items-center gap-2 font-medium text-surface-950"><BookOpen className="w-4 h-4 text-brand-400" />Knowledge Base</h2>
              <button onClick={addKB} className="px-3 py-1.5 text-xs btn-primary"><Plus className="w-3.5 h-3.5" />Add Entry</button>
            </div>
            <p className="text-surface-600 text-xs">Q&A pairs your agent uses to answer callers accurately.</p>
            <div className="space-y-3">
              {form.knowledgeBase.map(e => (
                <div key={e.id} className="space-y-2 bg-surface-200/20 p-4 border border-surface-300/20 rounded-xl">
                  <div className="flex items-center gap-2">
                    <select value={e.category} onChange={ev => updateKB(e.id, 'category', ev.target.value)} className="px-2 py-1 rounded-lg text-surface-800 text-xs glass">
                      {['General','Scheduling','Support','Sales','Pricing','Other'].map(c => <option key={c}>{c}</option>)}
                    </select>
                    <button onClick={() => removeKB(e.id)} className="ml-auto p-1 rounded text-surface-500 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                  <input className="text-sm input" placeholder="Question" value={e.question} onChange={ev => updateKB(e.id, 'question', ev.target.value)} />
                  <textarea className="text-sm resize-none input" rows={2} placeholder="Answer" value={e.answer} onChange={ev => updateKB(e.id, 'answer', ev.target.value)} />
                </div>
              ))}
              {form.knowledgeBase.length === 0 && (
                <div className="py-10 text-surface-500 text-center">
                  <BookOpen className="opacity-20 mx-auto mb-2 w-7 h-7" />
                  <p className="text-sm">No entries yet — add your first Q&A</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SCHEDULE */}
        {tab === 'Schedule' && (
          <div className="space-y-4 card">
            <h2 className="flex items-center gap-2 font-medium text-surface-950"><Clock className="w-4 h-4 text-brand-400" />Working Hours</h2>
            <label className="flex items-center gap-3 p-3 rounded-xl cursor-pointer glass">
              <input type="checkbox" checked={form.workingHours.enabled} onChange={e => setForm(f => ({ ...f, workingHours: { ...f.workingHours, enabled: e.target.checked } }))} className="w-4 h-4 accent-brand-500" />
              <span className="text-surface-950 text-sm">Enforce working hours</span>
            </label>
            <div className="space-y-2">
              {Object.entries(form.workingHours.schedule).map(([day, h]: [string, any]) => (
                <div key={day} className={cn('flex items-center gap-3 p-3 rounded-xl transition-opacity', !h.enabled && 'opacity-50')}>
                  <input type="checkbox" checked={h.enabled} onChange={e => setSchedule(day, 'enabled', e.target.checked)} className="flex-shrink-0 w-4 h-4 accent-brand-500" />
                  <span className="w-24 text-surface-950 text-sm capitalize">{day}</span>
                  <input type="time" value={h.open}  disabled={!h.enabled} onChange={e => setSchedule(day, 'open', e.target.value)}  className="px-3 py-1.5 rounded-lg text-surface-950 text-sm disabled:cursor-not-allowed glass" />
                  <span className="text-surface-500 text-sm">–</span>
                  <input type="time" value={h.close} disabled={!h.enabled} onChange={e => setSchedule(day, 'close', e.target.value)} className="px-3 py-1.5 rounded-lg text-surface-950 text-sm disabled:cursor-not-allowed glass" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* INTEGRATIONS */}
        {tab === 'Integrations' && (
          <div className="space-y-4 card">
            <h2 className="flex items-center gap-2 font-medium text-surface-950"><Zap className="w-4 h-4 text-brand-400" />Webhook</h2>
            <div>
              <label className="label">Webhook URL</label>
              <input className="input" placeholder="https://your-app.com/webhook" value={form.webhookUrl} onChange={e => set('webhookUrl', e.target.value)} />
              <p className="mt-1 text-surface-500 text-xs">VocalHQ will POST call events here in real-time: call.started, call.completed (with full transcript + AI analysis).</p>
            </div>
            <div className="p-3 rounded-xl font-mono text-surface-600 text-xs glass">
              POST {form.webhookUrl || 'https://your-url.com/webhook'}<br />
              X-VocalHQ-Event: call.completed<br />
              {'{'} callId, agentId, transcript[], summary, sentiment, resolved {'}'}
            </div>
          </div>
        )}
      </motion.div>

      {testing && (
        <CallModal agentId={id} agentName={form.name} greeting={form.greeting} onClose={() => setTesting(false)} />
      )}
    </div>
  )
}