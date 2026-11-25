import { defineArrayMember, defineField, defineType } from 'sanity'

// Staff policy that every assigned staff member must read and sign on /staff/policies.
// Changing the Version asks everyone to sign again, and the daily policy email
// (/api/cron/policy-reminders) tells staff about any new policy or new version.
export default defineType({
  name: 'policy',
  title: 'Staff Policy',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: R => R.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: R => R.required(),
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      description: 'Only active policies are shown to staff and included in emails. Leave off while drafting.',
      initialValue: false,
    }),
    defineField({
      name: 'version',
      title: 'Version',
      type: 'string',
      description: 'e.g. 1.0. Change this when the policy changes in a way staff must re-sign. Fixing a typo? Leave it alone.',
      initialValue: '1.0',
      validation: R => R.required(),
    }),
    defineField({
      name: 'effectiveDate',
      title: 'Effective Date',
      type: 'date',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Governance', value: 'governance' },
          { title: 'Privacy & Confidentiality', value: 'privacy' },
          { title: 'Conflict of Interest', value: 'conflict' },
          { title: 'Health & Safety', value: 'safety' },
          { title: 'HR & Conduct', value: 'hr' },
          { title: 'Other', value: 'other' },
        ],
      },
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 2,
      description: 'One or two sentences shown in the policy list and the email.',
    }),
    defineField({
      name: 'body',
      title: 'Policy Text',
      type: 'array',
      of: [defineArrayMember({ type: 'block' })],
      validation: R => R.required(),
    }),
    defineField({
      name: 'attestation',
      title: 'Attestation Statement',
      type: 'text',
      rows: 2,
      description: 'What staff tick to agree. Leave blank for the default.',
      placeholder: 'I confirm that I have read, understood, and agree to comply with this policy.',
    }),
    defineField({
      name: 'questions',
      title: 'Declaration Questions',
      type: 'array',
      description: 'Optional questions staff answer when they sign (e.g. NDAEB affiliation). Answers are saved with the signature.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'policyQuestion',
          fields: [
            defineField({ name: 'question', title: 'Question', type: 'string', validation: R => R.required() }),
            defineField({
              name: 'kind',
              title: 'Answer Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Pick one option', value: 'choice' },
                  { title: 'Written answer', value: 'text' },
                ],
                layout: 'radio',
              },
              initialValue: 'choice',
            }),
            defineField({
              name: 'options',
              title: 'Options',
              type: 'array',
              of: [{ type: 'string' }],
              hidden: ({ parent }) => parent?.kind !== 'choice',
            }),
            defineField({ name: 'required', title: 'Required', type: 'boolean', initialValue: true }),
          ],
          preview: { select: { title: 'question', subtitle: 'kind' } },
        }),
      ],
    }),
    defineField({
      name: 'requiresCountersign',
      title: 'Requires Management Countersignature',
      type: 'boolean',
      description: 'An owner records a countersignature on each signed copy from the Staff Policies report.',
      initialValue: false,
    }),
    defineField({
      name: 'assignedTo',
      title: 'Applies To',
      type: 'array',
      description: 'Leave empty for all active staff, or pick specific staff members.',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'staffMember' }] })],
    }),
    defineField({
      name: 'notifiedVersion',
      title: 'Staff Emailed For Version',
      type: 'string',
      readOnly: true,
      description: 'Set automatically once staff have been emailed about this version.',
    }),
  ],
  preview: {
    select: { title: 'title', version: 'version', active: 'active' },
    prepare: ({ title, version, active }) => ({
      title,
      subtitle: `v${version ?? '?'}${active ? '' : ' · inactive'}`,
    }),
  },
})
