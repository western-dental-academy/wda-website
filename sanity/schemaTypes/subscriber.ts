import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'subscriber',
  title: 'Subscriber',
  type: 'document',
  fields: [
    defineField({
      name: 'email',
      title: 'Email Address',
      type: 'string',
      validation: Rule => Rule.required().email(),
    }),
    defineField({
      name: 'firstName',
      title: 'First Name',
      type: 'string',
    }),
    defineField({
      name: 'lastName',
      title: 'Last Name',
      type: 'string',
    }),
    defineField({
      name: 'subscribedAt',
      title: 'Subscribed At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'source',
      title: 'Source',
      type: 'string',
      description: 'Where they subscribed from',
      initialValue: 'website',
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
      description: 'Uncheck to unsubscribe',
    }),
    defineField({
      name: 'confirmed',
      title: 'Confirmed',
      type: 'boolean',
      description: 'Whether the subscriber confirmed via email link',
      initialValue: false,
    }),
    defineField({
      name: 'inviteToken',
      title: 'Invite Token',
      type: 'string',
      description: 'One-time token for confirming newsletter subscription via email link',
    }),
    defineField({
      name: 'inviteSentAt',
      title: 'Invite Sent At',
      type: 'datetime',
    }),
  ],
  preview: {
    select: {
      email: 'email',
      subscribedAt: 'subscribedAt',
      active: 'active',
    },
    prepare({ email, subscribedAt, active }) {
      return {
        title: email,
        subtitle: `${active ? 'Active' : 'Unsubscribed'} — ${subscribedAt ? new Date(subscribedAt).toLocaleDateString('en-CA') : ''}`,
      }
    },
  },
})