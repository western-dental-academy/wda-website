'use client'

import { useState, useEffect, useCallback } from 'react'
import { Globe, GraduationCap, Database, CreditCard, Mail, Zap, RefreshCw, AlertTriangle } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────────

type Status = 'loading' | 'operational' | 'degraded' | 'down'

interface CheckState {
  key: string
  status: Status
  ms: number | null
  detail: string | null
  checkedAt: Date | null
}

// ── Config ─────────────────────────────────────────────────────────────────────

const SERVICES: { key: string; name: string; Icon: React.ElementType; endpoint: string }[] = [
  { key: 'site',   name: 'Vercel / Site',  Icon: Globe,           endpoint: '/api/it/site-status'   },
  { key: 'moodle', name: 'Moodle LMS',     Icon: GraduationCap,   endpoint: '/api/it/moodle-status' },
  { key: 'sanity', name: 'Sanity CMS',     Icon: Database,        endpoint: '/api/it/sanity-status' },
  { key: 'stripe', name: 'Stripe',         Icon: CreditCard,      endpoint: '/api/it/stripe-status' },
  { key: 'resend', name: 'Resend Email',   Icon: Mail,            endpoint: '/api/it/resend-status' },
  { key: 'redis',  name: 'Upstash Redis',  Icon: Zap,             endpoint: '/api/it/redis-status'  },
]

const INITIAL_STATE: CheckState[] = SERVICES.map(s => ({
  key: s.key, status: 'loading', ms: null, detail: null, checkedAt: null,
}))

// ── Helpers ────────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<Status, { border: string; badgeBg: string; badgeText: string; label: string; dot: string }> = {
  operational: { border: '#22c55e', badgeBg: 'rgba(34,197,94,0.1)',   badgeText: '#15803d', label: 'Operational', dot: '#22c55e' },
  degraded:    { border: '#E67E22', badgeBg: 'rgba(230,126,34,0.1)',  badgeText: '#c2681f', label: 'Degraded',    dot: '#E67E22' },
  down:        { border: '#dc2626', badgeBg: 'rgba(220,38,38,0.1)',   badgeText: '#dc2626', label: 'Down',        dot: '#dc2626' },
  loading:     { border: '#d1d5db', badgeBg: 'rgba(107,114,128,0.07)', badgeText: '#9ca3af', label: 'Checking…',  dot: '#d1d5db' },
}

function toStatus(ok: boolean, ms: number): Status {
  if (!ok) return 'down'
  if (ms > 2000) return 'degraded'
  return 'operational'
}

