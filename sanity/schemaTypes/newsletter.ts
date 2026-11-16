import { defineArrayMember, defineField, defineType } from 'sanity'
import { fillMonth, DEFAULT_HEADLINE, DEFAULT_PREVIEW_TEXT, DEFAULT_SUBJECT, nextFirstTuesday, SEND_TIME_OPTIONS } from '../../lib/newsletter/schedule'

// One newsletter issue. Write the intro (and optionally a tip and a spotlight),
// tick "Ready to send" and publish. The daily newsletter job sends it to every
// subscriber at the chosen date and time (Alberta time, UTC-6). Upcoming
// workshops and online courses are filled in automatically from Sanity.
export default defineType({
  name: 'newsletter',
  title: 'Newsletter',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'schedule', title: 'Schedule' },
    { name: 'delivery', title: 'Delivery (automatic)' },
  ],
  fields: [
    defineField({
      name: 'subject',
      title: 'Email subject',
      type: 'string',
      group: 'content',
      initialValue: DEFAULT_SUBJECT,
      description: '{month} turns into the month of the send date, e.g. "December". Change the wording any time.',
      validation: Rule => Rule.required().max(90),
    }),
    defineField({
      name: 'previewText',
      title: 'Preview text',
      type: 'string',
      group: 'content',
      initialValue: DEFAULT_PREVIEW_TEXT,
      description: 'The grey line shown after the subject in most inboxes. Keep it under 100 characters. {month} becomes the send month.',
      validation: Rule => Rule.max(140),
    }),
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      group: 'content',
      initialValue: DEFAULT_HEADLINE,
      description: 'Big title at the top of the email. {month} becomes the send month, e.g. "Your December update from WDA".',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'heroImage',
      title: 'Header image (optional)',
      type: 'image',
      group: 'content',
      description: 'Wide image under the headline (about 1200×600). Leave blank for no image.',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({
      name: 'intro',
      title: 'Intro message (optional)',
      type: 'array',
      group: 'content',
      description: 'Leave empty and a note is written for you: a short seasonal hello for the send month, plus a line about what is in this issue (workshops, the featured course, the tip). Write your own here any time to replace it. Use Preview email to see the automatic one.',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Heading', value: 'h3' },
          ],
          lists: [{ title: 'Bullet', value: 'bullet' }],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [{ name: 'href', type: 'url', title: 'URL', validation: Rule => Rule.uri({ scheme: ['http', 'https', 'mailto'] }) }],
              },
            ],
          },
        }),
      ],
    }),
    defineField({
      name: 'showWorkshops',
      title: 'Show upcoming workshops',
      type: 'boolean',
      group: 'content',
      initialValue: true,
      description: 'Lists every active workshop and guest speaker date in the next 60 days, with a Register button. Hidden automatically when there are none.',
    }),
    defineField({
      name: 'featuredCourse',
      title: 'Featured online course',
      type: 'reference',
      group: 'content',
      to: [{ type: 'onlineCourse' }],
      options: { filter: 'active == true' },
      description: 'Leave blank to feature the newest course automatically.',
    }),
    defineField({
      name: 'showAllCourses',
      title: 'List the other online courses',
      type: 'boolean',
      group: 'content',
      initialValue: true,
    }),
    defineField({
      name: 'tip',
      title: 'Tip of the month (optional)',
      type: 'object',
      group: 'content',
      description: 'A quick dental or IPC tip. Leave blank to skip this section.',
      fields: [
        defineField({ name: 'title', title: 'Title', type: 'string' }),
        defineField({ name: 'body', title: 'Tip', type: 'text', rows: 4 }),
      ],
    }),
    defineField({
      name: 'spotlight',
      title: 'Behind the scenes (optional)',
      type: 'object',
      group: 'content',
      description: 'A team moment, event recap or news item. Paste a social post link to fill in the photo and caption by itself, or fill the fields in by hand. Leave blank to skip this section.',
      fields: [
        defineField({
          name: 'postUrl',
          title: 'Social post link',
          type: 'url',
          description: 'Paste a link to one of our Instagram, Facebook, TikTok or LinkedIn posts (Share > Copy link). Its photo and caption fill the fields below: use "Fill from post link" in the ⋯ menu to see them now and edit the caption, or leave them empty and they fill in by themselves when the newsletter is previewed, tested or sent. Anything you type below wins.',
          validation: Rule => Rule.uri({ scheme: ['https'] }),
        }),
        defineField({ name: 'title', title: 'Title', type: 'string' }),
        defineField({ name: 'body', title: 'Text', type: 'text', rows: 4, description: 'Filled from the post caption (without hashtags) when left empty.' }),
        defineField({
          name: 'image',
          title: 'Image',
          type: 'image',
          options: { hotspot: true },
          fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
        }),
        defineField({ name: 'linkUrl', title: 'Button link', type: 'url', description: 'Defaults to the social post link.' }),
        defineField({ name: 'linkLabel', title: 'Button text', type: 'string', description: 'Defaults to e.g. "See the post on Instagram".' }),
      ],
    }),
    defineField({
      name: 'showReferral',
      title: 'Show refer-a-friend reminder',
      type: 'boolean',
      group: 'content',
      initialValue: true,
    }),

    // ── Schedule ──────────────────────────────────────────────
    defineField({
      name: 'sendDate',
      title: 'Send date',
      type: 'date',
      group: 'schedule',
      initialValue: () => nextFirstTuesday(),
      description: 'Defaults to the first Tuesday of next month.',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'sendTime',
      title: 'Send time (Alberta time)',
      type: 'string',
      group: 'schedule',
      initialValue: '10:00',
      options: { list: SEND_TIME_OPTIONS },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'readyToSend',
      title: 'Ready to send',
      type: 'boolean',
      group: 'schedule',
      initialValue: false,
      description: 'Nothing goes out until this is ticked and the issue is published. Untick it to hold an issue back. Changes made less than a day before the send time may not make it in, because the issue is queued at 9 AM the day before at the latest.',
    }),

    // ── Delivery (written by the website) ─────────────────────
    defineField({
      name: 'deliveryStatus',
      title: 'Status',
      type: 'string',
      group: 'delivery',
      readOnly: true,
      options: {
        list: [
          { title: 'Queued with the email service', value: 'scheduled' },
          { title: 'Sent', value: 'sent' },
          { title: 'Partly sent (see error)', value: 'partial' },
        ],
      },
    }),
    defineField({ name: 'scheduledFor', title: 'Goes out at', type: 'datetime', group: 'delivery', readOnly: true }),
    defineField({ name: 'recipientCount', title: 'Recipients', type: 'number', group: 'delivery', readOnly: true }),
    defineField({ name: 'queuedAt', title: 'Queued at', type: 'datetime', group: 'delivery', readOnly: true }),
    defineField({
      name: 'sentTo',
      title: 'Sent to',
      type: 'array',
      group: 'delivery',
      readOnly: true,
      of: [defineArrayMember({ type: 'string' })],
      description: 'Every address this issue was handed to, so nobody gets it twice.',
    }),
    defineField({ name: 'lastError', title: 'Last error', type: 'text', rows: 3, group: 'delivery', readOnly: true }),
    defineField({ name: 'testSentAt', title: 'Last test sent', type: 'datetime', group: 'delivery', readOnly: true }),
  ],
  orderings: [
    { title: 'Send date, newest first', name: 'sendDateDesc', by: [{ field: 'sendDate', direction: 'desc' }] },
  ],
  preview: {
    select: { subject: 'subject', sendDate: 'sendDate', sendTime: 'sendTime', ready: 'readyToSend', status: 'deliveryStatus' },
    prepare({ subject, sendDate, sendTime, ready, status }) {
      subject = typeof subject === 'string' ? fillMonth(subject, sendDate) : subject
      const state = status === 'sent' ? 'Sent' : status === 'scheduled' ? 'Queued' : status === 'partial' ? 'Partly sent' : ready ? 'Ready' : 'Draft'
      return {
        title: subject ?? 'Untitled newsletter',
        subtitle: `${state} · ${sendDate ?? 'no date'} ${sendTime ?? ''}`,
      }
    },
  },
})
