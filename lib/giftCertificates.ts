const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateGiftCode(): string {
  const segment = () =>
    Array.from({ length: 4 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('')
  return `WDA-${segment()}-${segment()}`
}

export function getExpiryDate(): string {
  const d = new Date()
  d.setFullYear(d.getFullYear() + 1)
  return d.toISOString()
}

export function formatExpiryDisplay(iso: string): string {
  return new Date(iso).toLocaleDateString('en-CA', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}
