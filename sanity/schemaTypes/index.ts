import { type SchemaTypeDefinition } from "sanity";
import { programType } from "./program";
import { teamMemberType } from "./teamMember";
import { testimonialType } from "./testimonial";
import { blogPostType } from "./blogPost";
import { faqItemType } from "./faqItem";
import student from "./student";
import subscriber from './subscriber'
import announcement from './announcement'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [programType, teamMemberType, testimonialType, blogPostType, faqItemType, student, subscriber, announcement],
}