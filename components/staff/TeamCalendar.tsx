interface ApprovedRequest {
  _id: string
  type: string
  startDate: string
  endDate: string
  staffMember: {
    fullName: string
  }
}

interface Props {
  requests: ApprovedRequest[]
  year: number
  month: number // 1-based
}

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  vacation: { bg: '#378ADD', text: '#fff' },
  sick:     { bg: '#f59e0b', text: '#fff' },
  personal: { bg: '#8b5cf6', text: '#fff' },
  unpaid:   { bg: '#6b7280', text: '#fff' },
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_LABELS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

export default function TeamCalendar({ requests, year, month }: Props) {
  const firstDay = new Date(year, month - 1, 1).getDay() // 0=Sun
  const startOffset = firstDay === 0 ? 6 : firstDay - 1  // Monday-first offset
  const daysInMonth = new Date(year, month, 0).getDate()

  // Build map: day number → list of (name, type) for people off
  const dayMap: Record<number, Array<{ name: string; type: string }>> = {}
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const out: Array<{ name: string; type: string }> = []
    for (const r of requests) {
      if (r.startDate <= dateStr && r.endDate >= dateStr) {
        const first = r.staffMember.fullName.split(' ')[0]
        out.push({ name: first, type: r.type })
      }
    }
    if (out.length > 0) dayMap[d] = out
  }

  const totalCells = startOffset + daysInMonth
  const rows = Math.ceil(totalCells / 7)
  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ...Array(rows * 7 - totalCells).fill(null),
  ]

  const today = new Date()
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month
  const todayDate = today.getDate()

  return (
    <div className="rounded-2xl bg-white overflow-hidden" style={{ border: '1.5px solid rgba(13,59,110,0.1)' }}>
      <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(13,59,110,0.08)' }}>
        <h2
          className="font-bold text-base"
          style={{ color: '#0D3B6E', fontFamily: 'var(--font-montserrat), sans-serif' }}
        >
          Team Calendar — {MONTH_NAMES[month - 1]} {year}
        </h2>
        <div className="flex gap-4 mt-2">
          {Object.entries(TYPE_COLORS).map(([type, { bg }]) => (
            <span key={type} className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(43,48,58,0.55)' }}>
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: bg }} />
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </span>
          ))}
        </div>
      </div>

      <div className="p-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAY_LABELS.map(d => (
            <div key={d} className="text-center text-xs font-semibold py-1" style={{ color: 'rgba(43,48,58,0.35)' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-px" style={{ backgroundColor: 'rgba(13,59,110,0.06)' }}>
          {cells.map((day, i) => {
            const isToday = isCurrentMonth && day === todayDate
            const entries = day ? (dayMap[day] ?? []) : []
            return (
              <div
                key={i}
                className="bg-white min-h-[64px] p-1"
                style={{ backgroundColor: isToday ? 'rgba(55,138,221,0.06)' : '#fff' }}
              >
                {day !== null && (
                  <>
                    <span
                      className="text-xs font-medium block mb-1 text-right pr-0.5"
                      style={{
                        color: isToday ? '#378ADD' : 'rgba(43,48,58,0.65)',
                        fontWeight: isToday ? 700 : 400,
                      }}
                    >
                      {day}
                    </span>
                    <div className="space-y-0.5">
                      {entries.slice(0, 3).map((e, j) => {
                        const c = TYPE_COLORS[e.type] ?? { bg: '#6b7280', text: '#fff' }
                        return (
                          <div
                            key={j}
                            className="text-[10px] font-medium px-1 rounded truncate leading-4"
                            style={{ backgroundColor: c.bg, color: c.text }}
                            title={e.name}
                          >
                            {e.name}
                          </div>
                        )
                      })}
                      {entries.length > 3 && (
                        <div className="text-[10px] px-1" style={{ color: 'rgba(43,48,58,0.4)' }}>
                          +{entries.length - 3}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
