'use client'

import { useState } from 'react'

export interface GiftCertificateEntry {
  _id: string
  code: string
  amount: number
  remainingBalance?: number
  recipientName?: string
  recipientEmail?: string
  senderName?: string
  status: string
  purchasedAt?: string
  expiresAt?: string
  redeemedAt?: string
  redeemedBy?: string
  isAdminGenerated?: boolean
  generatedBy?: string
  generatedByName?: string
  percentOff?: number
  referredName?: string
}

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  active:   { bg: 'rgba(22,163,74,0.1)',   color: '#16a34a', label: 'Active' },
  redeemed: { bg: 'rgba(55,138,221,0.12)', color: '#378ADD', label: 'Redeemed' },
  expired:  { bg: 'rgba(107,114,128,0.1)', color: '#6b7280', label: 'Expired' },
  admin:    { bg: 'rgba(230,126,34,0.1)',  color: '#E67E22', label: 'Door Prize' },
}

function formatDate(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function AdminGiftCertificates({ initialEntries }: { initialEntries: GiftCertificateEntry[] }) {
  const [entries] = useState<GiftCertificateEntry[]>(initialEntries)
  const [showForm, setShowForm] = useState(false)
  const [doorPrizeAmount, setDoorPrizeAmount] = useState('')
  const [doorPrizeName, setDoorPrizeName] = useState('')
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)
  const [showBreakdown, setShowBreakdown] = useState(false)
  const [showReferralForm, setShowReferralForm] = useState(false)
  const [refName, setRefName] = useState('')
  const [refEmail, setRefEmail] = useState('')
  const [refFriend, setRefFriend] = useState('')
  const [refResult, setRefResult] = useState<{ code: string; emailed: boolean; email?: string } | null>(null)

  // Door prize stats
  const doorPrizes = entries.filter(e => e.isAdminGenerated)
  const breakdownMap = new Map<string, { name: string; count: number }>()
  for (const e of doorPrizes) {
    const key = e.generatedBy ?? 'unknown'
    const existing = breakdownMap.get(key)
    if (existing) {
      existing.count++
    } else {
      breakdownMap.set(key, { name: e.generatedByName ?? e.generatedBy ?? 'Unknown', count: 1 })
    }
  }
  const breakdown = Array.from(breakdownMap.values()).sort((a, b) => b.count - a.count)

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    const amt = Number(doorPrizeAmount)
    if (!amt || amt < 1) { setGenError('Enter a valid amount.'); return }
    setGenerating(true)
    setGenError(null)
    try {
      const res = await fetch('/api/admin/gift-certificates/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amt, recipientName: doorPrizeName.trim() || undefined }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Generation failed.')
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `WDA-Gift-Certificate-DoorPrize-$${amt}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      setShowForm(false)
      setDoorPrizeAmount('')
      setDoorPrizeName('')
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setGenerating(false)
    }
  }

  async function handleReferral(e: React.FormEvent) {
    e.preventDefault()
    if (!refName.trim()) { setGenError('Enter the referrer’s name.'); return }
    setGenerating(true)
    setGenError(null)
    setRefResult(null)
    try {
      const res = await fetch('/api/admin/gift-certificates/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referral: true,
          recipientName: refName.trim(),
          recipientEmail: refEmail.trim() || undefined,
          referredName: refFriend.trim() || undefined,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? 'Generation failed.')
      setRefResult({ code: data.code, emailed: data.emailed, email: refEmail.trim() || undefined })
      setRefName('')
      setRefEmail('')
      setRefFriend('')
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="rounded-2xl bg-white overflow-hidden mb-8" style={{ border: '1.5px solid rgba(30,53,96,0.09)' }}>
      {/* Header */}
      <div className="px-6 py-4 border-b flex items-center justify-between gap-4" style={{ borderColor: 'rgba(30,53,96,0.08)' }}>
        <div>
          <h2 className="text-sm font-bold" style={{ color: '#1E3560', fontFamily: 'var(--font-montserrat), sans-serif' }}>
            Gift Certificates
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(43,48,58,0.5)' }}>
            {entries.length} certificate{entries.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          <button
            onClick={() => { setShowReferralForm(v => !v); setShowForm(false); setGenError(null); setRefResult(null) }}
            className="rounded-lg px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#378ADD' }}
          >
            Generate Referral Code
          </button>
          <button
            onClick={() => { setShowForm(v => !v); setShowReferralForm(false); setGenError(null) }}
            className="rounded-lg px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#E67E22' }}
          >
            Generate Gift Certificate
          </button>
        </div>
      </div>

      {/* Referral code form */}
      {showReferralForm && (
        <form onSubmit={handleReferral} className="px-6 py-5 border-b" style={{ borderColor: 'rgba(30,53,96,0.08)', backgroundColor: 'rgba(55,138,221,0.05)' }}>
          <p className="text-xs font-bold mb-1" style={{ color: '#1E3560' }}>Generate Referral Code (25% off)</p>
          <p className="text-xs mb-4" style={{ color: 'rgba(43,48,58,0.55)' }}>
            Single use, valid 6 months, for any event, guest speaker or online course except the National Board workshop.
            Add the referrer&apos;s email to send it to them automatically.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {([
              ['Referrer Name', refName, setRefName, 'e.g. Jane Smith', true],
              ['Referrer Email', refEmail, setRefEmail, 'Optional, emails the code', false],
              ['Friend Who Registered', refFriend, setRefFriend, 'Optional', false],
            ] as const).map(([label, value, set, ph, req]) => (
              <div key={label}>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#1E3560' }}>
                  {label} {req && <span style={{ color: '#378ADD' }}>*</span>}
                </label>
                <input
                  type={label === 'Referrer Email' ? 'email' : 'text'} value={value} onChange={e => set(e.target.value)}
                  placeholder={ph}
                  className="w-full rounded-lg px-3 py-2.5 text-sm border focus:outline-none"
                  style={{ borderColor: 'rgba(30,53,96,0.2)', backgroundColor: '#ffffff', color: '#2B303A' }}
                />
              </div>
            ))}
          </div>
          {genError && <p className="mb-3 text-xs" style={{ color: '#dc2626' }}>{genError}</p>}
          {refResult && (
            <div className="mb-3 rounded-lg px-3 py-2.5 text-xs" style={{ backgroundColor: 'rgba(22,163,74,0.07)', border: '1px solid rgba(22,163,74,0.25)', color: '#15803d' }}>
              Code <code className="font-bold" style={{ color: '#1E3560' }}>{refResult.code}</code> created.{' '}
              {refResult.emailed ? `Emailed to ${refResult.email}.` : refResult.email ? 'The email failed, so send the code yourself.' : 'Send it to the referrer yourself.'}
              {' '}Refresh to see it in the list, and tick Referral Reward Sent on the friend&apos;s registration.
            </div>
          )}
          <div className="flex gap-3">
            <button
              type="submit" disabled={generating}
              className="rounded-lg px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
              style={{ backgroundColor: '#378ADD' }}
            >
              {generating ? 'Generating…' : 'Generate Code'}
            </button>
            <button type="button" onClick={() => setShowReferralForm(false)}
              className="rounded-lg px-4 py-2.5 text-sm font-semibold border"
              style={{ borderColor: 'rgba(30,53,96,0.2)', color: 'rgba(30,53,96,0.55)' }}>
              Close
            </button>
          </div>
        </form>
      )}

      {/* Door prize summary */}
      {doorPrizes.length > 0 && (
        <div className="px-6 py-3 border-b" style={{ borderColor: 'rgba(30,53,96,0.08)', backgroundColor: '#F4F7F9' }}>
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs" style={{ color: 'rgba(43,48,58,0.6)' }}>
              <span className="font-bold" style={{ color: '#1E3560' }}>{doorPrizes.length}</span>
              {' '}door prize{doorPrizes.length !== 1 ? 's' : ''} generated
            </p>
            <button
              onClick={() => setShowBreakdown(v => !v)}
              className="text-[11px] font-semibold"
              style={{ color: '#378ADD' }}
            >
              {showBreakdown ? 'Hide Breakdown' : 'View Breakdown'}
            </button>
          </div>
          {showBreakdown && (
            <div className="mt-3 flex flex-wrap gap-3">
              {breakdown.map(row => (
                <div key={row.name} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs"
                  style={{ backgroundColor: 'rgba(30,53,96,0.07)' }}>
                  <span className="font-semibold" style={{ color: '#1E3560' }}>{row.name}</span>
                  <span className="font-bold rounded-full px-1.5 py-0.5 text-[10px]"
                    style={{ backgroundColor: '#E67E22', color: '#fff' }}>
                    {row.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Door Prize form */}
      {showForm && (
        <form onSubmit={handleGenerate} className="px-6 py-5 border-b" style={{ borderColor: 'rgba(30,53,96,0.08)', backgroundColor: 'rgba(230,126,34,0.04)' }}>
          <p className="text-xs font-bold mb-4" style={{ color: '#1E3560' }}>Generate Gift Certificate</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: '#1E3560' }}>
                Amount (CAD) <span style={{ color: '#378ADD' }}>*</span>
              </label>
              <input
                type="number" min={1} value={doorPrizeAmount} onChange={e => setDoorPrizeAmount(e.target.value)}
                placeholder="e.g. 129"
                className="w-full rounded-lg px-3 py-2.5 text-sm border focus:outline-none"
                style={{ borderColor: 'rgba(30,53,96,0.2)', backgroundColor: '#ffffff', color: '#2B303A' }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: '#1E3560' }}>
                Recipient Name <span className="font-normal" style={{ color: 'rgba(43,48,58,0.4)' }}>(optional)</span>
              </label>
              <input
                type="text" value={doorPrizeName} onChange={e => setDoorPrizeName(e.target.value)}
                placeholder="Leave blank for generic"
                className="w-full rounded-lg px-3 py-2.5 text-sm border focus:outline-none"
                style={{ borderColor: 'rgba(30,53,96,0.2)', backgroundColor: '#ffffff', color: '#2B303A' }}
              />
            </div>
          </div>
          {genError && <p className="mb-3 text-xs" style={{ color: '#dc2626' }}>{genError}</p>}
          <div className="flex gap-3">
            <button
              type="submit" disabled={generating}
              className="rounded-lg px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
              style={{ backgroundColor: '#E67E22' }}
            >
              {generating ? 'Generating…' : 'Generate & Download PDF'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="rounded-lg px-4 py-2.5 text-sm font-semibold border"
              style={{ borderColor: 'rgba(30,53,96,0.2)', color: 'rgba(30,53,96,0.55)' }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      {entries.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <p className="text-sm" style={{ color: 'rgba(43,48,58,0.45)' }}>No gift certificates yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(30,53,96,0.07)' }}>
                {['Code', 'Amount', 'Balance', 'Recipient', 'Status', 'Generated By', 'Purchased', 'Expires', 'Redeemed By'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: 'rgba(43,48,58,0.4)', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map(e => {
                const st = STATUS_STYLES[e.status] ?? STATUS_STYLES.active
                return (
                  <tr key={e._id} style={{ borderBottom: '1px solid rgba(30,53,96,0.05)' }}>
                    <td className="px-4 py-3">
                      <code className="text-xs font-bold" style={{ color: '#1E3560' }}>{e.code}</code>
                      {e.isAdminGenerated && (
                        <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(230,126,34,0.1)', color: '#E67E22' }}>PRIZE</span>
                      )}
                      {e.percentOff != null && (
                        <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(55,138,221,0.12)', color: '#378ADD' }}>REFERRAL</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-bold" style={{ color: '#E67E22' }}>{e.percentOff != null ? `${e.percentOff}% off` : `$${e.amount}`}</td>
                    <td className="px-4 py-3 text-xs" style={{ whiteSpace: 'nowrap' }}>
                      {(() => {
                        if (e.percentOff != null) {
                          return e.status === 'redeemed'
                            ? <span style={{ color: '#6b7280' }}>Used</span>
                            : <span style={{ color: '#16a34a' }}>Single use (unused)</span>
                        }
                        const bal = e.remainingBalance ?? e.amount
                        if (bal === 0) return <span style={{ color: '#6b7280' }}>Fully redeemed</span>
                        if (bal < e.amount) return <span className="font-bold" style={{ color: '#E67E22' }}>${bal} remaining</span>
                        return <span style={{ color: '#16a34a' }}>${bal} (unused)</span>
                      })()}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-xs" style={{ color: '#1E3560' }}>{e.recipientName ?? '—'}</p>
                      {e.recipientEmail && <p className="text-[11px]" style={{ color: 'rgba(43,48,58,0.5)' }}>{e.recipientEmail}</p>}
                      {e.referredName && <p className="text-[11px]" style={{ color: 'rgba(43,48,58,0.5)' }}>Referred {e.referredName}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: st.bg, color: st.color }}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'rgba(43,48,58,0.6)', whiteSpace: 'nowrap' }}>
                      {e.isAdminGenerated || e.percentOff != null
                        ? (e.generatedByName ?? e.generatedBy ?? '—')
                        : <span style={{ color: 'rgba(43,48,58,0.3)' }}>—</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'rgba(43,48,58,0.6)', whiteSpace: 'nowrap' }}>{formatDate(e.purchasedAt)}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'rgba(43,48,58,0.6)', whiteSpace: 'nowrap' }}>{formatDate(e.expiresAt)}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'rgba(43,48,58,0.6)' }}>
                      {e.redeemedBy ?? (e.status === 'redeemed' ? '—' : '')}
                      {e.redeemedAt && <span className="block" style={{ color: 'rgba(43,48,58,0.4)' }}>{formatDate(e.redeemedAt)}</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
