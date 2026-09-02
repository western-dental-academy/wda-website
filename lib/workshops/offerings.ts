export const OFFERING_METADATA: Record<string, {
  hours: number
  cadaCppNumbers?: string[]
  delivery: 'In Person' | 'Online' | 'In Person / Virtual'
}> = {
  'Ergonomics in Dentistry: Move Well, Breathe Well, Practice Longer': {
    hours: 1.5,
    cadaCppNumbers: ['B-4-2', 'I-5-3', 'I-5-4'],
    delivery: 'In Person',
  },
  'Ergonomics in Dentistry: Hands and Spine': {
    hours: 1.5,
    cadaCppNumbers: ['B-4-2', 'I-5-3', 'I-5-4'],
    delivery: 'In Person',
  },
  'Ergonomics in Dentistry: Hips and Hamstrings': {
    hours: 1.5,
    cadaCppNumbers: ['B-4-2', 'I-5-3', 'I-5-4'],
    delivery: 'In Person',
  },
  'Ergonomics in Dentistry: Neck and Shoulders': {
    hours: 1.5,
    cadaCppNumbers: ['B-4-2', 'I-5-3', 'I-5-4'],
    delivery: 'In Person',
  },
  'National Board Guided Practice Workshop': {
    hours: 8,
    delivery: 'In Person',
  },
  'Renewal Wellness Workshop': {
    hours: 6.25,
    cadaCppNumbers: ['I-2-1', 'D-3-1', 'I-5-4', 'B-5-3'],
    delivery: 'In Person / Virtual',
  },
}
