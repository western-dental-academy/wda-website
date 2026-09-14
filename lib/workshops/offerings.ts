export interface SpeakerBreakdownEntry {
  speaker: string
  topic: string
  hours: number
}

export const OFFERING_METADATA: Record<string, {
  hours: number
  cadaCppNumbers?: string[]
  delivery: 'In Person' | 'Online' | 'In Person / Virtual'
  speakerBreakdown?: SpeakerBreakdownEntry[]
}> = {
  'Ergonomics in Healthcare: Move Well, Breathe Well, Practice Longer': {
    hours: 1.5,
    cadaCppNumbers: ['B-4-2', 'I-5-3', 'I-5-4'],
    delivery: 'In Person',
  },
  'Ergonomics in Healthcare: Hands, Feet, and Spine': {
    hours: 1.5,
    cadaCppNumbers: ['B-4-2', 'I-5-3', 'I-5-4'],
    delivery: 'In Person',
  },
  'Ergonomics in Healthcare: Hips and Hamstrings': {
    hours: 1.5,
    cadaCppNumbers: ['B-4-2', 'I-5-3', 'I-5-4'],
    delivery: 'In Person',
  },
  'Ergonomics in Healthcare: Neck and Shoulders': {
    hours: 1.5,
    cadaCppNumbers: ['B-4-2', 'I-5-3', 'I-5-4'],
    delivery: 'In Person',
  },
  'National Board Guided Practice Workshop': {
    hours: 8,
    delivery: 'In Person',
  },
  'Renewal Wellness': {
    hours: 6.25,
    cadaCppNumbers: ['I-2-1', 'D-3-1', 'I-5-4', 'B-5-3'],
    delivery: 'In Person / Virtual',
    speakerBreakdown: [
      { speaker: 'Jolene Moore', topic: 'Registration Renewal Unraveled', hours: 0.75 },
      { speaker: 'Samantha Coleman & Emily Griffiths', topic: 'Obstructive Sleep Apnea', hours: 1.0 },
      { speaker: 'TBD', topic: 'Session 3', hours: 1.25 },
      { speaker: 'Josie McKenzie', topic: 'Financial Wellness — Drill Down Into Your Finances', hours: 1.25 },
      { speaker: 'Tony Korobanik', topic: 'Limiting Your Liability in Emergency Situations', hours: 2.0 },
    ],
  },
}
