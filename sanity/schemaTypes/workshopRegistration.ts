import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'workshopRegistration',
  title: 'Workshop Registration',
  type: 'document',
  fields: [
    defineField({
      name: 'firstName',
      title: 'First Name',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'lastName',
      title: 'Last Name',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'pronouns',
      title: 'Pronouns',
      type: 'string',
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: Rule => Rule.required().email(),
    }),
    defineField({
      name: 'phone',
      title: 'Phone',
      type: 'string',
    }),
    defineField({
      name: 'workshop',
      title: 'Workshop',
      type: 'string',
      options: {
        list: [
          { title: 'Ergonomics in Dentistry: Move Well, Breathe Well, Practice Longer', value: 'Ergonomics in Dentistry: Move Well, Breathe Well, Practice Longer' },
          { title: 'Ergonomics in Dentistry: Hands and Spine', value: 'Ergonomics in Dentistry: Hands and Spine' },
          { title: 'Ergonomics in Dentistry: Hips and Hamstrings', value: 'Ergonomics in Dentistry: Hips and Hamstrings' },
          { title: 'Ergonomics in Dentistry: Neck and Shoulders', value: 'Ergonomics in Dentistry: Neck and Shoulders' },
          { title: 'National Board Guided Practice Workshop', value: 'National Board Guided Practice Workshop' },
          { title: 'NDAB Skills Refresher Workshop', value: 'NDAB Skills Refresher Workshop' },
          { title: 'Dental Practice Software Masterclass', value: 'Dental Practice Software Masterclass' },
          { title: 'Front Office Excellence Workshop', value: 'Front Office Excellence Workshop' },
          { title: 'Ergonomics & Career Longevity Workshop', value: 'Ergonomics & Career Longevity Workshop' },
          { title: 'Inventory & Supply Management Workshop', value: 'Inventory & Supply Management Workshop' },
          { title: 'Renewal Wellness Workshop', value: 'Renewal Wellness Workshop' },
        ],
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'preferredDate',
      title: 'Preferred Date',
      type: 'string',
    }),
    defineField({
      name: 'questions',
      title: 'Questions / Special Requests',
      type: 'text',
    }),
    defineField({
      name: 'dietaryRestrictions',
      title: 'Dietary Restrictions',
      type: 'string',
    }),
    defineField({
      name: 'stripePaymentStatus',
      title: 'Payment Status',
      type: 'string',
      options: {
        list: [
          { title: 'Unpaid', value: 'unpaid' },
          { title: 'Paid', value: 'paid' },
          { title: 'Refunded', value: 'refunded' },
        ],
        layout: 'radio',
      },
      initialValue: 'unpaid',
    }),
    defineField({
      name: 'stripeSessionId',
      title: 'Stripe Session ID',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'registeredAt',
      title: 'Registered At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'cadaNumber',
      title: 'CADA Membership Number',
      type: 'string',
      description: 'Optional — entered by registrant during registration',
    }),
    defineField({
      name: 'dentalBackground',
      title: 'Dental Background / Education',
      type: 'text',
      rows: 3,
      description: 'Entered by registrant during registration',
    }),
    defineField({
      name: 'workshopDateId',
      title: 'Workshop Date',
      type: 'string',
    }),
    defineField({
      name: 'mediaConsent',
      title: 'Media Consent',
      type: 'boolean',
      description: 'Whether the registrant consented to being photographed/recorded at the event.',
    }),
    defineField({
      name: 'feedbackToken',
      title: 'Feedback Token',
      type: 'string',
      description: 'Unique token used to authenticate the feedback form URL',
    }),
    defineField({
      name: 'feedbackRating',
      title: 'Feedback Rating',
      type: 'number',
      description: '1–5 star rating submitted by the registrant',
    }),
    defineField({
      name: 'feedbackEnjoyedMost',
      title: 'What They Enjoyed Most',
      type: 'text',
    }),
    defineField({
      name: 'feedbackImprovement',
      title: 'What Could Be Improved',
      type: 'text',
    }),
    defineField({
      name: 'feedbackWouldRecommend',
      title: 'Would Recommend WDA',
      type: 'boolean',
    }),
    defineField({
      name: 'feedbackSubmittedAt',
      title: 'Feedback Submitted At',
      type: 'datetime',
    }),
    defineField({
      name: 'deliveryMethod',
      title: 'Delivery Method',
      type: 'string',
      options: {
        list: [
          { title: 'In-Person', value: 'in-person' },
          { title: 'Virtual', value: 'virtual' },
        ],
      },
      description: 'How the registrant will attend',
    }),
    defineField({
      name: 'checkedIn',
      title: 'Checked In',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'checkedInAt',
      title: 'Checked In At',
      type: 'datetime',
    }),
    defineField({
      name: 'certificateSent',
      title: 'Certificate Sent',
      type: 'boolean',
      initialValue: false,
      description: 'Set to true after the certificate of attendance email is successfully sent',
    }),
  ],
  preview: {
    select: {
      firstName: 'firstName',
      lastName: 'lastName',
      workshop: 'workshop',
      status: 'stripePaymentStatus',
    },
    prepare({ firstName, lastName, workshop, status }) {
      return {
        title: `${firstName ?? ''} ${lastName ?? ''}`.trim(),
        subtitle: `${(status ?? 'unpaid').toUpperCase()} — ${workshop ?? ''}`,
      }
    },
  },
})
