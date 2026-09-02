import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'workshopDate',
  title: 'Workshop Date',
  type: 'document',
  fields: [
    defineField({
      name: 'offering',
      title: 'Workshop Offering',
      type: 'reference',
      to: [{ type: 'workshopOffering' }],
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'datetime',
      validation: Rule => Rule.required(),
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
      title: 'offering.title',
      subtitle: 'date',
    },
    prepare({ title, subtitle }) {
      const formatted = subtitle
        ? new Date(subtitle).toLocaleDateString('en-CA', {
            timeZone: 'America/Edmonton',
            weekday: 'short',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : ''
      return {
        title: title ?? 'Workshop Date',
        subtitle: formatted,
      }
    },
  },
})
