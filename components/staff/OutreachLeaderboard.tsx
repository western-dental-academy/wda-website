import { CONTEST_START_LABEL } from '@/lib/offices/leaderboard'

export interface OutreachLeaderboardRow {
  name: string
  count: number
  offices: number
}

// Read-only office outreach standings for staff; management lives in WDA Hub → Marketing
export default function OutreachLeaderboard({ rows }: { rows: OutreachLeaderboardRow[] }) {
  if (rows.length === 0) return null
  const topCount = rows[0]?.count ?? 0

  return (
    <div
      className="rounded-2xl px-5 py-4"
      style={{ backgroundColor: '#ffffff', boxShadow: '0 1px 4px rgba(13,59,110,0.07)' }}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <p
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: 'rgba(13,59,110,0.4)', fontFamily: 'var(--font-montserrat), sans-serif' }}
        >
          Office Outreach Contest
        </p>
        <span
          className="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold"
          style={{ backgroundColor: 'rgba(230,126,34,0.1)', color: '#E67E22' }}
        >
          Started {CONTEST_START_LABEL}
        </span>
      </div>

      <ol className="flex flex-col gap-2">
        {rows.map((row, i) => {
          const isLeader = i === 0 && row.count > 0
          const width = topCount > 0 ? Math.max(4, (row.count / topCount) * 100) : 4
          return (
            <li key={row.name} className="rounded-xl px-4 py-3" style={{ backgroundColor: '#F4F7F9' }}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold truncate" style={{ color: '#1E3560' }}>
                  <span className="mr-2" style={{ color: 'rgba(30,53,96,0.4)' }}>{i + 1}.</span>
                  {row.name}
                  {isLeader && <span className="ml-1.5" role="img" aria-label="Leader">🏆</span>}
                </p>
                <p className="text-sm font-bold shrink-0" style={{ color: isLeader ? '#E67E22' : '#1E3560' }}>
                  {row.count} {row.count === 1 ? 'registrant' : 'registrants'}
                </p>
              </div>
              <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(30,53,96,0.08)' }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${width}%`, backgroundColor: isLeader ? '#E67E22' : '#378ADD' }}
                />
              </div>
              <p className="text-xs mt-1.5" style={{ color: 'rgba(43,48,58,0.55)' }}>
                {row.offices} {row.offices === 1 ? 'office' : 'offices'} visited
              </p>
            </li>
          )
        })}
      </ol>

      <p className="text-xs mt-3" style={{ color: 'rgba(43,48,58,0.45)' }}>
        Counts new paid registrants who picked or were matched to an office you visited.
      </p>
    </div>
  )
}
