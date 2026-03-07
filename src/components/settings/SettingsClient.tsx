'use client'
// FILE: src/components/settings/SettingsClient.tsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Globe, Key, Bell, CreditCard, Shield, Copy, Check, Loader2, Save } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

const TABS = ['Workspace','API Keys','Notifications','Billing','Security']

export default function SettingsClient({ workspace }: { workspace: any }) {
  const [tab, setTab] = useState('Workspace')
  const [copied, setCopied] = useState<string|null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: workspace?.name ?? '',
    slug: workspace?.slug ?? '',
    phone: workspace?.phone ?? '',
  })
  const router = useRouter()

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id); setTimeout(() => setCopied(null), 2000)
  }

  const saveWorkspace = async () => {
    setSaving(true)
    await fetch('/api/workspace', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    router.refresh()
    setSaving(false)
  }

  const EnvRow = ({ label, envKey, id }: { label: string; envKey: string; id: string }) => (
    <div className="flex items-center gap-3 p-3 rounded-xl glass">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-surface-950 text-xs">{label}</p>
        <p className="mt-0.5 font-mono text-surface-500 text-xs truncate">{envKey}=your_value_here</p>
      </div>
      <button onClick={() => copy(`${envKey}=`, id)} className={cn('p-1.5 rounded-lg btn-ghost', copied === id && 'text-brand-400')}>
        {copied === id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  )

  return (
    <div className="space-y-6 mx-auto p-6 max-w-2xl">
      <div>
        <h1 className="font-display text-surface-950 text-3xl">Settings</h1>
        <p className="mt-1 text-surface-600 text-sm">Workspace configuration</p>
      </div>

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
        {tab === 'Workspace' && (
          <div className="space-y-4 card">
            <h2 className="flex items-center gap-2 font-medium text-surface-950"><Globe className="w-4 h-4 text-brand-400" />Workspace</h2>
            <div className="gap-3 grid sm:grid-cols-2">
              <div><label className="label">Name</label><input className="input" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} /></div>
              <div><label className="label">Slug</label><input className="input" value={form.slug} onChange={e => setForm(f => ({...f, slug: e.target.value}))} /></div>
            </div>
            <div><label className="label">Business Phone</label><input className="input" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} placeholder="+1 (555) 000-0000" /></div>
            {workspace && (
              <div className="p-3 rounded-xl text-surface-600 text-xs glass">
                <p>Workspace ID: <code className="font-mono text-surface-800">{workspace.id}</code></p>
                <p className="mt-1">Plan: <span className="font-medium text-surface-950 capitalize">{workspace.plan}</span></p>
              </div>
            )}
            <button onClick={saveWorkspace} disabled={saving} className="text-sm btn-primary">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Changes
            </button>
          </div>
        )}

        {tab === 'API Keys' && (
          <div className="space-y-4 card">
            <h2 className="flex items-center gap-2 font-medium text-surface-950"><Key className="w-4 h-4 text-brand-400" />API Keys</h2>
            <p className="text-surface-600 text-xs">Set these in your <code className="bg-surface-200/40 px-1 py-0.5 rounded font-mono">.env.local</code> file.</p>
            <div className="space-y-2">
              <EnvRow label="Neon Database URL"     envKey="DATABASE_URL"              id="db"      />
              <EnvRow label="LiveKit API Key"       envKey="LIVEKIT_API_KEY"           id="lk-key"  />
              <EnvRow label="LiveKit API Secret"    envKey="LIVEKIT_API_SECRET"        id="lk-sec"  />
              <EnvRow label="LiveKit WebSocket URL" envKey="NEXT_PUBLIC_LIVEKIT_URL"   id="lk-url"  />
              <EnvRow label="Groq API Key"          envKey="GROQ_API_KEY"              id="groq"    />
              <EnvRow label="Workspace ID"          envKey="WORKSPACE_ID"              id="wsid"    />
            </div>
            <div className="bg-brand-500/5 p-3 border border-brand-500/12 rounded-xl text-surface-600 text-xs">
              All free tiers: Neon (0.5GB free) · LiveKit Cloud (10k min/mo) · Groq (generous free)
            </div>
          </div>
        )}

        {tab === 'Notifications' && (
          <div className="space-y-3 card">
            <h2 className="flex items-center gap-2 font-medium text-surface-950"><Bell className="w-4 h-4 text-brand-400" />Notifications</h2>
            {[
              { l: 'Missed Call Alerts', d: 'Email when a call is missed', def: true },
              { l: 'Escalation Alerts',  d: 'When agent can\'t resolve',    def: true },
              { l: 'Daily Summary',      d: 'Digest at 8am every day',     def: true },
              { l: 'Low CSAT Alert',     d: 'When score drops below 3.5',   def: false },
            ].map(item => (
              <div key={item.l} className="flex justify-between items-center p-3 rounded-xl glass">
                <div><p className="font-medium text-surface-950 text-sm">{item.l}</p><p className="text-surface-600 text-xs">{item.d}</p></div>
                <label className="inline-flex relative cursor-pointer">
                  <input type="checkbox" defaultChecked={item.def} className="sr-only peer" />
                  <div className="peer after:top-0.5 after:left-0.5 after:absolute bg-surface-400/30 after:bg-white peer-checked:bg-brand-500 rounded-full after:rounded-full w-9 after:w-4 h-5 after:h-4 after:content-[''] transition-colors after:transition-all peer-checked:after:translate-x-4" />
                </label>
              </div>
            ))}
          </div>
        )}

        {tab === 'Billing' && (
          <div className="space-y-4 card">
            <h2 className="flex items-center gap-2 font-medium text-surface-950"><CreditCard className="w-4 h-4 text-brand-400" />Billing</h2>
            <div className="gap-3 grid">
              {[
                { l: 'Starter',    p: '$49/mo',   c: '500 calls/mo',      cur: workspace?.plan === 'starter' },
                { l: 'Growth',     p: '$149/mo',  c: '2,000 calls/mo',    cur: workspace?.plan === 'growth'  },
                { l: 'Enterprise', p: 'Custom',   c: 'Unlimited calls',   cur: workspace?.plan === 'enterprise' },
              ].map(plan => (
                <div key={plan.l} className={cn('flex items-center gap-4 p-4 border rounded-xl',
                  plan.cur ? 'bg-brand-500/8 border-brand-500/20' : 'glass border-surface-400/20')}>
                  <div className="flex-1">
                    <p className="font-medium text-surface-950">{plan.l}</p>
                    <p className="text-surface-600 text-xs">{plan.c}</p>
                  </div>
                  <p className="font-display text-brand-400 text-lg">{plan.p}</p>
                  {plan.cur ? <span className="bg-brand-500/10 border-brand-500/15 text-brand-400 badge">Current</span>
                    : <button className="py-1.5 text-xs btn-secondary">{plan.l === 'Enterprise' ? 'Contact' : 'Upgrade'}</button>}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'Security' && (
          <div className="space-y-4 card">
            <h2 className="flex items-center gap-2 font-medium text-surface-950"><Shield className="w-4 h-4 text-brand-400" />Security</h2>
            {[
              { l: 'Two-Factor Authentication', d: 'Extra security layer',          def: false },
              { l: 'Call Recording Encryption', d: 'Encrypt recordings at rest',   def: true  },
              { l: 'Webhook Signature Verify',  d: 'Sign webhook payloads (HMAC)', def: true  },
            ].map(item => (
              <div key={item.l} className="flex justify-between items-center p-3 rounded-xl glass">
                <div><p className="font-medium text-surface-950 text-sm">{item.l}</p><p className="text-surface-600 text-xs">{item.d}</p></div>
                <label className="inline-flex relative cursor-pointer">
                  <input type="checkbox" defaultChecked={item.def} className="sr-only peer" />
                  <div className="peer after:top-0.5 after:left-0.5 after:absolute bg-surface-400/30 after:bg-white peer-checked:bg-brand-500 rounded-full after:rounded-full w-9 after:w-4 h-5 after:h-4 after:content-[''] transition-colors after:transition-all peer-checked:after:translate-x-4" />
                </label>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}