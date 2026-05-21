export interface BlogPost {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  author: string;
  mainImage?: {
    asset: { _ref: string };
    alt: string;
  };
  excerpt: string;
  body?: unknown[];
}
