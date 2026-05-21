import { defineField, defineType } from "sanity";

export const testimonialType = defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  fields: [
    defineField({
      name: "quote",
      type: "text",
      rows: 3,
      validation: (r) => r.required().min(20),
    }),
    defineField({
      name: "author",
      title: "Graduate Name",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "program",
      title: "Program Name",
      type: "string",
      description: 'e.g. "Dental Assisting Certificate"',
    }),
    defineField({
      name: "graduationYear",
      title: "Graduation Year",
      type: "string",
      description: 'e.g. "2024"',
    }),
    defineField({
      name: "isActive",
      title: "Active",
      type: "boolean",
      initialValue: true,
      description: "Uncheck to hide this testimonial from the website",
    }),
  ],
  preview: {
    select: {
      title: "author",
      subtitle: "program",
    },
  },
  orderings: [
    {
      title: "Graduation Year (newest first)",
      name: "graduationYearDesc",
      by: [{ field: "graduationYear", direction: "desc" }],
    },
  ],
});
