import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'announcement',
  title: 'Announcement',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'message',
      title: 'Message',
      type: 'text',
      rows: 4,
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          { title: 'Info', value: 'info' },
          { title: 'Important', value: 'important' },
          { title: 'Reminder', value: 'reminder' },
          { title: 'Good News', value: 'success' },
        ],
        layout: 'radio',
      },
      initialValue: 'info',
    }),
    defineField({
      name: 'program',
      title: 'Programme',
      type: 'reference',
      to: [{ type: 'program' }],
      description: 'Leave blank to show to all students',
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
      description: 'Uncheck to hide this announcement',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'expiresAt',
      title: 'Expires At',
      type: 'datetime',
      description: 'Optional — announcement will auto-hide after this date',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      type: 'type',
      active: 'active',
    },
    prepare({ title, type, active }) {
      return {
        title,
        subtitle: `${type?.toUpperCase()} — ${active ? 'Active' : 'Hidden'}`,
      }
    },
  },
  orderings: [
    {
      title: 'Newest First',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
})