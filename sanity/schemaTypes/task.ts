import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'task',
  title: 'Task',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'assignedTo',
      title: 'Assigned To',
      type: 'string',
      description: 'Email of the staff member this task is assigned to',
    }),
    defineField({
      name: 'assignedBy',
      title: 'Assigned By',
      type: 'string',
      description: 'Email of the staff member who created this task',
    }),
    defineField({
      name: 'dueDate',
      title: 'Due Date',
      type: 'date',
    }),
    defineField({
      name: 'priority',
      title: 'Priority',
      type: 'string',
      options: {
        list: [
          { title: 'Low', value: 'Low' },
          { title: 'Medium', value: 'Medium' },
          { title: 'High', value: 'High' },
          { title: 'Urgent', value: 'Urgent' },
        ],
        layout: 'radio',
      },
      initialValue: 'Medium',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'To Do', value: 'To Do' },
          { title: 'In Progress', value: 'In Progress' },
          { title: 'Complete', value: 'Complete' },
        ],
        layout: 'radio',
      },
      initialValue: 'To Do',
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'completedAt',
      title: 'Completed At',
      type: 'datetime',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      status: 'status',
      priority: 'priority',
      assignedTo: 'assignedTo',
    },
    prepare({ title, status, priority, assignedTo }) {
      return {
        title,
        subtitle: `${priority ?? 'Medium'} · ${status ?? 'To Do'}${assignedTo ? ` → ${assignedTo}` : ''}`,
      }
    },
  },
  orderings: [
    {
      title: 'Due Date (Soonest First)',
      name: 'dueDateAsc',
      by: [{ field: 'dueDate', direction: 'asc' }],
    },
    {
      title: 'Priority (Highest First)',
      name: 'createdAtDesc',
      by: [{ field: 'createdAt', direction: 'desc' }],
    },
  ],
})
