// Tutoring & coaching: details shared by the public page, the inquiry form,
// the WDA Hub panel and the emails. Safe to import from client components.

export const TUTORING_HOURLY_RATE = 50 // CAD per hour, no surcharge
export const TUTORING_MAX_HOURS = 20 // largest single payment request staff can send

export type TutoringService = 'tutoring' | 'coaching'

export interface TutoringServiceInfo {
  value: TutoringService
  title: string
  short: string
  audience: string
  points: string[]
}

export const TUTORING_SERVICES: TutoringServiceInfo[] = [
  {
    value: 'tutoring',
    title: 'Tutoring for Dental Assisting Studies',
    short: 'Tutoring',
    audience: 'For students currently in Dental Assisting studies',
    points: [
      'Improve understanding, build study strategies, and increase confidence and academic success',
      'Theory only',
      'Instruction conducted in English',
      'Open to students currently in Dental Assisting studies',
    ],
  },
  {
    value: 'coaching',
    title: 'Coaching for New Dental Assisting Graduates',
    short: 'Coaching',
    audience: 'For recent graduates of Canadian Dental Assisting training',
    points: [
      'Improve confidence, organization and efficiency',
      'Review concepts and increase understanding',
      'Theory only (practical coaching may be available in 2027)',
      'Coaching conducted in English',
      'Open to graduates of Canadian Dental Assisting training',
    ],
  },
]

export const TUTORING_AREAS = [
  'Dental anatomy',
  'Dental terminology',
  'Infection prevention & control',
  'Dental materials',
  'Radiography',
  'Instruments & procedures',
  'Pharmacology & medical emergencies',
  'Study skills & exam strategies',
  'Confidence, organization & efficiency',
] as const

export const TUTORING_FORMATS = [
  { value: 'online', label: 'Online' },
  { value: 'in-person', label: 'In person at our facility' },
  { value: 'either', label: 'Either works' },
] as const

export type TutoringFormat = (typeof TUTORING_FORMATS)[number]['value']

export type TutoringStatus = 'new' | 'contacted' | 'payment-requested' | 'paid' | 'closed'

export const TUTORING_STATUS_LABELS: Record<TutoringStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  'payment-requested': 'Payment requested',
  paid: 'Paid',
  closed: 'Closed',
}

export function serviceTitle(v?: string): string {
  return TUTORING_SERVICES.find(s => s.value === v)?.title ?? 'Tutoring & Coaching'
}

export function formatLabel(v?: string): string {
  return TUTORING_FORMATS.find(f => f.value === v)?.label ?? '—'
}
