import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'timeOffRequest',
  title: 'Time-Off Request',
  type: 'document',
  fields: [
    defineField({
      name: 'staffMember',
      title: 'Staff Member',
      type: 'reference',
      to: [{ type: 'staffMember' }],
      validation: R => R.required(),
    }),
    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          { title: 'Vacation', value: 'vacation' },
          { title: 'Sick', value: 'sick' },
          { title: 'Personal', value: 'personal' },
          { title: 'Unpaid', value: 'unpaid' },
        ],
        layout: 'radio',
      },
      validation: R => R.required(),
    }),
    defineField({
      name: 'startDate',
      title: 'Start Date',
      type: 'date',
      validation: R => R.required(),
    }),
    defineField({
      name: 'endDate',
      title: 'End Date',
      type: 'date',
      validation: R => R.required(),
    }),
    defineField({
      name: 'halfDay',
      title: 'Half Day',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'reason',
      title: 'Reason',
      type: 'text',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending', value: 'pending' },
          { title: 'Approved', value: 'approved' },
          { title: 'Denied', value: 'denied' },
          { title: 'Cancelled', value: 'cancelled' },
        ],
        layout: 'radio',
      },
      initialValue: 'pending',
      validation: R => R.required(),
    }),
    defineField({
      name: 'decidedBy',
      title: 'Decided By',
      type: 'reference',
      to: [{ type: 'staffMember' }],
    }),
    defineField({
      name: 'decisionNotes',
      title: 'Decision Notes',
      type: 'text',
    }),
    defineField({
      name: 'submittedAt',
      title: 'Submitted At',
      type: 'datetime',
    }),
    defineField({
      name: 'decidedAt',
      title: 'Decided At',
      type: 'datetime',
    }),
  ],
  preview: {
    select: {
      name: 'staffMember.fullName',
      type: 'type',
      status: 'status',
      startDate: 'startDate',
      endDate: 'endDate',
    },
    prepare({ name, type, status, startDate, endDate }: { name?: string; type?: string; status?: string; startDate?: string; endDate?: string }) {
      return {
        title: name ?? 'Unknown',
        subtitle: `${(type ?? '').toUpperCase()} — ${startDate} to ${endDate} (${status})`,
      }
    },
  },
})
