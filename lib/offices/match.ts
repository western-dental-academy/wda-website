// Suggests which dental office a registrant works at when they didn't pick one
// on the registration form. Suggestions are only shown to staff in the WDA Hub
// for one-click confirmation; nothing is credited until someone confirms.

export interface OfficeForMatch {
  _id: string
  name: string
  city?: string
  email?: string
  website?: string
}

export interface RegistrantForMatch {
  email?: string
  officeOther?: string
  dentalBackground?: string
}

export interface OfficeSuggestion {
  officeId: string
  reason: string
}

// Personal mailbox providers never identify an office
const GENERIC_DOMAINS = new Set([
  'gmail.com', 'googlemail.com', 'hotmail.com', 'hotmail.ca', 'outlook.com', 'outlook.ca',
  'live.com', 'live.ca', 'msn.com', 'yahoo.com', 'yahoo.ca', 'icloud.com', 'me.com', 'mac.com',
  'shaw.ca', 'telus.net', 'telusplanet.net', 'rogers.com', 'sasktel.net', 'aol.com',
  'protonmail.com', 'proton.me', 'westerndentalacademy.com',
])

// Words that appear in most office names and so can't tell offices apart
const COMMON_WORDS = new Set([
  'dental', 'dentistry', 'dentists', 'dentist', 'clinic', 'centre', 'center', 'family',
  'group', 'the', 'and', 'care', 'health', 'smile', 'smiles', 'dr', 'orthodontics', 'ortho',
  'of', 'on', 'at', 'studio', 'office',
])

function normalise(s: string): string {
  return s.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim()
}

function domainOf(value?: string): string {
  if (!value) return ''
  const v = value.trim().toLowerCase()
  const at = v.lastIndexOf('@')
  const host = at >= 0 ? v.slice(at + 1) : v.replace(/^https?:\/\//, '').split('/')[0]
  return host.replace(/^www\./, '')
}

function distinctiveTokens(name: string): string[] {
  return normalise(name).split(' ').filter(t => t.length >= 3 && !COMMON_WORDS.has(t))
}

export function suggestOffice(reg: RegistrantForMatch, offices: OfficeForMatch[]): OfficeSuggestion | null {
  const regDomain = domainOf(reg.email)
  const usableDomain = regDomain && !GENERIC_DOMAINS.has(regDomain) ? regDomain : ''

  // 1. Same email domain as an office we have on file
  if (usableDomain) {
    const exact = offices.filter(o => {
      const d = [domainOf(o.email), domainOf(o.website)].filter(x => x && !GENERIC_DOMAINS.has(x))
      return d.includes(usableDomain)
    })
    if (exact.length === 1) return { officeId: exact[0]._id, reason: `Email domain matches ${usableDomain}` }
  }

  // 2. Office typed in "Other": every distinctive word of the office name is present
  if (reg.officeOther?.trim()) {
    const words = new Set(normalise(reg.officeOther).split(' '))
    const scored = offices
      .map(o => ({ o, tokens: distinctiveTokens(o.name) }))
      .filter(({ tokens }) => tokens.length > 0 && tokens.every(t => words.has(t)))
      .sort((a, b) => b.tokens.length - a.tokens.length)
    if (scored.length === 1 || (scored.length > 1 && scored[0].tokens.length > scored[1].tokens.length)) {
      return { officeId: scored[0].o._id, reason: `They typed "${reg.officeOther.trim()}"` }
    }
  }

  // 3. Office name mentioned in their dental background
  if (reg.dentalBackground?.trim()) {
    const text = ` ${normalise(reg.dentalBackground)} `
    const hits = offices
      .filter(o => distinctiveTokens(o.name).length > 0)
      .filter(o => text.includes(` ${normalise(o.name).replace(/^the /, '')} `))
      .sort((a, b) => normalise(b.name).length - normalise(a.name).length)
    if (hits.length > 0) {
      return { officeId: hits[0]._id, reason: `"${hits[0].name}" appears in their dental background` }
    }
  }

  // 4. Office's distinctive name appears in the email domain (e.g. reception@parkstonedental.ca)
  if (usableDomain) {
    const label = usableDomain.split('.').slice(0, -1).join('')
    const hits = offices.filter(o => {
      const key = distinctiveTokens(o.name).join('')
      return key.length >= 4 && label.includes(key)
    })
    if (hits.length === 1) return { officeId: hits[0]._id, reason: `Email domain ${usableDomain} looks like ${hits[0].name}` }
  }

  return null
}