function fmtMs(ms: number): string {
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`
}

function fmtTime(d: Date): string {
  return d.toLocaleTimeString('en-CA', { timeZone: 'America/Edmonton', hour: 'numeric', minute: '2-digit', second: '2-digit' })
}

// ── MaintenanceToggle ──────────────────────────────────────────────────────────

type TogglePhase = 'idle' | 'confirming' | 'toggling' | 'done'

function MaintenanceToggle() {
  const [maintenance, setMaintenance] = useState<boolean | null>(null)
  const [loading, setLoading]         = useState(true)
  const [phase, setPhase]             = useState<TogglePhase>('idle')
  const [error, setError]             = useState<string | null>(null)
  const [deployTriggered, setDeployTriggered] = useState(false)

  useEffect(() => {
    fetch('/api/it/maintenance')
      .then(r => r.json())
      .then(d => setMaintenance(d.maintenance ?? false))
      .catch(() => setError('Failed to load maintenance status'))
      .finally(() => setLoading(false))
  }, [])

  const toggle = async (enable: boolean) => {
    setPhase('toggling')
    setError(null)
    try {
      const res = await fetch('/api/it/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enable }),
      })
      const data = await res.json() as { ok?: boolean; maintenance?: boolean; deploymentTriggered?: boolean; error?: string }
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
      setMaintenance(data.maintenance ?? enable)
      setDeployTriggered(data.deploymentTriggered ?? false)
      setPhase('done')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Toggle failed')
      setPhase('idle')
    }
  }

  const isMaintenance = maintenance === true

  return (
    <div
      className="rounded-2xl bg-white overflow-hidden"
      style={{
        border: '1.5px solid rgba(30,53,96,0.09)',
        borderLeft: `4px solid ${isMaintenance ? '#E67E22' : '#22c55e'}`,
        transition: 'border-left-color 0.3s ease',
      }}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b flex items-center gap-3" style={{ borderColor: 'rgba(30,53,96,0.08)' }}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{
            backgroundColor: isMaintenance ? 'rgba(230,126,34,0.1)' : 'rgba(34,197,94,0.1)',
            color: isMaintenance ? '#E67E22' : '#22c55e',
          }}
        >
          {isMaintenance
            ? <AlertTriangle size={16} />
            : <Globe size={16} />
          }
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: '#1E3560' }}>Maintenance Mode</p>
          <p className="text-xs" style={{ color: 'rgba(43,48,58,0.45)' }}>
            Controls public site access
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-5">
        {loading ? (
          <div className="space-y-2.5">
            <div className="h-6 w-24 rounded-full animate-pulse" style={{ backgroundColor: 'rgba(30,53,96,0.06)' }} />
            <div className="h-9 w-48 rounded-xl animate-pulse" style={{ backgroundColor: 'rgba(30,53,96,0.04)' }} />
          </div>
        ) : phase === 'done' ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full"
                style={isMaintenance
                  ? { backgroundColor: 'rgba(230,126,34,0.1)', color: '#c2681f' }
                  : { backgroundColor: 'rgba(34,197,94,0.1)', color: '#15803d' }
                }
              >
                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: isMaintenance ? '#E67E22' : '#22c55e' }} />
                {isMaintenance ? 'Maintenance' : 'Live'}
              </span>
            </div>
            <div
              className="rounded-xl px-4 py-3 text-sm"
              style={{ backgroundColor: 'rgba(55,138,221,0.07)', color: '#1E3560' }}
            >
              {deployTriggered
                ? 'Redeployment triggered — changes take ~1 minute to apply.'
                : 'Env var updated. Trigger a manual redeploy in Vercel for changes to take effect.'
              }
            </div>
            <button
              onClick={() => setPhase('idle')}
              className="text-xs underline"
              style={{ color: '#378ADD' }}
            >
              Dismiss
            </button>
          </div>
        ) : phase === 'confirming' ? (
          <div className="space-y-4">
            <div
              className="rounded-xl px-4 py-3 text-sm"
              style={{ backgroundColor: 'rgba(230,126,34,0.08)', border: '1px solid rgba(230,126,34,0.2)' }}
            >
              <p className="font-semibold mb-1" style={{ color: '#c2681f' }}>Are you sure?</p>
              <p style={{ color: '#92400e' }}>This will take the site offline for visitors.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => toggle(true)}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95"
                style={{ backgroundColor: '#E67E22', color: '#fff' }}
              >
                Confirm — Take Offline
              </button>
              <button
                onClick={() => setPhase('idle')}
                className="py-2.5 px-4 rounded-xl text-sm font-medium"
                style={{ backgroundColor: '#F4F7F9', color: 'rgba(43,48,58,0.6)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full"
                style={isMaintenance
                  ? { backgroundColor: 'rgba(230,126,34,0.1)', color: '#c2681f' }
                  : { backgroundColor: 'rgba(34,197,94,0.1)', color: '#15803d' }
                }
              >
                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: isMaintenance ? '#E67E22' : '#22c55e' }} />
                {isMaintenance ? 'Maintenance' : 'Live'}
              </span>
            </div>

            {isMaintenance ? (
              <button
                onClick={() => toggle(false)}
                disabled={phase === 'toggling'}
                className="w-full py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95"
                style={{ backgroundColor: '#22c55e', color: '#fff', opacity: phase === 'toggling' ? 0.6 : 1 }}
              >
                {phase === 'toggling' ? 'Updating…' : 'Disable Maintenance Mode'}
              </button>
            ) : (
              <button
                onClick={() => setPhase('confirming')}
                disabled={phase === 'toggling'}
                className="w-full py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95"
                style={{ backgroundColor: '#1E3560', color: '#fff', opacity: phase === 'toggling' ? 0.6 : 1 }}
              >
                Enable Maintenance Mode
              </button>
            )}

            {error && <p className="text-xs" style={{ color: '#dc2626' }}>{error}</p>}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function AdminITPanel() {
  const [checks, setChecks] = useState<CheckState[]>(INITIAL_STATE)
  const [refreshing, setRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const runChecks = useCallback(() => {
    setRefreshing(true)
    setChecks(INITIAL_STATE)

    let completed = 0
    const total = SERVICES.length

    SERVICES.forEach(async (svc) => {
      const t0 = performance.now()
      try {
        const res = await fetch(svc.endpoint)
        const clientMs = Math.round(performance.now() - t0)
        const data = await res.json() as { ok?: boolean; ms?: number; detail?: string }
        const ok = data.ok ?? false
        const ms = data.ms ?? clientMs
        setChecks(prev => prev.map(c =>
          c.key === svc.key
            ? { ...c, status: toStatus(ok, ms), ms, detail: data.detail ?? null, checkedAt: new Date() }
            : c
        ))
      } catch {
        const ms = Math.round(performance.now() - t0)
        setChecks(prev => prev.map(c =>
          c.key === svc.key
            ? { ...c, status: 'down', ms, detail: 'Request failed', checkedAt: new Date() }
            : c
        ))
      } finally {
        completed++
        if (completed === total) {
          setRefreshing(false)
          setLastRefresh(new Date())
        }
      }
    })
  }, [])

  // Run on mount
  useEffect(() => { runChecks() }, [runChecks])

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const id = setInterval(() => runChecks(), 60_000)
    return () => clearInterval(id)
  }, [runChecks])

  const operational = checks.filter(c => c.status === 'operational').length
  const allLoading   = checks.every(c => c.status === 'loading')

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-bold" style={{ color: '#1E3560' }}>System Health</h2>
          {!allLoading && (
            <p className="text-xs mt-0.5" style={{ color: 'rgba(43,48,58,0.45)' }}>
              {operational}/{SERVICES.length} services operational
              {lastRefresh && (
                <span> · Last checked {fmtTime(lastRefresh)}</span>
              )}
            </p>
          )}
        </div>
        <button
          onClick={runChecks}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all active:scale-95"
          style={{
            backgroundColor: 'rgba(30,53,96,0.06)',
            color: refreshing ? 'rgba(30,53,96,0.35)' : '#1E3560',
            cursor: refreshing ? 'not-allowed' : 'pointer',
          }}
        >
          <RefreshCw
            size={14}
            className={refreshing ? 'animate-spin' : ''}
          />
          Refresh
        </button>
      </div>

      {/* Service grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 sm:mb-10">
        {SERVICES.map(svc => {
          const check = checks.find(c => c.key === svc.key)!
          const cfg = STATUS_CFG[check.status]
          const isLoading = check.status === 'loading'

          return (
            <div
              key={svc.key}
              className="rounded-2xl bg-white overflow-hidden"
              style={{
                border: '1.5px solid rgba(30,53,96,0.09)',
                borderLeft: `4px solid ${cfg.border}`,
                transition: 'border-left-color 0.3s ease',
              }}
            >
              {/* Card header */}
              <div className="px-5 py-4 border-b flex items-center gap-3" style={{ borderColor: 'rgba(30,53,96,0.08)' }}>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'rgba(30,53,96,0.06)', color: '#1E3560' }}
                >
                  <svc.Icon size={16} />
                </div>
                <span className="text-sm font-bold" style={{ color: '#1E3560' }}>{svc.name}</span>
              </div>

              {/* Card body */}
              <div className="px-5 py-4">
                {isLoading ? (
                  <div className="space-y-2.5">
                    <div className="h-6 w-28 rounded-full animate-pulse" style={{ backgroundColor: 'rgba(30,53,96,0.06)' }} />
                    <div className="h-4 w-16 rounded animate-pulse" style={{ backgroundColor: 'rgba(30,53,96,0.04)' }} />
                    <div className="h-3 w-36 rounded animate-pulse" style={{ backgroundColor: 'rgba(30,53,96,0.04)' }} />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Status badge */}
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: cfg.badgeBg, color: cfg.badgeText }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full inline-block"
                          style={{ backgroundColor: cfg.dot }}
                        />
                        {cfg.label}
                      </span>
                      {check.ms !== null && (
                        <span className="text-xs tabular-nums font-medium" style={{ color: 'rgba(43,48,58,0.5)' }}>
                          {fmtMs(check.ms)}
                        </span>
                      )}
                    </div>

                    {/* Detail */}
                    {check.detail && (
                      <p className="text-xs" style={{ color: 'rgba(43,48,58,0.55)' }}>{check.detail}</p>
                    )}

                    {/* Last checked */}
                    {check.checkedAt && (
                      <p className="text-xs" style={{ color: 'rgba(43,48,58,0.35)' }}>
                        Checked {fmtTime(check.checkedAt)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-bold mb-4" style={{ color: '#1E3560' }}>Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <MaintenanceToggle />
        </div>
      </div>
    </div>
  )
}
