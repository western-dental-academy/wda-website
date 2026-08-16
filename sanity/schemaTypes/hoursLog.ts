import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'hoursLog',
  title: 'Hours Log',
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
      name: 'clockIn',
      title: 'Clock In',
      type: 'datetime',
      validation: R => R.required(),
    }),
    defineField({
      name: 'clockOut',
      title: 'Clock Out',
      type: 'datetime',
    }),
    defineField({
      name: 'manuallyEdited',
      title: 'Manually Edited',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'editReason',
      title: 'Edit Reason',
      type: 'string',
    }),
    defineField({
      name: 'notes',
      title: 'Notes',
      type: 'text',
    }),
  ],
  preview: {
    select: {
      name: 'staffMember.fullName',
      clockIn: 'clockIn',
      clockOut: 'clockOut',
    },
    prepare({ name, clockIn, clockOut }: { name?: string; clockIn?: string; clockOut?: string }) {
      const date = clockIn ? new Date(clockIn).toLocaleDateString('en-CA') : '—'
      const status = clockOut ? 'Complete' : '● Active'
      return {
        title: name ?? 'Unknown',
        subtitle: `${date} — ${status}`,
      }
    },
  },
})
