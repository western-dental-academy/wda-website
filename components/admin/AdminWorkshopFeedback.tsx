'use client'

import { useState } from 'react'

// ── Prop types (raw data shapes from Sanity) ───────────────────────────────────

export interface FeedbackEntry {
  _id: string
  firstName: string
  lastName: string
  workshop: string
  feedbackRating: number
  feedbackEnjoyedMost?: string
  feedbackImprovement?: string
  feedbackWouldRecommend?: boolean
  feedbackSubmittedAt: string
}

export interface QRFeedbackEntry {
  _id: string
  workshopDateId?: string
  workshopName: string
  rating: number
  enjoyedMost?: string
  improvement?: string
  wouldRecommend?: boolean
  submittedAt: string
}

// ── Normalised internal type ───────────────────────────────────────────────────

interface NormEntry {
  id: string
  source: 'email' | 'qr'
  workshopName: string
  rating: number
  enjoyedMost?: string
  improvement?: string
  wouldRecommend?: boolean
  submittedAt: string
  respondentName?: string
}

interface WorkshopGroup {
  workshopName: string
  entries: NormEntry[]
  avgRating: number
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function normalise(emailEntries: FeedbackEntry[], qrEntries: QRFeedbackEntry[]): NormEntry[] {
  const email: NormEntry[] = emailEntries.map(e => ({
    id: e._id,
    source: 'email',
    workshopName: e.workshop,
    rating: e.feedbackRating,
    enjoyedMost: e.feedbackEnjoyedMost,
    improvement: e.feedbackImprovement,
    wouldRecommend: e.feedbackWouldRecommend,
    submittedAt: e.feedbackSubmittedAt,
    respondentName: `${e.firstName} ${e.lastName}`.trim() || undefined,
  }))
  const qr: NormEntry[] = qrEntries.map(e => ({
    id: e._id,
    source: 'qr',
    workshopName: e.workshopName,
    rating: e.rating,
    enjoyedMost: e.enjoyedMost,
    improvement: e.improvement,
    wouldRecommend: e.wouldRecommend,
    submittedAt: e.submittedAt,
  }))
  return [...email, ...qr].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
}

function groupByWorkshop(entries: NormEntry[]): WorkshopGroup[] {
  const map = new Map<string, NormEntry[]>()
  for (const e of entries) {
    const group = map.get(e.workshopName) ?? []
    group.push(e)
    map.set(e.workshopName, group)
  }
  return Array.from(map.entries()).map(([workshopName, group]) => ({
    workshopName,
    entries: group,
    avgRating: Math.round((group.reduce((s, e) => s + e.rating, 0) / group.length) * 10) / 10,
  }))
}

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width={size} height={size} viewBox="0 0 24 24"
          fill={rating >= s ? '#E67E22' : 'none'}
          stroke={rating >= s ? '#E67E22' : '#d1d5db'}
          strokeWidth="1.5"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  )
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-CA', {
    timeZone: 'America/Edmonton',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function AdminWorkshopFeedback({ entries, qrEntries }: { entries: FeedbackEntry[]; qrEntries: QRFeedbackEntry[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const all    = normalise(entries, qrEntries)
  const groups = groupByWorkshop(all)
  const total  = all.length

  function toggle(workshopName: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(workshopName) ? next.delete(workshopName) : next.add(workshopName)
      return next
    })
  }

  return (
    <div className="rounded-2xl bg-white overflow-hidden mb-8" style={{ border: '1.5px solid rgba(30,53,96,0.09)' }}>
      <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(30,53,96,0.08)' }}>
        <h2 className="text-sm font-bold" style={{ color: '#1E3560' }}>PD Feedback</h2>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(55,138,221,0.1)', color: '#378ADD' }}>
          {total} {total === 1 ? 'response' : 'responses'}
        </span>
      </div>

      {total === 0 ? (
        <p className="px-6 py-8 text-sm text-center" style={{ color: 'rgba(43,48,58,0.4)' }}>
          No feedback received yet.
        </p>
      ) : (
        <div className="divide-y" style={{ borderColor: 'rgba(30,53,96,0.06)' }}>
          {groups.map(({ workshopName, entries: groupEntries, avgRating }) => {
            const isOpen = expanded.has(workshopName)
            const recommendCount = groupEntries.filter(e => e.wouldRecommend === true).length
            const recommendPct   = Math.round((recommendCount / groupEntries.length) * 100)

            return (
              <div key={workshopName}>
                {/* Group header */}
                <button
                  onClick={() => toggle(workshopName)}
                  className="w-full px-6 py-4 flex items-start sm:items-center justify-between gap-4 text-left"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: '#1E3560' }}>{workshopName}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5">
                      <Stars rating={Math.round(avgRating)} />
                      <span className="text-xs font-semibold" style={{ color: '#E67E22' }}>★ {avgRating.toFixed(1)} / 5</span>
                      <span className="text-xs" style={{ color: 'rgba(43,48,58,0.5)' }}>
                        {groupEntries.length} {groupEntries.length === 1 ? 'response' : 'responses'}
                      </span>
                      {groupEntries.some(e => e.wouldRecommend !== undefined) && (
                        <span className="text-xs" style={{ color: 'rgba(43,48,58,0.5)' }}>
                          {recommendPct}% would recommend
                        </span>
                      )}
                    </div>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(30,53,96,0.4)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    className="shrink-0 transition-transform duration-200"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {/* Individual entries */}
                {isOpen && (
                  <div className="px-6 pb-4 flex flex-col gap-4">
                    {groupEntries.map((entry) => (
                      <div key={entry.id} className="rounded-xl p-4" style={{ backgroundColor: '#F4F7F9', border: '1px solid rgba(30,53,96,0.07)' }}>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-semibold" style={{ color: '#1E3560' }}>
                                {entry.respondentName ?? 'Anonymous'}
                              </p>
                              {entry.source === 'email' ? (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(13,59,110,0.1)', color: '#0D3B6E' }}>
                                  Via Email
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(43,48,58,0.08)', color: 'rgba(43,48,58,0.55)' }}>
                                  Via QR
                                </span>
                              )}
                            </div>
                            <p className="text-xs mt-0.5" style={{ color: 'rgba(43,48,58,0.45)' }}>{fmtDate(entry.submittedAt)}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                            <Stars rating={entry.rating} size={13} />
                            {entry.wouldRecommend !== undefined && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                style={entry.wouldRecommend
                                  ? { backgroundColor: '#dcfce7', color: '#15803d' }
                                  : { backgroundColor: '#fee2e2', color: '#b91c1c' }
                                }
                              >
                                {entry.wouldRecommend ? 'Yes' : 'No'}
                              </span>
                            )}
                          </div>
                        </div>
                        {entry.enjoyedMost && (
                          <div className="mb-2">
                            <p className="text-[10px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: 'rgba(43,48,58,0.4)' }}>Enjoyed most</p>
                            <p className="text-xs" style={{ color: '#2B303A' }}>{entry.enjoyedMost}</p>
                          </div>
                        )}
                        {entry.improvement && (
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: 'rgba(43,48,58,0.4)' }}>Could improve</p>
                            <p className="text-xs" style={{ color: '#2B303A' }}>{entry.improvement}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
