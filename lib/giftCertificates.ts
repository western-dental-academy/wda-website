const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateGiftCode(): string {
  const segment = () =>
    Array.from({ length: 4 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('')
  return `WDA-${segment()}-${segment()}`
}

export function getExpiryDate(months = 12): string {
  const d = new Date()
  d.setMonth(d.getMonth() + months)
  return d.toISOString()
}

// Refer-a-friend reward: single-use % off, valid 6 months, professional development only
export const REFERRAL_PERCENT_OFF = 25
export const REFERRAL_EXPIRY_MONTHS = 6

export function isReferralExcluded(offeringName: string): boolean {
  return offeringName.includes('National Board')
}

export function formatExpiryDisplay(iso: string): string {
  return new Date(iso).toLocaleDateString('en-CA', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}
