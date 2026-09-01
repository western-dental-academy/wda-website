import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'workshopDate',
  title: 'Workshop Date',
  type: 'document',
  fields: [
    defineField({
      name: 'workshop',
      title: 'Workshop Name',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Workshop',      value: 'workshop' },
          { title: 'Course',        value: 'course' },
          { title: 'Guest Speaker', value: 'guest-speaker' },
        ],
        layout: 'radio',
      },
      initialValue: 'workshop',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'datetime',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'capacity',
      title: 'Max Participants',
      type: 'number',
      initialValue: 20,
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'feedbackEnabled',
      title: 'Feedback QR Enabled',
      type: 'boolean',
      description: 'Enable the feedback QR code for this workshop date',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      workshop: 'workshop',
      date: 'date',
      active: 'active',
    },
    prepare(selection: Record<string, any>) {
      const { workshop, date, active } = selection
      const formatted = date
        ? new Date(date).toLocaleDateString('en-CA', {
            timeZone: 'America/Edmonton',
            weekday: 'short',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : ''
      return {
        title: `${!active ? '(Inactive) ' : ''}${workshop ?? 'Workshop Date'}`,
        subtitle: formatted,
      }
    },
  },
})
