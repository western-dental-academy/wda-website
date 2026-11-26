import { defineField, defineType } from 'sanity'

// One document per Clover Hosted Checkout. Holds the order details that
// Stripe used to keep in session metadata, and is marked paid by the Clover
// webhook. Written by the website only.
export default defineType({
  name: 'paymentCheckout',
  title: 'Online Payment (Clover)',
  type: 'document',
  readOnly: true,
  fields: [
    defineField({ name: 'provider', title: 'Provider', type: 'string' }),
    defineField({
      name: 'flow',
      title: 'Payment for',
      type: 'string',
      options: {
        list: [
          { title: 'Workshop registration', value: 'workshops' },
          { title: 'Workshop registration (portal)', value: 'workshop-legacy' },
          { title: 'Online course', value: 'course' },
          { title: 'Course access extension', value: 'course-extension' },
          { title: 'Gift certificate', value: 'gift-certificate' },
          { title: 'Exam invigilation', value: 'invigilation' },
          { title: 'Tuition', value: 'tuition' },
          { title: 'Tutoring / coaching', value: 'tutoring' },
        ],
      },
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: { list: ['pending', 'paid', 'declined', 'failed'] },
    }),
    defineField({ name: 'description', title: 'Items', type: 'string' }),
    defineField({ name: 'amountTotalCents', title: 'Total (cents)', type: 'number' }),
    defineField({ name: 'customerEmail', title: 'Customer Email', type: 'string' }),
    defineField({ name: 'cloverCheckoutSessionId', title: 'Clover Checkout Session ID', type: 'string' }),
    defineField({ name: 'cloverPaymentId', title: 'Clover Payment ID', type: 'string' }),
    defineField({ name: 'metadataJson', title: 'Order details (JSON)', type: 'text' }),
    defineField({ name: 'createdAt', title: 'Created', type: 'datetime' }),
    defineField({ name: 'paidAt', title: 'Paid', type: 'datetime' }),
    defineField({ name: 'lastWebhookMessage', title: 'Last Clover message', type: 'string' }),
    defineField({ name: 'fulfilmentClaimedAt', title: 'Fulfilment started', type: 'datetime' }),
    defineField({ name: 'fulfilledAt', title: 'Fulfilled', type: 'datetime' }),
    defineField({ name: 'error', title: 'Error', type: 'text' }),
  ],
  preview: {
    select: { title: 'description', status: 'status', email: 'customerEmail', cents: 'amountTotalCents' },
    prepare: ({ title, status, email, cents }) => ({
      title: title ?? 'Online payment',
      subtitle: `${status ?? ''} · $${((cents ?? 0) / 100).toFixed(2)} · ${email ?? ''}`,
    }),
  },
  orderings: [{ title: 'Newest', name: 'createdDesc', by: [{ field: 'createdAt', direction: 'desc' }] }],
})
