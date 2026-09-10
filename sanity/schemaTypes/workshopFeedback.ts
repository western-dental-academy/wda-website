import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'workshopFeedback',
  title: 'Workshop Feedback',
  type: 'document',
  fields: [
    defineField({ name: 'workshopDateId', type: 'string', title: 'Workshop Date ID' }),
    defineField({ name: 'workshopName',   type: 'string', title: 'Workshop Name' }),
    defineField({ name: 'rating',         type: 'number', title: 'Rating (1-5)' }),
    defineField({ name: 'enjoyedMost',    type: 'text',   title: 'Enjoyed Most' }),
    defineField({ name: 'improvement',    type: 'text',   title: 'Improvement' }),
    defineField({ name: 'wouldRecommend', type: 'boolean', title: 'Would Recommend' }),
    defineField({ name: 'submittedAt',    type: 'datetime', title: 'Submitted At' }),
    defineField({
      name: 'feedbackShareConsent',
      title: 'Consents to Share Feedback',
      type: 'boolean',
      description: 'Whether the respondent consents to their feedback being shared on website/socials',
    }),
  ],
  preview: {
    select: { workshopName: 'workshopName', rating: 'rating', submittedAt: 'submittedAt' },
    prepare({ workshopName, rating, submittedAt }) {
      const date = submittedAt
        ? new Date(submittedAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })
        : ''
      return {
        title: workshopName ?? 'Workshop Feedback',
        subtitle: `★ ${rating ?? '–'} — ${date}`,
      }
    },
  },
})
