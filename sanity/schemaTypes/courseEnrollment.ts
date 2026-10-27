import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'courseEnrollment',
  title: 'Course Enrollment',
  type: 'document',
  fields: [
    defineField({
      name: 'student',
      title: 'Student',
      type: 'object',
      fields: [
        defineField({ name: 'firstName',    title: 'First Name',    type: 'string' }),
        defineField({ name: 'lastName',     title: 'Last Name',     type: 'string' }),
        defineField({ name: 'email',        title: 'Email',         type: 'string' }),
        defineField({ name: 'phone',        title: 'Phone',         type: 'string' }),
        defineField({ name: 'clerkUserId',  title: 'Clerk User ID', type: 'string' }),
      ],
    }),
    defineField({
      name: 'course',
      title: 'Course',
      type: 'reference',
      to: [{ type: 'onlineCourse' }],
    }),
    defineField({
      name: 'courseName',
      title: 'Course Name (frozen at checkout)',
      type: 'string',
    }),
    defineField({
      name: 'moodleUserId',
      title: 'Moodle User ID',
      type: 'number',
    }),
    defineField({
      name: 'stripeSessionId',
      title: 'Stripe Session ID',
      type: 'string',
    }),
    defineField({
      name: 'stripePaymentStatus',
      title: 'Stripe Payment Status',
      type: 'string',
    }),
    defineField({
      name: 'enrolledAt',
      title: 'Enrolled At',
      type: 'datetime',
    }),
    defineField({
      name: 'accessGrantedAt',
      title: 'Access Granted At',
      type: 'datetime',
    }),
    defineField({
      name: 'accessExpiresAt',
      title: 'Access Expires At',
      type: 'datetime',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Active',    value: 'active' },
          { title: 'Extended',  value: 'extended' },
          { title: 'Expired',   value: 'expired' },
          { title: 'Suspended', value: 'suspended' },
          { title: 'Completed', value: 'completed' },
        ],
        layout: 'radio',
      },
      initialValue: 'active',
    }),
    defineField({
      name: 'completedAt',
      title: 'Completed At',
      type: 'datetime',
    }),
    defineField({
      name: 'certificateSent',
      title: 'Completion Certificate Sent',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'lastReminderSentAt',
      title: 'Last Expiry Reminder Sent At',
      type: 'datetime',
    }),
    defineField({
      name: 'extensionStripeSessionId',
      title: 'Extension Stripe Session ID (last extension)',
      type: 'string',
    }),
    defineField({
      name: 'midpointReminderSentAt',
      title: 'Midpoint Reminder Sent At',
      type: 'datetime',
      description: 'When the halfway reminder email was sent',
    }),
    defineField({
      name: 'feedbackToken',
      title: 'Feedback Token',
      type: 'string',
      description: 'Unique token for the course feedback form URL',
    }),
    defineField({
      name: 'feedbackRating',
      title: 'Feedback Rating',
      type: 'number',
      description: '1-5 star rating',
    }),
    defineField({
      name: 'feedbackEnjoyedMost',
      title: 'What They Enjoyed Most',
      type: 'text',
    }),
    defineField({
      name: 'feedbackImprovement',
      title: 'What Could Be Improved',
      type: 'text',
    }),
    defineField({
      name: 'feedbackWouldRecommend',
      title: 'Would Recommend',
      type: 'boolean',
    }),
    defineField({
      name: 'feedbackShareConsent',
      title: 'Consents to Share Feedback',
      type: 'boolean',
    }),
    defineField({
      name: 'feedbackSubmittedAt',
      title: 'Feedback Submitted At',
      type: 'datetime',
    }),
    defineField({
      name: 'office',
      title: 'Dental Office',
      type: 'reference',
      to: [{ type: 'dentalOffice' }],
      description: 'Office the registrant works at (picked on the form or matched by staff in the WDA Hub)',
    }),
    defineField({
      name: 'officeOther',
      title: 'Office (typed by registrant)',
      type: 'string',
      description: 'What the registrant typed when their office was not in the list',
    }),
    defineField({
      name: 'officeSource',
      title: 'Office Source',
      type: 'string',
      options: {
        list: [
          { title: 'Picked by registrant', value: 'self-reported' },
          { title: 'Suggested match confirmed by staff', value: 'matched' },
          { title: 'Assigned by staff', value: 'manual' },
          { title: 'Not from a listed office', value: 'none' },
        ],
      },
    }),
    defineField({
      name: 'officeAssignedBy',
      title: 'Office Assigned By',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'referredByFirstName',
      title: 'Referred By (First Name)',
      type: 'string',
      description: 'First name of the person who referred this registrant (refer-a-friend reward)',
    }),
    defineField({
      name: 'referredByLastName',
      title: 'Referred By (Last Name)',
      type: 'string',
    }),
    defineField({
      name: 'referredByEmail',
      title: 'Referred By (Email)',
      type: 'string',
      description: 'When given, the referrer is emailed a 25% off referral code automatically after payment',
    }),
    defineField({
      name: 'referralRewardSent',
      title: 'Referral Reward Sent',
      type: 'boolean',
      initialValue: false,
      description: 'Set automatically when the referral code is emailed; tick by hand if you sent one from the WDA Hub',
    }),
    defineField({
      name: 'referralRewardCode',
      title: 'Referral Reward Code',
      type: 'string',
      readOnly: true,
      description: 'The 25% code emailed to the referrer for this registration',
    }),
  ],
  preview: {
    select: {
      firstName:  'student.firstName',
      lastName:   'student.lastName',
      courseName: 'courseName',
      status:     'status',
    },
    prepare({ firstName, lastName, courseName, status }) {
      return {
        title:    `${firstName ?? ''} ${lastName ?? ''}`.trim() || 'Unknown Student',
        subtitle: `${courseName ?? 'Unknown Course'} · ${status ?? 'unknown'}`,
      }
    },
  },
})
