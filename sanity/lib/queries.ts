import { groq } from "next-sanity";

export const PROGRAMS_QUERY = groq`
  *[_type == "program" && isActive != false] | order(_createdAt asc) {
    _id,
    title,
    slug,
    description,
    duration,
    cost
  }
`;

export const PROGRAM_BY_SLUG_QUERY = groq`
  *[_type == "program" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    description,
    duration,
    cost,
    image { asset, alt },
    highlights
  }
`;

export const TEAM_MEMBERS_QUERY = groq`
  *[_type == "teamMember"] | order(order asc, name asc) {
    _id,
    name,
    role,
    bio,
    photo { asset, alt },
    order
  }
`;

export const TESTIMONIALS_QUERY = groq`
  *[_type == "testimonial" && isActive != false] | order(graduationYear desc) {
    _id,
    quote,
    author,
    program,
    graduationYear
  }
`;

export const BLOG_POSTS_QUERY = groq`
  *[_type == "blogPost" && defined(publishedAt)] | order(publishedAt desc) {
    _id,
    title,
    slug,
    publishedAt,
    author,
    mainImage { asset, alt },
    excerpt
  }
`;

export const BLOG_POST_BY_SLUG_QUERY = groq`
  *[_type == "blogPost" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    publishedAt,
    author,
    mainImage { asset, alt },
    excerpt,
    body
  }
`;

export const FAQ_ITEMS_QUERY = groq`
  *[_type == "faqItem"] | order(category asc, order asc, question asc) {
    _id,
    question,
    answer,
    category,
    order
  }
`;
