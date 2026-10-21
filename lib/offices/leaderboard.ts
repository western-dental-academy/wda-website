// Office outreach contest scoring, shared by the WDA Hub Marketing tab and the staff page

export interface ContestReferral {
  _id: string
  email?: string
  registeredAt?: string
  officeId?: string
}

export interface ContestOffice {
  _id: string
  visitedBy?: string
  visited?: boolean
}

// Contest starts from scratch on Oct 21, 2026 (midnight Alberta time). Anyone who
// registered for anything before then is a returning registrant and does not count.
export const CONTEST_START_MS = Date.parse('2026-10-21T00:00:00-06:00')
export const CONTEST_START_LABEL = 'Oct 21, 2026'

function registeredMs(r: ContestReferral): number {
  return r.registeredAt ? Date.parse(r.registeredAt) : 0
}

export function personKey(r: ContestReferral): string {
  return (r.email ?? r._id).trim().toLowerCase()
}

// Contest registrants: registered on/after the start and never registered for anything before it
export function contestRegistrants<T extends ContestReferral>(referrals: T[]): T[] {
  const returning = new Set(referrals.filter(r => registeredMs(r) < CONTEST_START_MS).map(personKey))
  return referrals.filter(r => registeredMs(r) >= CONTEST_START_MS && !returning.has(personKey(r)))
}

// Unique registrants (by email) from visited offices, credited to the staff member who visited
export function computeStaffLeaderboard(offices: ContestOffice[], referrals: ContestReferral[]) {
  const officeById = new Map(offices.map(o => [o._id, o]))
  const staff = new Map<string, { people: Set<string>; offices: Set<string> }>()
  for (const r of referrals) {
    const office = r.officeId ? officeById.get(r.officeId) : undefined
    if (!office?.visited || !office.visitedBy) continue
    const s = staff.get(office.visitedBy) ?? { people: new Set<string>(), offices: new Set<string>() }
    s.people.add(personKey(r))
    s.offices.add(office._id)
    staff.set(office.visitedBy, s)
  }
  return Array.from(staff.entries())
    .map(([name, s]) => ({ name, count: s.people.size, offices: s.offices.size }))
    .sort((a, b) => b.count - a.count)
}

// Read-only standings for staff views: everyone who has visited an office (including people
// with no registrants yet), with offices = how many offices they visited. WDA staff test
// registrations are left out. Run on the server so no registrant details reach the browser.
export function buildOutreachRows(offices: ContestOffice[], allReferrals: ContestReferral[]) {
  const referrals = contestRegistrants(
    allReferrals.filter(r => !(r.email ?? '').toLowerCase().endsWith('@westerndentalacademy.com')),
  )
  const visited = offices.filter(o => o.visited && o.visitedBy)
  const scores = new Map(computeStaffLeaderboard(visited, referrals).map(r => [r.name, r.count]))
  const officesVisited = new Map<string, number>()
  for (const o of visited) officesVisited.set(o.visitedBy!, (officesVisited.get(o.visitedBy!) ?? 0) + 1)
  return Array.from(officesVisited.entries())
    .map(([name, count]) => ({ name, count: scores.get(name) ?? 0, offices: count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}

// GROQ for the fields buildOutreachRows needs — nothing else
export const OUTREACH_OFFICES_QUERY =
  `*[_type == "dentalOffice" && !(_id in path("drafts.**"))]{ _id, visitedBy, visited }`
export const OUTREACH_WORKSHOP_REGS_QUERY =
  `*[_type == "workshopRegistration" && !(_id in path("drafts.**")) && stripePaymentStatus == "paid"]{
    _id, email, registeredAt, "officeId": office._ref
  }`
export const OUTREACH_COURSE_ENROLLMENTS_QUERY =
  `*[_type == "courseEnrollment" && !(_id in path("drafts.**")) && stripePaymentStatus == "paid"]{
    _id, "email": student.email, "registeredAt": enrolledAt, "officeId": office._ref
  }`
