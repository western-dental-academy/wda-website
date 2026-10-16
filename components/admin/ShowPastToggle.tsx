'use client'

export default function ShowPastToggle({
  showPast,
  pastCount,
  onToggle,
}: {
  showPast: boolean
  pastCount: number
  onToggle: () => void
}) {
  if (pastCount === 0) return null
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={showPast}
      className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold border transition-colors duration-150 hover:border-[#378ADD] hover:text-[#378ADD]"
      style={{
        borderColor: showPast ? '#378ADD' : 'rgba(30,53,96,0.15)',
        color: showPast ? '#378ADD' : 'rgba(30,53,96,0.6)',
        backgroundColor: showPast ? 'rgba(55,138,221,0.08)' : 'transparent',
      }}
    >
      {showPast ? `Hide past (${pastCount})` : `Show past (${pastCount})`}
    </button>
  )
}
