import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'workshopWaitlist',
  title: 'Workshop Waitlist',
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
          { title: 'Ergonomics in Dentistry: Hands and Spine', value: 'Ergonomics in Dentistry: Hands and Spine' },
          { title: 'Ergonomics in Dentistry: Hips and Hamstrings', value: 'Ergonomics in Dentistry: Hips and Hamstrings' },
          { title: 'Ergonomics in Dentistry: Neck and Shoulders', value: 'Ergonomics in Dentistry: Neck and Shoulders' },
          { title: 'National Board Guided Practice Workshop', value: 'National Board Guided Practice Workshop' },
        ],
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'workshopDateId',
      title: 'Workshop Date ID',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'joinedAt',
      title: 'Joined At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'notified',
      title: 'Notified',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'notifiedAt',
      title: 'Notified At',
      type: 'datetime',
    }),
  ],
  preview: {
    select: {
      firstName: 'firstName',
      lastName: 'lastName',
      workshop: 'workshop',
      notified: 'notified',
    },
    prepare({ firstName, lastName, workshop, notified }) {
      return {
        title: `${firstName ?? ''} ${lastName ?? ''}`.trim(),
        subtitle: `${notified ? '✓ Notified' : 'Waiting'} — ${workshop ?? ''}`,
      }
    },
  },
})
