import { type SchemaTypeDefinition } from "sanity";
import { programType } from "./program";
import { teamMemberType } from "./teamMember";
import { testimonialType } from "./testimonial";
import { blogPostType } from "./blogPost";
import { faqItemType } from "./faqItem";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [programType, teamMemberType, testimonialType, blogPostType, faqItemType],
};
