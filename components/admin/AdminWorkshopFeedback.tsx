'use client'

import { useState } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────────

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

interface WorkshopGroup {
  workshop: string
  entries: FeedbackEntry[]
  avgRating: number
}

// ── Helpers ────────────────────────────────────────────────────────────────────

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

function groupByWorkshop(entries: FeedbackEntry[]): WorkshopGroup[] {
  const map = new Map<string, FeedbackEntry[]>()
  for (const e of entries) {
    const group = map.get(e.workshop) ?? []
    group.push(e)
    map.set(e.workshop, group)
  }
  return Array.from(map.entries()).map(([workshop, group]) => ({
    workshop,
    entries: group,
    avgRating: Math.round((group.reduce((s, e) => s + (e.feedbackRating ?? 0), 0) / group.length) * 10) / 10,
  }))
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function AdminWorkshopFeedback({ entries }: { entries: FeedbackEntry[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  if (entries.length === 0) {
    return (
      <div className="rounded-2xl bg-white overflow-hidden mb-8" style={{ border: '1.5px solid rgba(30,53,96,0.09)' }}>
        <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(30,53,96,0.08)' }}>
          <h2 className="text-sm font-bold" style={{ color: '#1E3560' }}>PD Feedback</h2>
        </div>
        <p className="px-6 py-8 text-sm text-center" style={{ color: 'rgba(43,48,58,0.4)' }}>
          No feedback received yet.
        </p>
      </div>
    )
  }

  const groups = groupByWorkshop(entries)

  function toggle(workshop: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(workshop) ? next.delete(workshop) : next.add(workshop)
      return next
    })
  }

  return (
    <div className="rounded-2xl bg-white overflow-hidden mb-8" style={{ border: '1.5px solid rgba(30,53,96,0.09)' }}>
      <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(30,53,96,0.08)' }}>
        <h2 className="text-sm font-bold" style={{ color: '#1E3560' }}>PD Feedback</h2>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: 'rgba(55,138,221,0.1)', color: '#378ADD' }}
        >
          {entries.length} {entries.length === 1 ? 'response' : 'responses'}
        </span>
      </div>

      <div className="divide-y" style={{ borderColor: 'rgba(30,53,96,0.06)' }}>
        {groups.map(({ workshop, entries: groupEntries, avgRating }) => {
          const isOpen = expanded.has(workshop)
          const recommendCount = groupEntries.filter((e) => e.feedbackWouldRecommend === true).length
          const recommendPct = Math.round((recommendCount / groupEntries.length) * 100)

          return (
            <div key={workshop}>
              {/* Workshop header row */}
              <button
                onClick={() => toggle(workshop)}
                className="w-full px-6 py-4 flex items-start sm:items-center justify-between gap-4 text-left"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: '#1E3560' }}>{workshop}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5">
                    <Stars rating={Math.round(avgRating)} />
                    <span className="text-xs font-semibold" style={{ color: '#E67E22' }}>★ {avgRating.toFixed(1)} / 5</span>
                    <span className="text-xs" style={{ color: 'rgba(43,48,58,0.5)' }}>
                      {groupEntries.length} {groupEntries.length === 1 ? 'response' : 'responses'}
                    </span>
                    {groupEntries.some((e) => e.feedbackWouldRecommend !== undefined) && (
                      <span className="text-xs" style={{ color: 'rgba(43,48,58,0.5)' }}>
                        {recommendPct}% would recommend
                      </span>
                    )}
                  </div>
                </div>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgba(30,53,96,0.4)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
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
                    <div
                      key={entry._id}
                      className="rounded-xl p-4"
                      style={{ backgroundColor: '#F4F7F9', border: '1px solid rgba(30,53,96,0.07)' }}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <p className="text-sm font-semibold" style={{ color: '#1E3560' }}>
                            {entry.firstName} {entry.lastName}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: 'rgba(43,48,58,0.45)' }}>
                            {fmtDate(entry.feedbackSubmittedAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Stars rating={entry.feedbackRating} size={13} />
                          {entry.feedbackWouldRecommend !== undefined && (
                            <span
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                              style={entry.feedbackWouldRecommend
                                ? { backgroundColor: '#dcfce7', color: '#15803d' }
                                : { backgroundColor: '#fee2e2', color: '#b91c1c' }
                              }
                            >
                              {entry.feedbackWouldRecommend ? 'Recommends' : 'Does not recommend'}
                            </span>
                          )}
                        </div>
                      </div>
                      {entry.feedbackEnjoyedMost && (
                        <div className="mb-2">
                          <p className="text-[10px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: 'rgba(43,48,58,0.4)' }}>
                            Enjoyed most
                          </p>
                          <p className="text-xs" style={{ color: '#2B303A' }}>{entry.feedbackEnjoyedMost}</p>
                        </div>
                      )}
                      {entry.feedbackImprovement && (
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: 'rgba(43,48,58,0.4)' }}>
                            Could improve
                          </p>
                          <p className="text-xs" style={{ color: '#2B303A' }}>{entry.feedbackImprovement}</p>
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
    </div>
  )
}
