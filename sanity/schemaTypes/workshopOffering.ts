import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'workshopOffering',
  title: 'Workshop Offering',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Workshop',      value: 'workshop'      },
          { title: 'Course',        value: 'course'        },
          { title: 'Guest Speaker', value: 'guest-speaker' },
        ],
        layout: 'radio',
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'price',
      title: 'In-Person Price (CAD)',
      type: 'number',
    }),
    defineField({
      name: 'hasVirtualOption',
      title: 'Offers Virtual Attendance',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'virtualPrice',
      title: 'Virtual Price (CAD)',
      type: 'number',
      description: 'Only used when Offers Virtual Attendance is enabled.',
    }),
    defineField({
      name: 'capacity',
      title: 'In-Person Capacity',
      type: 'number',
    }),
    defineField({
      name: 'hours',
      title: 'CADA CPP Hours',
      type: 'number',
    }),
    defineField({
      name: 'cadaCppCodes',
      title: 'CADA CPP Codes',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'teamsLink',
      title: 'Teams Meeting Link',
      type: 'string',
      description: 'Microsoft Teams meeting URL sent to virtual registrants. Leave blank to send a placeholder.',
    }),
    defineField({
      name: 'teamsWebinarId',
      title: 'Teams Webinar ID',
      type: 'string',
      description: 'The Teams webinar ID from the event share link. Used to auto-register virtual attendees.',
    }),
    defineField({
      name: 'includesFood',
      title: 'Includes Food (Beverages/Snacks/Lunch)',
      type: 'boolean',
      description: 'Enable to show dietary restrictions field on the registration form for in-person attendees',
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'category' },
    prepare({ title, subtitle }) {
      return { title: title ?? 'Untitled Offering', subtitle: subtitle ?? '' }
    },
  },
})
