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
          { title: 'NDAB Skills Refresher Workshop', value: 'NDAB Skills Refresher Workshop' },
          { title: 'Dental Practice Software Masterclass', value: 'Dental Practice Software Masterclass' },
          { title: 'Front Office Excellence Workshop', value: 'Front Office Excellence Workshop' },
          { title: 'Ergonomics & Career Longevity Workshop', value: 'Ergonomics & Career Longevity Workshop' },
          { title: 'Inventory & Supply Management Workshop', value: 'Inventory & Supply Management Workshop' },
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
      name: 'workshopDateId',
      title: 'Workshop Date',
      type: 'string',
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
