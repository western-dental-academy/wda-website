'use client'

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="text-xs font-bold px-3 py-1.5 rounded-lg text-white"
      style={{ backgroundColor: '#0D3B6E' }}
    >
      Print / Save as PDF
    </button>
  )
}
