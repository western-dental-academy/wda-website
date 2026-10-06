import { defineArrayMember, defineField, defineType } from 'sanity'

const DAYS = [
  { title: 'Monday', value: 'monday' },
  { title: 'Tuesday', value: 'tuesday' },
  { title: 'Wednesday', value: 'wednesday' },
  { title: 'Thursday', value: 'thursday' },
  { title: 'Friday', value: 'friday' },
  { title: 'Saturday', value: 'saturday' },
  { title: 'Sunday', value: 'sunday' },
]

const TIME_PATTERN = /^([01]\d|2[0-3]):00$/

// Singleton (document id "invigilationSettings"). If it doesn't exist yet the
// website falls back to the defaults in lib/invigilation/settings.ts.
export default defineType({
  name: 'invigilationSettings',
  title: 'Exam Invigilation Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'bookingsOpen',
      title: 'Online Bookings Open',
      type: 'boolean',
      description: 'Turn off to pause all online invigilation bookings.',
      initialValue: true,
    }),
    defineField({
      name: 'sessionPrice',
      title: 'Session Price (CAD)',
      type: 'number',
      description: 'Flat fee per exam session, regardless of length.',
      initialValue: 40,
      validation: Rule => Rule.required().min(0),
    }),
    defineField({
      name: 'verbalReaderPrice',
      title: 'Verbal Reader Fee (CAD)',
      type: 'number',
      description: 'Extra charge when a verbal exam reader is requested. Policy: equal to the invigilation fee.',
      initialValue: 40,
      validation: Rule => Rule.required().min(0),
    }),
    defineField({
      name: 'maxStudentsPerHour',
      title: 'Max Students at Once',
      type: 'number',
      description: 'Bookings that need accommodations always take the whole room (1 student).',
      initialValue: 4,
      validation: Rule => Rule.required().integer().min(1),
    }),
    defineField({
      name: 'minDaysNotice',
      title: 'Minimum Days Notice',
      type: 'number',
      initialValue: 7,
      validation: Rule => Rule.required().integer().min(0),
    }),
    defineField({
      name: 'maxDaysAhead',
      title: 'How Far Ahead Students Can Book (days)',
      type: 'number',
      initialValue: 90,
      validation: Rule => Rule.required().integer().min(1),
    }),
    defineField({
      name: 'weeklyHours',
      title: 'Weekly Hours',
      type: 'array',
      description: 'Days not listed here are closed. Times are on the hour, 24-hour clock (e.g. 08:00, 16:00). Exams must finish by the closing time.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'dayHours',
          fields: [
            defineField({
              name: 'day',
              title: 'Day',
              type: 'string',
              options: { list: DAYS },
              validation: Rule => Rule.required(),
            }),
            defineField({
              name: 'open',
              title: 'Opens',
              type: 'string',
              placeholder: '08:00',
              validation: Rule => Rule.required().regex(TIME_PATTERN, { name: 'HH:00' }),
            }),
            defineField({
              name: 'close',
              title: 'Closes',
              type: 'string',
              placeholder: '16:00',
              validation: Rule => Rule.required().regex(TIME_PATTERN, { name: 'HH:00' }),
            }),
          ],
          preview: {
            select: { day: 'day', open: 'open', close: 'close' },
            prepare({ day, open, close }) {
              const title = DAYS.find(d => d.value === day)?.title ?? day
              return { title, subtitle: `${open ?? '?'} – ${close ?? '?'}` }
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'closedDates',
      title: 'Closed Dates',
      type: 'array',
      description: 'Holidays and other days with no invigilation.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'closedDate',
          fields: [
            defineField({ name: 'date', title: 'Date', type: 'date', validation: Rule => Rule.required() }),
            defineField({ name: 'reason', title: 'Reason', type: 'string' }),
          ],
          preview: {
            select: { date: 'date', reason: 'reason' },
            prepare({ date, reason }) {
              return { title: date, subtitle: reason }
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Exam Invigilation Settings' }
    },
  },
})
