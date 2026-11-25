import { defineArrayMember, defineField, defineType } from 'sanity'

// A staff member's signed acknowledgement of one version of a policy.
// Created by /api/staff/policies/acknowledge. Treat as a permanent record: don't edit by hand.
export default defineType({
  name: 'policyAcknowledgement',
  title: 'Policy Acknowledgement',
  type: 'document',
  readOnly: true,
  fields: [
    defineField({ name: 'policy', title: 'Policy', type: 'reference', weak: true, to: [{ type: 'policy' }] }),
    defineField({ name: 'policyTitle', title: 'Policy Title (at signing)', type: 'string' }),
    defineField({ name: 'policyVersion', title: 'Policy Version', type: 'string' }),
    defineField({ name: 'policyRevision', title: 'Policy Revision ID', type: 'string', description: 'Sanity revision of the policy text that was signed' }),
    defineField({ name: 'staffMember', title: 'Staff Member', type: 'reference', weak: true, to: [{ type: 'staffMember' }] }),
    defineField({ name: 'staffName', title: 'Staff Name', type: 'string' }),
    defineField({ name: 'staffEmail', title: 'Staff Email', type: 'string' }),
    defineField({ name: 'jobTitle', title: 'Position', type: 'string' }),
    defineField({ name: 'signedName', title: 'Typed Signature', type: 'string' }),
    defineField({ name: 'attestation', title: 'Statement Agreed To', type: 'text', rows: 2 }),
    defineField({ name: 'acknowledgedAt', title: 'Signed At', type: 'datetime' }),
    defineField({
      name: 'responses',
      title: 'Declaration Answers',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'policyResponse',
          fields: [
            defineField({ name: 'question', title: 'Question', type: 'string' }),
            defineField({ name: 'answer', title: 'Answer', type: 'text', rows: 2 }),
          ],
          preview: { select: { title: 'question', subtitle: 'answer' } },
        }),
      ],
    }),
    defineField({ name: 'contentSnapshot', title: 'Policy Text Signed', type: 'text', rows: 8 }),
    defineField({ name: 'ipAddress', title: 'IP Address', type: 'string' }),
    defineField({ name: 'userAgent', title: 'Browser', type: 'string' }),
    defineField({ name: 'countersignedBy', title: 'Countersigned By', type: 'string' }),
    defineField({ name: 'countersignedAt', title: 'Countersigned At', type: 'datetime' }),
  ],
  orderings: [{ title: 'Newest first', name: 'newest', by: [{ field: 'acknowledgedAt', direction: 'desc' }] }],
  preview: {
    select: { name: 'staffName', title: 'policyTitle', version: 'policyVersion', at: 'acknowledgedAt' },
    prepare: ({ name, title, version, at }) => ({
      title: `${name ?? '?'} · ${title ?? '?'}`,
      subtitle: `v${version ?? '?'} · ${at ? new Date(at).toLocaleDateString('en-CA', { timeZone: 'America/Regina' }) : ''}`,
    }),
  },
})
