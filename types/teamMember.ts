export interface TeamMember {
  _id: string;
  name: string;
  role: string;
  bio: string;
  photo?: {
    asset: { _ref: string };
    alt?: string;
  };
  order?: number;
}
