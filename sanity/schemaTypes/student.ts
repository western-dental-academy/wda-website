import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'student',
  title: 'Student',
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
      title: 'Phone Number',
      type: 'string',
    }),
    defineField({
      name: 'status',
      title: 'Application Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending Review', value: 'pending' },
          { title: 'Accepted', value: 'accepted' },
          { title: 'Rejected', value: 'rejected' },
          { title: 'Enrolled', value: 'enrolled' },
          { title: 'Withdrawn', value: 'withdrawn' },
        ],
        layout: 'radio',
      },
      initialValue: 'pending',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'program',
      title: 'Program',
      type: 'reference',
      to: [{ type: 'program' }],
    }),
    defineField({
      name: 'moodleUserId',
      title: 'Moodle User ID',
      type: 'number',
      description: 'Auto-populated when student is accepted and provisioned in Moodle',
      readOnly: true,
    }),
    defineField({
      name: 'clerkUserId',
      title: 'Clerk User ID',
      type: 'string',
      description: 'Auto-populated when Clerk account is created',
      readOnly: true,
    }),
    defineField({
  name: 'stripePaymentIntentId',
  title: 'Stripe Payment Intent ID',
  type: 'string',
  description: 'Auto-populated when payment is initiated',
  readOnly: true,
}),
defineField({
  name: 'paymentStatus',
  title: 'Payment Status',
  type: 'string',
  options: {
    list: [
      { title: 'Unpaid', value: 'unpaid' },
      { title: 'Pending', value: 'pending' },
      { title: 'Paid', value: 'paid' },
      { title: 'Refunded', value: 'refunded' },
    ],
    layout: 'radio',
  },
  initialValue: 'unpaid',
}),
defineField({
  name: 'tuitionAmount',
  title: 'Tuition Amount (CAD)',
  type: 'number',
  description: 'Amount in dollars',
}),
    defineField({
      name: 'applicationDate',
      title: 'Application Date',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'acceptedDate',
      title: 'Accepted Date',
      type: 'datetime',
    }),
    defineField({
  name: 'certificateId',
  title: 'Certificate ID',
  type: 'string',
  description: 'Auto-generated unique certificate verification code',
  readOnly: true,
}),
defineField({
  name: 'certificateIssuedDate',
  title: 'Certificate Issued Date',
  type: 'datetime',
  readOnly: true,
}),
    defineField({
      name: 'notes',
      title: 'Internal Notes',
      type: 'text',
      description: 'Staff notes — not visible to student',
    }),
  ],
  preview: {
    select: {
      firstName: 'firstName',
      lastName: 'lastName',
      status: 'status',
      email: 'email',
    },
    prepare({ firstName, lastName, status, email }) {
      return {
        title: `${firstName ?? ''} ${lastName ?? ''}`.trim(),
        subtitle: `${status?.toUpperCase()} — ${email}`,
      }
    },
  },
})