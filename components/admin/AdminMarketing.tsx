'use client'

// ── Types ──────────────────────────────────────────────────────────────────────

interface QuickLink {
  label: string
  url: string
  primary?: boolean
}

// ── Data ───────────────────────────────────────────────────────────────────────

const QUICK_LINKS: QuickLink[] = [
  { label: 'Canva',                    url: 'https://www.canva.com',                                                    primary: true },
  { label: 'Instagram',                url: 'https://www.instagram.com/westerndentalacademy' },
  { label: 'Facebook',                 url: 'https://www.facebook.com/westerndentalacademy' },
  { label: 'LinkedIn',                 url: 'https://www.linkedin.com/company/western-dental-academy' },
  { label: 'Google Business Profile',  url: 'https://business.google.com' },
  { label: 'Google Analytics',         url: 'https://analytics.google.com/analytics/web/#/a395405849p538480450/reports/intelligenthome' },
  { label: 'Microsoft Clarity',        url: 'https://clarity.microsoft.com' },
]

// ── Icons ──────────────────────────────────────────────────────────────────────

function CalendarIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#E67E22"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function ExternalLinkIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <path d="M15 3h6v6" />
      <path d="M10 14L21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  )
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function AdminMarketing() {
  return (
    <div className="flex flex-col gap-6">

      {/* ── Content Calendar ── */}
      <div className="rounded-2xl bg-white overflow-hidden" style={{ border: '1.5px solid rgba(30,53,96,0.09)' }}>
        <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(30,53,96,0.08)' }}>
          <h2 className="text-sm font-bold" style={{ color: '#1E3560' }}>Content Calendar</h2>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(43,48,58,0.45)' }}>Powered by Canva</p>
        </div>
        <div className="p-6">
          <a
            href="https://www.canva.com/planner"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-5 rounded-xl p-5 transition-opacity duration-150 hover:opacity-90"
            style={{
              borderLeft: '4px solid #E67E22',
              backgroundColor: 'rgba(230,126,34,0.05)',
              border: '1.5px solid rgba(230,126,34,0.2)',
              borderLeftWidth: '4px',
            }}
          >
            <div
              className="flex items-center justify-center rounded-xl shrink-0"
              style={{ width: 52, height: 52, backgroundColor: 'rgba(230,126,34,0.12)' }}
            >
              <CalendarIcon />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold" style={{ color: '#1E3560' }}>Canva Content Planner</p>
              <p className="text-sm mt-0.5" style={{ color: 'rgba(43,48,58,0.55)' }}>
                View and manage your scheduled posts in Canva
              </p>
            </div>
            <span
              className="shrink-0 rounded-lg px-4 py-2 text-sm font-bold text-white"
              style={{ backgroundColor: '#E67E22' }}
            >
              Open Content Planner →
            </span>
          </a>
        </div>
      </div>

      {/* ── Quick Links ── */}
      <div className="rounded-2xl bg-white overflow-hidden" style={{ border: '1.5px solid rgba(30,53,96,0.09)' }}>
        <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(30,53,96,0.08)' }}>
          <h2 className="text-sm font-bold" style={{ color: '#1E3560' }}>Quick Links</h2>
        </div>
        <div className="p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {QUICK_LINKS.map(({ label, url, primary }) => (
            <a
              key={label}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-opacity duration-150 hover:opacity-80"
              style={{
                backgroundColor: primary ? 'rgba(230,126,34,0.08)' : 'rgba(30,53,96,0.05)',
                color: primary ? '#E67E22' : '#1E3560',
                border: primary ? '1.5px solid rgba(230,126,34,0.2)' : '1.5px solid rgba(30,53,96,0.09)',
              }}
            >
              <span className="truncate">{label}</span>
              <ExternalLinkIcon />
            </a>
          ))}
        </div>
      </div>

    </div>
  )
}
