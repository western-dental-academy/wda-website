import { defineArrayMember, defineField, defineType } from 'sanity'

// Saved giveaway draws, managed from WDA Hub > Marketing > Giveaway Draw
export default defineType({
  name: 'giveawayDraw',
  title: 'Giveaway Draw',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Draw Name', type: 'string' }),
    defineField({
      name: 'platform',
      title: 'Platform Rules',
      type: 'string',
      options: { list: [{ title: 'Instagram (every 3 friends tagged = 1 entry)', value: 'ig' }, { title: 'Facebook (any comment counts)', value: 'fb' }] },
    }),
    defineField({ name: 'entriesText', title: 'Comments (username, comment)', type: 'text', rows: 12 }),
    defineField({ name: 'maxEntries', title: 'Max Entries per Person', type: 'number' }),
    defineField({ name: 'exclude', title: 'Excluded Accounts', type: 'string' }),
    defineField({ name: 'removed', title: 'Removed from Draw', type: 'array', of: [defineArrayMember({ type: 'string' })] }),
    defineField({
      name: 'draws',
      title: 'Winners Drawn',
      type: 'array',
      of: [defineArrayMember({
        type: 'object',
        fields: [
          defineField({ name: 'at', title: 'Drawn At', type: 'string' }),
          defineField({ name: 'name', title: 'Winner', type: 'string' }),
          defineField({ name: 'ball', title: 'Ball #', type: 'number' }),
          defineField({ name: 'of', title: 'Balls in Machine', type: 'number' }),
          defineField({ name: 'drawnBy', title: 'Drawn By', type: 'string' }),
        ],
        preview: { select: { title: 'name', subtitle: 'at' } },
      })],
    }),
    defineField({ name: 'createdBy', title: 'Created By', type: 'string' }),
  ],
  preview: { select: { title: 'title', subtitle: 'platform' } },
})
