import { defineField, defineType } from 'sanity'

// One inquiry from the /tutoring page. Staff review it, match a tutor, agree a
// time with the person, then send a payment request from the WDA Hub.
export default defineType({
  name: 'tutoringInquiry',
  title: 'Tutoring / Coaching Inquiry',
  type: 'document',
  fields: [
    defineField({
      name: 'service',
      title: 'Service',
      type: 'string',
      options: {
        list: [
          { title: 'Tutoring for Dental Assisting Studies', value: 'tutoring' },
          { title: 'Coaching for New Dental Assisting Graduates', value: 'coaching' },
        ],
        layout: 'radio',
      },
      validation: Rule => Rule.required(),
    }),
    defineField({ name: 'firstName', title: 'First Name', type: 'string', validation: Rule => Rule.required() }),
    defineField({ name: 'lastName', title: 'Last Name', type: 'string', validation: Rule => Rule.required() }),
    defineField({ name: 'email', title: 'Email', type: 'string', validation: Rule => Rule.required().email() }),
    defineField({ name: 'phone', title: 'Phone', type: 'string' }),
    defineField({ name: 'school', title: 'School / Where They Trained', type: 'string' }),
    defineField({ name: 'stage', title: 'Current Stage', type: 'string', description: 'e.g. term 2, graduated June 2026' }),
    defineField({ name: 'areas', title: 'Areas They Want Help With', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'details', title: 'In Their Words', type: 'text', rows: 5 }),
    defineField({
      name: 'format',
      title: 'Preferred Format',
      type: 'string',
      options: { list: ['online', 'in-person', 'either'], layout: 'radio' },
    }),
    defineField({ name: 'availability', title: 'Availability', type: 'text', rows: 3 }),
    defineField({ name: 'submittedAt', title: 'Submitted At', type: 'datetime' }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'New', value: 'new' },
          { title: 'Contacted', value: 'contacted' },
          { title: 'Payment requested', value: 'payment-requested' },
          { title: 'Paid', value: 'paid' },
          { title: 'Closed', value: 'closed' },
        ],
        layout: 'radio',
      },
      initialValue: 'new',
    }),
    defineField({ name: 'assignedTo', title: 'Tutor / Coach', type: 'string' }),
    defineField({ name: 'staffNotes', title: 'Staff Notes', type: 'text', rows: 4 }),

    // ── Payment request (set from the WDA Hub) ──
    defineField({ name: 'hours', title: 'Hours Booked', type: 'number' }),
    defineField({ name: 'amount', title: 'Amount (CAD)', type: 'number' }),
    defineField({ name: 'sessionDetails', title: 'Session Details', type: 'text', rows: 3, description: 'Dates, times and format, shown to the person on the payment page' }),
    defineField({ name: 'payToken', title: 'Payment Link Token', type: 'string', readOnly: true }),
    defineField({ name: 'paymentRequestedAt', title: 'Payment Requested At', type: 'datetime', readOnly: true }),
    defineField({ name: 'paymentRequestedBy', title: 'Payment Requested By', type: 'string', readOnly: true }),
    defineField({ name: 'checkoutSessionId', title: 'Checkout Session ID', type: 'string', readOnly: true }),
    defineField({ name: 'paymentProvider', title: 'Payment Provider', type: 'string', readOnly: true }),
    defineField({ name: 'paymentRef', title: 'Payment Reference', type: 'string', readOnly: true }),
    defineField({ name: 'paidAt', title: 'Paid At', type: 'datetime', readOnly: true }),
  ],
  orderings: [
    { title: 'Newest first', name: 'submittedDesc', by: [{ field: 'submittedAt', direction: 'desc' }] },
  ],
  preview: {
    select: { first: 'firstName', last: 'lastName', service: 'service', status: 'status' },
    prepare: ({ first, last, service, status }) => ({
      title: `${first ?? ''} ${last ?? ''}`.trim() || 'Inquiry',
      subtitle: `${service === 'coaching' ? 'Coaching' : 'Tutoring'} · ${status ?? 'new'}`,
    }),
  },
})
