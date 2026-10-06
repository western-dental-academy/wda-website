import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'invigilationBooking',
  title: 'Invigilation Booking',
  type: 'document',
  fields: [
    defineField({ name: 'firstName', title: 'First Name', type: 'string', validation: Rule => Rule.required() }),
    defineField({ name: 'lastName', title: 'Last Name', type: 'string', validation: Rule => Rule.required() }),
    defineField({ name: 'email', title: 'Email', type: 'string', validation: Rule => Rule.required().email() }),
    defineField({ name: 'phone', title: 'Phone', type: 'string' }),
    defineField({
      name: 'date',
      title: 'Exam Date',
      type: 'date',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'startTime',
      title: 'Start Time',
      type: 'string',
      description: '24-hour clock, Edmonton time (e.g. 13:00)',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'durationHours',
      title: 'Length (hours)',
      type: 'number',
      options: { list: [1, 2], layout: 'radio' },
      validation: Rule => Rule.required(),
    }),
    defineField({ name: 'institution', title: 'Institution / Exam Provider', type: 'string' }),
    defineField({ name: 'examName', title: 'Exam / Course Name', type: 'string' }),
    defineField({
      name: 'examFormat',
      title: 'Exam Format',
      type: 'string',
      options: {
        list: [
          { title: 'Computer-based', value: 'computer' },
          { title: 'Paper', value: 'paper' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'accommodations',
      title: 'Accommodations',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Quiet room', value: 'quiet-room' },
          { title: 'Noise-cancelling headphones', value: 'headphones' },
          { title: 'Extra time', value: 'extra-time' },
          { title: 'Verbal exam reader', value: 'verbal-reader' },
          { title: 'Other', value: 'other' },
        ],
      },
      description: 'Any accommodation means the student writes alone in the room.',
    }),
    defineField({ name: 'accommodationNotes', title: 'Accommodation Details', type: 'text', rows: 3 }),
    defineField({ name: 'instructorName', title: 'Instructor / Exam Centre Contact', type: 'string' }),
    defineField({ name: 'instructorEmail', title: 'Instructor Email', type: 'string' }),
    defineField({ name: 'instructorPhone', title: 'Instructor Phone', type: 'string' }),
    defineField({ name: 'notes', title: 'Other Notes', type: 'text', rows: 3 }),
    defineField({ name: 'price', title: 'Price (CAD, before processing fee)', type: 'number', readOnly: true }),
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
      name: 'status',
      title: 'Booking Status',
      type: 'string',
      options: {
        list: [
          { title: 'Booked', value: 'booked' },
          { title: 'Exam materials received', value: 'materials-received' },
          { title: 'Completed', value: 'completed' },
          { title: 'Cancelled', value: 'cancelled' },
          { title: 'No-show', value: 'no-show' },
        ],
      },
      description: 'Cancelled bookings free up their seat.',
      initialValue: 'booked',
    }),
    defineField({ name: 'stripeSessionId', title: 'Stripe Session ID', type: 'string', readOnly: true }),
    defineField({ name: 'stripePaymentIntentId', title: 'Stripe Payment Intent ID', type: 'string', readOnly: true }),
    defineField({
      name: 'bookedAt',
      title: 'Booked At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  orderings: [
    {
      title: 'Exam date',
      name: 'examDateAsc',
      by: [{ field: 'date', direction: 'asc' }, { field: 'startTime', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      firstName: 'firstName',
      lastName: 'lastName',
      date: 'date',
      startTime: 'startTime',
      durationHours: 'durationHours',
      payment: 'stripePaymentStatus',
      status: 'status',
    },
    prepare({ firstName, lastName, date, startTime, durationHours, payment, status }) {
      return {
        title: `${firstName ?? ''} ${lastName ?? ''}`.trim(),
        subtitle: `${date ?? ''} ${startTime ?? ''} (${durationHours ?? '?'}h) — ${(payment ?? 'unpaid').toUpperCase()}${status && status !== 'booked' ? ` · ${status}` : ''}`,
      }
    },
  },
})
