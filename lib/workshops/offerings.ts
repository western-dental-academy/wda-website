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
  learningObjectives?: string[]
}> = {
  'Ergonomics in Healthcare: Move Well, Breathe Well, Practice Longer': {
    hours: 1.5,
    cadaCppNumbers: ['B-4-2', 'I-5-3', 'I-5-4'],
    delivery: 'In Person',
    learningObjectives: [
      'Identify ergonomic risk factors and posture principles specific to healthcare practice',
      'Apply guided breathwork techniques to reduce tension and support focus during clinical work',
      'Demonstrate yoga-inspired movement sequences adapted for healthcare professionals',
      'Implement targeted stretches for specific areas of the body to prevent injury and burnout',
    ],
  },
  'Ergonomics in Healthcare: Hands, Feet, and Spine': {
    hours: 1.5,
    cadaCppNumbers: ['B-4-2', 'I-5-3', 'I-5-4'],
    delivery: 'In Person',
    learningObjectives: [
      'Identify ergonomic risk factors and posture principles specific to healthcare practice',
      'Apply guided breathwork techniques to reduce tension and support focus during clinical work',
      'Demonstrate yoga-inspired movement sequences adapted for healthcare professionals',
      'Implement targeted stretches for specific areas of the body to prevent injury and burnout',
    ],
  },
  'Ergonomics in Healthcare: Hips and Hamstrings': {
    hours: 1.5,
    cadaCppNumbers: ['B-4-2', 'I-5-3', 'I-5-4'],
    delivery: 'In Person',
    learningObjectives: [
      'Identify ergonomic risk factors and posture principles specific to healthcare practice',
      'Apply guided breathwork techniques to reduce tension and support focus during clinical work',
      'Demonstrate yoga-inspired movement sequences adapted for healthcare professionals',
      'Implement targeted stretches for specific areas of the body to prevent injury and burnout',
    ],
  },
  'Ergonomics in Healthcare: Neck and Shoulders': {
    hours: 1.5,
    cadaCppNumbers: ['B-4-2', 'I-5-3', 'I-5-4'],
    delivery: 'In Person',
    learningObjectives: [
      'Identify ergonomic risk factors and posture principles specific to healthcare practice',
      'Apply guided breathwork techniques to reduce tension and support focus during clinical work',
      'Demonstrate yoga-inspired movement sequences adapted for healthcare professionals',
      'Implement targeted stretches for specific areas of the body to prevent injury and burnout',
    ],
  },
  'National Board Guided Practice Workshop': {
    hours: 8,
    delivery: 'In Person',
    learningObjectives: [
      'Demonstrate competency in clinical skills required for the National Dental Assisting Examining Board CPE evaluation',
      'Practice and refine technique across required skill stations',
      'Identify areas requiring improvement prior to the CPE examination',
      'Build confidence and readiness for successful CPE completion',
    ],
  },
  'Renewal Wellness': {
    hours: 6,
    cadaCppNumbers: ['I-2-1', 'D-3-1', 'I-5-4', 'B-5-3', 'F-2-1', 'F-2-2'],
    delivery: 'In Person / Virtual',
    speakerBreakdown: [
      { speaker: 'Steve Wong', topic: 'Acupuncture for TMJ', hours: 0.75 },
      { speaker: 'Samantha Coleman & Emily Griffiths', topic: 'Obstructive Sleep Apnea', hours: 1.0 },
      { speaker: 'Naomi Klassen', topic: 'Beyond the Diagnosis: Purposeful Dementia Engagement', hours: 1.25 },
      { speaker: 'Lance Parker', topic: 'Addictions and Oral Health', hours: 1.25 },
      { speaker: 'Tony Korobanik', topic: 'Limiting Your Liability in Emergency Situations', hours: 1.75 },
    ],
    learningObjectives: [
      'Navigate the CADA registration renewal process with confidence',
      'Recognize the signs and risk factors of Obstructive Sleep Apnea in dental patients',
      'Recognize addiction influences on dental health and identify resources to support patients with addictions',
      'Describe acupuncture as an alternative treatment for TMD and when to refer patients',
      'Identify roles and responsibilities in emergency situations to reduce liability in practice',
    ],
  },
}
