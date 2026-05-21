export interface Testimonial {
  _id: string;
  quote: string;
  author: string;
  program?: string;
  graduationYear?: string;
  isActive?: boolean;
}
