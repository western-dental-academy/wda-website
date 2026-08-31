'use client'

import { useState } from 'react'

export default function DownloadIdCardButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDownload() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/staff/id-card')
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setError(data?.error ?? 'Failed to generate ID card. Please try again.')
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'WDA-Staff-ID.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setError('Failed to generate ID card. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleDownload}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ backgroundColor: '#0D3B6E' }}
        onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#378ADD' }}
        onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#0D3B6E' }}
      >
        {loading ? (
          <>
            <svg className="animate-spin w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25" />
              <path fill="currentColor" fillOpacity="0.75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Generating...
          </>
        ) : (
          <>
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0" aria-hidden>
              <path fillRule="evenodd" clipRule="evenodd" d="M10 3a1 1 0 011 1v7.586l2.293-2.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 11.586V4a1 1 0 011-1z" />
              <path fillRule="evenodd" clipRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
            </svg>
            Download Staff ID Card
          </>
        )}
      </button>
      {error && (
        <p className="mt-2 text-xs" style={{ color: '#dc2626' }}>{error}</p>
      )}
    </div>
  )
}
