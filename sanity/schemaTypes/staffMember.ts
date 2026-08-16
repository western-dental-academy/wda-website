import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'staffMember',
  title: 'Staff Member',
  type: 'document',
  fields: [
    defineField({
      name: 'fullName',
      title: 'Full Name',
      type: 'string',
      validation: R => R.required(),
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: R => R.required().email(),
    }),
    defineField({
      name: 'clerkUserId',
      title: 'Clerk User ID',
      type: 'string',
      description: 'Found in Clerk dashboard — paste exactly as shown',
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      options: {
        list: [
          { title: 'Staff', value: 'staff' },
          { title: 'Owner', value: 'owner' },
        ],
        layout: 'radio',
      },
      initialValue: 'staff',
      validation: R => R.required(),
    }),
    defineField({
      name: 'vacationDaysPerYear',
      title: 'Vacation Days Per Year',
      type: 'number',
      initialValue: 10,
    }),
    defineField({
      name: 'sickDaysPerYear',
      title: 'Sick Days Per Year',
      type: 'number',
      initialValue: 5,
    }),
    defineField({
      name: 'startDate',
      title: 'Start Date',
      type: 'date',
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'fullName',
      subtitle: 'role',
      active: 'active',
    },
    prepare({ title, subtitle, active }: { title?: string; subtitle?: string; active?: boolean }) {
      return {
        title: title ?? 'Unnamed',
        subtitle: `${(subtitle ?? '').toUpperCase()}${active === false ? ' — INACTIVE' : ''}`,
      }
    },
  },
})
