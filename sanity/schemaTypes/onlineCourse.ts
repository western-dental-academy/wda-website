import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'onlineCourse',
  title: 'Online Course',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'price',
      title: 'Price (CAD)',
      type: 'number',
      validation: Rule => Rule.required().min(0),
    }),
    defineField({
      name: 'moodleCourseId',
      title: 'Moodle Course ID',
      type: 'number',
      validation: Rule => Rule.required().integer().positive(),
    }),
    defineField({
      name: 'accessDurationDays',
      title: 'Access Duration (days)',
      type: 'number',
      initialValue: 365,
      description: 'How many days the learner has access after purchase',
    }),
    defineField({
      name: 'hours',
      title: 'Course Hours',
      type: 'number',
      description: 'Total hours for the certificate of completion',
    }),
    defineField({
      name: 'extensionPrice',
      title: 'Extension Price (CAD)',
      type: 'number',
      description: 'Price to purchase a 3-week access extension (leave blank to disable extensions)',
    }),
    defineField({
      name: 'active',
      title: 'Active (visible on website)',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: { title: 'title', price: 'price', active: 'active' },
    prepare({ title, price, active }) {
      return {
        title: title ?? 'Untitled Course',
        subtitle: `${price != null ? `$${price} CAD` : 'No price set'} · ${active ? 'Active' : 'Inactive'}`,
      }
    },
  },
})
