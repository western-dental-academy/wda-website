import { defineField, defineType } from 'sanity'

// Dental offices visited during staff poster outreach. Registrants can pick
// their office on the registration form, and the WDA Hub Marketing tab tallies
// registrants per office and per staff member who visited it.

export const OUTREACH_STAFF = ['Alana', 'Amber', 'Collette', 'Jolene', 'Tammy', 'Lance', 'Ryan'] as const

export default defineType({
  name: 'dentalOffice',
  title: 'Dental Office',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Office Name',
      type: 'string',
      validation: R => R.required(),
    }),
    defineField({
      name: 'city',
      title: 'City',
      type: 'string',
    }),
    defineField({
      name: 'address',
      title: 'Address',
      type: 'string',
    }),
    defineField({
      name: 'phone',
      title: 'Phone',
      type: 'string',
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      description: 'Used to suggest a match when a registrant signs up with the same email domain',
    }),
    defineField({
      name: 'website',
      title: 'Website',
      type: 'string',
      description: 'Optional. The domain (e.g. smiledental.ca) also helps match registrants by email domain',
    }),
    defineField({
      name: 'visitedBy',
      title: 'Visited By',
      type: 'string',
      options: {
        list: OUTREACH_STAFF.map(s => ({ title: s, value: s })),
      },
      description: 'Staff member credited with registrants from this office',
    }),
    defineField({
      name: 'visited',
      title: 'Visited',
      type: 'boolean',
      initialValue: false,
      description: 'Only visited offices count toward the staff leaderboard',
    }),
    defineField({
      name: 'visitedAt',
      title: 'Visited On',
      type: 'date',
    }),
    defineField({
      name: 'socials',
      title: 'Socials Followed',
      type: 'string',
    }),
    defineField({
      name: 'active',
      title: 'Show on Registration Form',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'notes',
      title: 'Notes',
      type: 'text',
      rows: 3,
    }),
  ],
  orderings: [
    { title: 'Name', name: 'nameAsc', by: [{ field: 'name', direction: 'asc' }] },
    { title: 'City', name: 'cityAsc', by: [{ field: 'city', direction: 'asc' }, { field: 'name', direction: 'asc' }] },
  ],
  preview: {
    select: { name: 'name', city: 'city', visitedBy: 'visitedBy', visited: 'visited' },
    prepare({ name, city, visitedBy, visited }) {
      return {
        title: name ?? '',
        subtitle: [city, visitedBy ? `${visitedBy}${visited ? '' : ' (not visited yet)'}` : null].filter(Boolean).join(' — '),
      }
    },
  },
})
