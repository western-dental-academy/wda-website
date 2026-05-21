export interface Program {
  _id: string;
  title: string;
  slug: { current: string };
  description: string;
  duration: string;
  cost: string;
  image?: {
    asset: { _ref: string };
    alt?: string;
  };
  highlights?: string[];
  isActive?: boolean;
}
