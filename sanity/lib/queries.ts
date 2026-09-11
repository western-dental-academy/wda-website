import { groq } from "next-sanity";

export const PROGRAMS_QUERY = groq`
  *[_type == "program" && !(_id in path("drafts.**")) && isActive != false] | order(_createdAt asc) {
    _id,
    title,
    slug,
    description,
    duration,
    cost
  }
`;

export const PROGRAM_BY_SLUG_QUERY = groq`
  *[_type == "program" && !(_id in path("drafts.**")) && slug.current == $slug][0] {
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
  *[_type == "teamMember" && !(_id in path("drafts.**"))] | order(order asc, name asc) {
    _id,
    name,
    role,
    bio,
    photo { asset->, hotspot, crop, alt },
    order
  }
`;

export const TESTIMONIALS_QUERY = groq`
  *[_type == "testimonial" && !(_id in path("drafts.**")) && isActive != false] | order(graduationYear desc) {
    _id,
    quote,
    author,
    program,
    graduationYear
  }
`;

export const BLOG_POSTS_QUERY = groq`
  *[_type == "blogPost" && !(_id in path("drafts.**")) && defined(publishedAt)] | order(publishedAt desc) {
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
  *[_type == "blogPost" && !(_id in path("drafts.**")) && slug.current == $slug][0] {
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
  *[_type == "faqItem" && !(_id in path("drafts.**"))] | order(category asc, order asc, question asc) {
    _id,
    question,
    answer,
    category,
    order
  }
`;
