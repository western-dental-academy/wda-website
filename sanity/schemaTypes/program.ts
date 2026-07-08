import { defineField, defineType } from "sanity";

export const programType = defineType({
  name: "program",
  title: "Program",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "description",
      type: "text",
      rows: 3,
      validation: (r) => r.required(),
    }),
    defineField({
      name: "duration",
      title: "Duration",
      type: "string",
      description: 'e.g. "12 Months", "8 Weeks"',
    }),
    defineField({
      name: "cost",
      title: "Cost",
      type: "string",
      description: 'e.g. "$3,500 CAD"',
    }),
    defineField({
  name: "tuitionAmount",
  title: "Tuition Amount (CAD)",
  type: "number",
  description: "Exact tuition in dollars — used for Stripe payments (e.g. 3500)",
}),
defineField({
  name: "moodleCourseId",
  title: "Moodle Course ID",
  type: "number",
  description: "The numeric ID of the corresponding Moodle course",
}),
    defineField({
      name: "image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          type: "string",
          title: "Alt text",
        }),
      ],
    }),
    defineField({
      name: "highlights",
      title: "Program Highlights",
      type: "array",
      of: [{ type: "string" }],
      description: "Short bullet points shown on the program detail page",
    }),
    defineField({
      name: "isActive",
      title: "Active",
      type: "boolean",
      initialValue: true,
      description: "Uncheck to hide this program from the website",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "duration" },
  },
  orderings: [
    {
      title: "Title",
      name: "titleAsc",
      by: [{ field: "title", direction: "asc" }],
    },
  ],
});
