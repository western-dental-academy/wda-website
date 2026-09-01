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
  { label: 'Google Analytics',         url: 'https://analytics.google.com' },
  { label: 'Microsoft Clarity',        url: 'https://clarity.microsoft.com' },
]

// ── Icons ──────────────────────────────────────────────────────────────────────

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
        <div className="px-6 py-4 border-b flex items-center justify-between gap-4" style={{ borderColor: 'rgba(30,53,96,0.08)' }}>
          <div>
            <h2 className="text-sm font-bold" style={{ color: '#1E3560' }}>Content Calendar</h2>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(43,48,58,0.45)' }}>Powered by Canva</p>
          </div>
          <a
            href="https://www.canva.com/brand/content-planner"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold text-white transition-colors duration-150 hover:opacity-90 shrink-0"
            style={{ backgroundColor: '#0D3B6E' }}
          >
            Open in Canva
            <ExternalLinkIcon />
          </a>
        </div>
        <div className="p-4">
          <iframe
            src="https://www.canva.com/brand/content-planner"
            className="w-full rounded-lg border border-gray-200"
            style={{ height: '600px' }}
            title="Canva Content Calendar"
          />
          <p className="mt-3 text-xs text-center" style={{ color: 'rgba(43,48,58,0.45)' }}>
            Sign in to Canva to view your scheduled posts.
          </p>
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
